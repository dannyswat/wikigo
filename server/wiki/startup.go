package wiki

import (
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
	if adminUser != nil {
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
	s.keyStore.Init()
	s.keyStore.GenerateECKeyPair("login")
	s.keyStore.GenerateECKeyPair("changepassword")
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

	jwt := middlewares.JWT{KeyStore: s.keyStore}
	e.Use(jwt.AuthMiddleware())

	e.GET(s.BaseRoute+"/page/:id", s.pageHandler.GetPageByID)
	e.POST(s.BaseRoute+"/admin/pages", s.pageHandler.CreatePage)
	e.PUT(s.BaseRoute+"/admin/pages/:id", s.pageHandler.UpdatePage)
	e.DELETE(s.BaseRoute+"/admin/pages/:id", s.pageHandler.DeletePage)

	e.POST(s.BaseRoute+"/auth/login", s.authHandler.Login)
	e.GET(s.BaseRoute+"/auth/publickey/:id", s.authHandler.GetPublicKey)
	e.POST(s.BaseRoute+"/user/changepassword", s.authHandler.ChangePassword)

	e.POST(s.BaseRoute+"/upload", s.uploadHandler.UploadFile)
	e.POST(s.BaseRoute+"/createpath", s.uploadHandler.CreatePath)

}
