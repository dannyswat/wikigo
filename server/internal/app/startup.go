package wiki

import (
	"errors"
	"log"
	"os"
	"path/filepath"

	"wikigo/internal/app/handlers"
	"wikigo/internal/app/middlewares"
	"wikigo/internal/common/caching"
	"wikigo/internal/filemanager"
	"wikigo/internal/keymgmt"
	"wikigo/internal/pages"
	"wikigo/internal/revisions"
	"wikigo/internal/setting"
	"wikigo/internal/users"

	"github.com/go-playground/validator/v10"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
)

type WikiStartUp struct {
	DataPath  string
	MediaPath string
	BaseRoute string

	dbManager            DBManager
	userService          *users.UserService
	pageService          *pages.PageService
	keyStore             *keymgmt.KeyMgmtService
	pageRevisionService  *revisions.RevisionService[*pages.Page]
	searchService        *pages.SearchService
	settingService       *setting.SettingService
	htmlPolicy           *bluemonday.Policy
	fileManager          filemanager.FileManager
	pageHandler          *handlers.PageHandler
	authHandler          *handlers.AuthHandler
	fido2Handler         *handlers.Fido2Handler
	uploadHandler        *handlers.UploadHandler
	usersHandler         *handlers.UsersHandler
	settingHandler       *handlers.SettingHandler
	jwt                  *middlewares.JWT
	reactPage            *pages.ReactPageMeta
	validator            *validator.Validate
	settingCache         *caching.SimpleCache[*setting.Setting]
	securitySettingCache *caching.SimpleCache[*setting.SecuritySetting]
}

var (
	ErrSetupIncomplete = errors.New("setup is not complete")
)

func (s *WikiStartUp) Setup() error {
	s.dbManager = NewDBManager(s.DataPath)
	if err := s.dbManager.Init(); err != nil {
		return err
	}
	adminUser, err := s.dbManager.Users().GetUserByUserName("admin")
	if err != nil {
		panic(err)
	}
	siteSetting, err := s.dbManager.Settings().GetSetting()
	if err != nil {
		panic(err)
	}
	isAdminSetup := adminUser != nil
	isSiteSetup := siteSetting != nil

	s.securitySettingCache = caching.NewSimpleCache[*setting.SecuritySetting]()
	s.settingCache = caching.NewSimpleCache[*setting.Setting]()
	s.settingCache.Set(siteSetting)

	s.userService = &users.UserService{
		DB:       s.dbManager.Users(),
		DeviceDB: s.dbManager.UserDevices(),
	}
	s.settingService = &setting.SettingService{
		DB:            s.dbManager.Settings(),
		Cache:         s.settingCache,
		SecurityCache: s.securitySettingCache,
	}

	s.validator = validator.New()

	if !isAdminSetup || !isSiteSetup {
		log.Println("Wiki setup is incomplete. Please run the setup handlers.")
		return ErrSetupIncomplete
	}

	s.keyStore = &keymgmt.KeyMgmtService{DB: s.dbManager.Keys()}
	s.pageRevisionService = &revisions.RevisionService[*pages.Page]{Repository: s.dbManager.PageRevisions()}
	s.searchService = &pages.SearchService{
		PageRepository:           s.dbManager.Pages(),
		SearchTermListRepository: s.dbManager.SearchTerms(),
	}
	s.pageService = &pages.PageService{
		DB:              s.dbManager.Pages(),
		RevisionService: s.pageRevisionService,
		SearchService:   s.searchService,
	}

	err = s.keyStore.Init()
	if err != nil {
		return err
	}
	logIfError(s.keyStore.GenerateECKeyPairIfNotExist("login"))
	logIfError(s.keyStore.GenerateECKeyPairIfNotExist("changepassword"))
	logIfError(s.keyStore.GenerateECKeyPairIfNotExist("auth"))
	s.htmlPolicy = pages.CreateHtmlPolicy()
	s.fileManager, err = filemanager.NewFileManager(s.MediaPath, []string{".exe", ".bat", ".sh"}, "5MB")
	if err != nil {
		return err
	}
	s.fileManager.Init()
	reactFile, err := os.ReadFile(filepath.FromSlash("public/index.html"))
	if err == nil {
		s.reactPage = pages.GetReactPageMeta(string(reactFile))
	}

	return nil
}

func (s *WikiStartUp) RegisterSetupHandlers(e *echo.Echo, isSetupComplete bool) {
	setupHandler := handlers.NewSetupHandler(s.settingService, s.userService)
	e.GET("/api/setup/setting", setupHandler.GetSetting)
	if !isSetupComplete {
		e.POST("/api/setup/admin", setupHandler.CreateAdmin)
		e.POST("/api/setup/complete", setupHandler.CreateSetting)
	}

	e.Validator = &handlers.CustomValidator{Validator: s.validator}
}

func (s *WikiStartUp) RegisterHandlers(e *echo.Echo) {
	s.pageHandler = &handlers.PageHandler{
		PageService:         s.pageService,
		SearchService:       s.searchService,
		HtmlPolicy:          s.htmlPolicy,
		PageRevisionService: s.pageRevisionService,
		ReactPage:           s.reactPage,
	}
	s.authHandler = &handlers.AuthHandler{UserService: s.userService, KeyStore: s.keyStore}

	// Initialize WebAuthn
	wconfig := &webauthn.Config{
		RPDisplayName: "WikiGo",
		RPID:          "localhost",                                                // Change this to your domain in production
		RPOrigins:     []string{"http://localhost:3000", "http://localhost:8080"}, // Change this to your URL in production
	}

	webAuthn, err := webauthn.New(wconfig)
	if err != nil {
		log.Fatalf("Failed to initialize WebAuthn: %v", err)
	}

	s.fido2Handler = &handlers.Fido2Handler{
		UserService:  s.userService,
		WebAuthn:     webAuthn,
		KeyStore:     s.keyStore,
		SessionStore: handlers.NewSessionStore(),
	}

	s.uploadHandler = &handlers.UploadHandler{FileManager: s.fileManager}
	s.usersHandler = &handlers.UsersHandler{UserService: s.userService}
	s.settingHandler = &handlers.SettingHandler{SettingService: s.settingService}

	e.Validator = &handlers.CustomValidator{Validator: s.validator}

	s.jwt = &middlewares.JWT{KeyStore: s.keyStore}
	e.Use(middlewares.NewSecurityMiddleware(s.settingService).EchoSecurityMiddleware())
	e.Use(s.jwt.AuthMiddleware())

	e.GET("/p/:id", s.pageHandler.Page)
	api := e.Group(s.BaseRoute)
	content := api.Group("")
	if setting, ok := s.settingCache.Get(); ok && setting != nil && setting.IsSiteProtected {
		content.Use(middlewares.AuthorizeMiddleware())
	}
	content.GET("/page/:id", s.pageHandler.GetPageByID)
	content.GET("/page/url/:url", s.pageHandler.GetPageByUrl)
	content.GET("/pages/list", s.pageHandler.GetPagesByParentID)
	content.GET("/pages/list/:id", s.pageHandler.GetPagesByParentID)
	content.GET("/pages/listall", s.pageHandler.GetAllPages)
	content.GET("/pages/search", s.pageHandler.SearchPages)

	editor := api.Group("/editor")
	editor.Use(middlewares.EditorMiddleware())
	editor.POST("/pages", s.pageHandler.CreatePage)
	editor.PUT("/pages/:id", s.pageHandler.UpdatePage)
	editor.DELETE("/pages/:id", s.pageHandler.DeletePage)
	editor.GET("/pagerevision/:id", s.pageHandler.GetLatestRevision)
	editor.POST("/upload", s.uploadHandler.UploadFile)
	editor.POST("/ckeditor/upload", s.uploadHandler.CKEditorUpload)
	editor.POST("/createpath", s.uploadHandler.CreatePath)
	editor.POST("/diagram/upload", s.uploadHandler.SaveDiagram)
	editor.GET("/diagram/source/:id", s.uploadHandler.GetDiagramSource)

	admin := api.Group("/admin")
	admin.Use(middlewares.AdminMiddleware())
	admin.GET("/users", s.usersHandler.GetUsers)
	admin.GET("/users/:id", s.usersHandler.GetUser)
	admin.POST("/users", s.usersHandler.CreateUser)
	admin.PUT("/users/:id", s.usersHandler.UpdateUser)
	admin.POST("/pages/rebuildsearch", s.pageHandler.RebuildSearchIndex)

	api.GET("/setting", s.settingHandler.GetSetting)
	api.GET("/securitysetting", s.settingHandler.GetSecuritySetting)
	admin.POST("/setting", s.settingHandler.UpdateSetting)
	admin.POST("/securitysetting", s.settingHandler.UpdateSecuritySetting)

	users := api.Group("/user")
	users.Use(middlewares.AuthorizeMiddleware())
	users.GET("/me", s.usersHandler.GetCurrentUser)
	users.GET("/role", s.authHandler.GetRole)
	users.POST("/changepassword", s.authHandler.ChangePassword)

	// FIDO2/WebAuthn routes for authenticated users
	users.POST("/passkey/begin-register", s.fido2Handler.BeginRegistration)
	users.POST("/passkey/finish-register", s.fido2Handler.FinishRegistration)
	users.GET("/passkey/devices", s.fido2Handler.GetUserDevices)
	users.DELETE("/passkey/devices/:id", s.fido2Handler.DeleteDevice)

	api.POST("/auth/login", s.authHandler.Login)
	api.GET("/auth/publickey/:id", s.authHandler.GetPublicKey)
	api.POST("/auth/logout", s.authHandler.Logout)

	// FIDO2/WebAuthn public routes
	api.POST("/auth/passkey/begin-login", s.fido2Handler.BeginLogin)
	api.POST("/auth/passkey/finish-login", s.fido2Handler.FinishLogin)
}

func logIfError(err error) {
	if err != nil {
		log.Println(err)
	}
}
