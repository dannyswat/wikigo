package wiki

import (
	"errors"
	"log"
	"os"
	"path/filepath"

	"wikigo/internal/app/handlers"
	"wikigo/internal/app/middlewares"
	"wikigo/internal/filemanager"
	"wikigo/internal/keymgmt"
	"wikigo/internal/pages"
	"wikigo/internal/revisions"
	"wikigo/internal/setting"
	"wikigo/internal/users"

	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
)

type WikiStartUp struct {
	DataPath  string
	MediaPath string
	BaseRoute string

	dbManager           DBManager
	userService         *users.UserService
	pageService         *pages.PageService
	keyStore            *keymgmt.KeyMgmtService
	pageRevisionService *revisions.RevisionService[*pages.Page]
	settingService      *setting.SettingService
	htmlPolicy          *bluemonday.Policy
	fileManager         filemanager.FileManager
	pageHandler         *handlers.PageHandler
	authHandler         *handlers.AuthHandler
	uploadHandler       *handlers.UploadHandler
	usersHandler        *handlers.UsersHandler
	settingHandler      *handlers.SettingHandler
	jwt                 *middlewares.JWT
	reactPage           *pages.ReactPageMeta
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

	s.userService = &users.UserService{DB: s.dbManager.Users()}
	s.settingService = &setting.SettingService{DB: s.dbManager.Settings()}

	if !isAdminSetup || !isSiteSetup {
		log.Println("Wiki setup is incomplete. Please run the setup handlers.")
		return ErrSetupIncomplete
	}

	s.keyStore = &keymgmt.KeyMgmtService{DB: s.dbManager.Keys()}
	s.pageRevisionService = &revisions.RevisionService[*pages.Page]{Repository: s.dbManager.PageRevisions()}
	s.pageService = &pages.PageService{DB: s.dbManager.Pages(), RevisionService: s.pageRevisionService}

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
}

func (s *WikiStartUp) RegisterHandlers(e *echo.Echo) {
	s.pageHandler = &handlers.PageHandler{
		PageService:         s.pageService,
		HtmlPolicy:          s.htmlPolicy,
		PageRevisionService: s.pageRevisionService,
		ReactPage:           s.reactPage,
	}
	s.authHandler = &handlers.AuthHandler{UserService: s.userService, KeyStore: s.keyStore}
	s.uploadHandler = &handlers.UploadHandler{FileManager: s.fileManager}
	s.usersHandler = &handlers.UsersHandler{UserService: s.userService}
	s.settingHandler = &handlers.SettingHandler{SettingService: s.settingService}

	s.jwt = &middlewares.JWT{KeyStore: s.keyStore}
	e.Use(s.jwt.AuthMiddleware())

	e.GET("/p/:id", s.pageHandler.Page)
	api := e.Group(s.BaseRoute)
	api.GET("/page/:id", s.pageHandler.GetPageByID)
	api.GET("/page/url/:url", s.pageHandler.GetPageByUrl)
	api.GET("/pages/list", s.pageHandler.GetPagesByParentID)
	api.GET("/pages/list/:id", s.pageHandler.GetPagesByParentID)
	api.GET("/pages/listall", s.pageHandler.GetAllPages)

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

	api.GET("/setting", s.settingHandler.GetSetting)
	api.GET("/securitysetting", s.settingHandler.GetSecuritySetting)
	admin.POST("/setting", s.settingHandler.UpdateSetting)
	admin.POST("/securitysetting", s.settingHandler.UpdateSecuritySetting)

	users := api.Group("/user")
	users.Use(middlewares.AuthorizeMiddleware())
	users.GET("/me", s.usersHandler.GetCurrentUser)
	users.GET("/role", s.authHandler.GetRole)
	users.POST("/changepassword", s.authHandler.ChangePassword)

	api.POST("/auth/login", s.authHandler.Login)
	api.GET("/auth/publickey/:id", s.authHandler.GetPublicKey)
	api.POST("/auth/logout", s.authHandler.Logout)
}

func logIfError(err error) {
	if err != nil {
		log.Println(err)
	}
}
