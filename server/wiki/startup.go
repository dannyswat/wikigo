package wiki

import (
	"log"
	"time"

	"github.com/dannyswat/wikigo/filemanager"
	"github.com/dannyswat/wikigo/keymgmt"
	"github.com/dannyswat/wikigo/pages"
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

	dbManager     DBManager
	userService   *users.UserService
	pageService   *pages.PageService
	keyStore      *keymgmt.KeyMgmtService
	htmlPolicy    *bluemonday.Policy
	fileManager   filemanager.FileManager
	pageHandler   *handlers.PageHandler
	authHandler   *handlers.AuthHandler
	uploadHandler *handlers.UploadHandler
	jwt           *middlewares.JWT
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
			IsLockedOut: false,
			CreatedAt:   time.Now(),
		}
		adminUser.UpdatePassword("PleaseChange")
		s.dbManager.Users().CreateUser(adminUser)
	}

	s.userService = &users.UserService{DB: s.dbManager.Users()}
	s.pageService = &pages.PageService{DB: s.dbManager.Pages()}
	s.keyStore = &keymgmt.KeyMgmtService{DB: s.dbManager.Keys()}
	err = s.keyStore.Init()
	if err != nil {
		return err
	}
	logIfError(s.keyStore.GenerateECKeyPairIfNotExist("login"))
	logIfError(s.keyStore.GenerateECKeyPairIfNotExist("changepassword"))
	logIfError(s.keyStore.GenerateECKeyPairIfNotExist("auth"))
	s.htmlPolicy = bluemonday.UGCPolicy()
	s.fileManager, err = filemanager.NewFileManager(s.MediaPath, []string{".exe", ".bat", ".sh"}, "5MB")
	if err != nil {
		return err
	}
	s.fileManager.Init()

	return nil
}

func (s *WikiStartUp) RegisterHandlers(e *echo.Echo) {
	s.pageHandler = &handlers.PageHandler{PageService: s.pageService, HtmlPolicy: s.htmlPolicy}
	s.authHandler = &handlers.AuthHandler{UserService: s.userService, KeyStore: s.keyStore}
	s.uploadHandler = &handlers.UploadHandler{FileManager: s.fileManager}

	s.jwt = &middlewares.JWT{KeyStore: s.keyStore}
	e.Use(s.jwt.AuthMiddleware())

	e.GET(s.BaseRoute+"/page/:id", s.pageHandler.GetPageByID)
	e.GET(s.BaseRoute+"/page/url/:url", s.pageHandler.GetPageByUrl)
	e.GET(s.BaseRoute+"/pages/list", s.pageHandler.GetPagesByParentID)
	e.GET(s.BaseRoute+"/pages/list/:id", s.pageHandler.GetPagesByParentID)
	e.GET(s.BaseRoute+"/pages/listall", s.pageHandler.GetAllPages)

	admin := e.Group(s.BaseRoute + "/admin")
	admin.Use(middlewares.AuthorizeMiddleware())
	admin.POST("/pages", s.pageHandler.CreatePage)
	admin.PUT("/pages/:id", s.pageHandler.UpdatePage)
	admin.DELETE("/pages/:id", s.pageHandler.DeletePage)
	admin.POST("/upload", s.uploadHandler.UploadFile)
	admin.POST("/ckeditor/upload", s.uploadHandler.CKEditorUpload)
	admin.POST("/createpath", s.uploadHandler.CreatePath)
	admin.POST("/user/changepassword", s.authHandler.ChangePassword)

	e.POST(s.BaseRoute+"/auth/login", s.authHandler.Login)
	e.GET(s.BaseRoute+"/auth/publickey/:id", s.authHandler.GetPublicKey)

}

func logIfError(err error) {
	if err != nil {
		log.Println(err)
	}
}
