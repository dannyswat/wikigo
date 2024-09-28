package wiki

import (
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/dannyswat/wikigo/filemanager"
	"github.com/dannyswat/wikigo/keymgmt"
	"github.com/dannyswat/wikigo/pages"
	"github.com/dannyswat/wikigo/revisions"
	"github.com/dannyswat/wikigo/users"
	"github.com/dannyswat/wikigo/wiki/handlers"
	"github.com/dannyswat/wikigo/wiki/middlewares"
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
	htmlPolicy          *bluemonday.Policy
	fileManager         filemanager.FileManager
	pageHandler         *handlers.PageHandler
	authHandler         *handlers.AuthHandler
	uploadHandler       *handlers.UploadHandler
	usersHandler        *handlers.UsersHandler
	jwt                 *middlewares.JWT
	reactPage           *pages.ReactPageMeta
}

func (s *WikiStartUp) Setup() error {
	s.dbManager = NewDBManager(s.DataPath)
	if err := s.dbManager.Init(); err != nil {
		return err
	}
	adminUser, err := s.dbManager.Users().GetUserByUserName("admin")
	if err != nil {
		panic(err)
	}
	if adminUser == nil {
		adminUser = &users.User{
			UserName:    "admin",
			Email:       "dhlwat@live.com",
			Role:        "admin",
			IsLockedOut: false,
			CreatedAt:   time.Now(),
		}
		adminUser.UpdatePassword("PleaseChange")
		s.dbManager.Users().CreateUser(adminUser)
	}
	if adminUser.Role == "" {
		adminUser.Role = "admin"
		s.dbManager.Users().UpdateUser(adminUser)
	}

	s.userService = &users.UserService{DB: s.dbManager.Users()}
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

	admin := api.Group("/admin")
	admin.Use(middlewares.AdminMiddleware())
	admin.GET("/users", s.usersHandler.GetUsers)
	admin.GET("/users/:id", s.usersHandler.GetUser)
	admin.POST("/users", s.usersHandler.CreateUser)
	admin.PUT("/users/:id", s.usersHandler.UpdateUser)

	users := api.Group("/user")
	users.Use(middlewares.AuthorizeMiddleware())
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
