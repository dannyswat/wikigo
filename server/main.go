package main

import (
	"os"
	"time"

	"github.com/dannyswat/wikigo/pages"
	"github.com/dannyswat/wikigo/security"
	"github.com/dannyswat/wikigo/users"
	"github.com/dannyswat/wikigo/wiki"
	"github.com/dannyswat/wikigo/wiki/api"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/microcosm-cc/bluemonday"
)

func main() {
	dbManager := wiki.NewDBManager("data")
	dbManager.Init()
	adminUser, err := dbManager.Users().GetUserByUserName("admin")
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
		dbManager.Users().CreateUser(adminUser)
	}

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Gzip())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
	}))
	e.Use(middleware.Recover())

	userService := &users.UserService{DB: dbManager.Users()}
	pageService := &pages.PageService{DB: dbManager.Pages()}
	keyStore := security.NewKeyStore("data/keys")
	keyStore.Init()
	keyStore.GenerateECKeyPair("login")
	keyStore.GenerateECKeyPair("changepassword")
	htmlPolicy := bluemonday.UGCPolicy()

	pageHandler := &api.PageHandler{PageService: *pageService, HtmlPolicy: *htmlPolicy}
	e.GET("/page/:id", pageHandler.GetPageByID)
	e.POST("/admin/pages", pageHandler.CreatePage)
	e.PATCH("/admin/pages/:id", pageHandler.UpdatePage)
	e.DELETE("/admin/pages/:id", pageHandler.DeletePage)

	authHandler := &api.AuthHandler{UserService: *userService, KeyStore: keyStore}
	e.GET("/auth/publickey/:id", authHandler.GetPublicKey)
	e.POST("/auth/login", authHandler.Login)
	e.POST("/user/changepassword", authHandler.ChangePassword)

	port := ":3001"
	if os.Getenv("PORT") != "" {
		port = ":" + os.Getenv("PORT")
	}
	e.Logger.Fatal(e.Start(port))
}
