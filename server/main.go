package main

import (
	"time"

	"github.com/dannyswat/wikigo/pages"
	"github.com/dannyswat/wikigo/security"
	"github.com/dannyswat/wikigo/users"
	"github.com/dannyswat/wikigo/wiki"
	"github.com/dannyswat/wikigo/wiki/api"
	"github.com/labstack/echo/v4"
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

	userService := &users.UserService{DB: dbManager.Users()}
	pageService := &pages.PageService{DB: dbManager.Pages()}
	keyStore := security.NewKeyStore("data/keys")
	htmlPolicy := bluemonday.UGCPolicy()
	authHandler := &api.AuthHandler{UserService: *userService, KeyStore: keyStore}
	pageHandler := &api.PageHandler{PageService: *pageService, HtmlPolicy: *htmlPolicy}
	e.GET("/page/:id", pageHandler.GetPageByID)
	e.POST("/admin/pages", pageHandler.CreatePage)
	e.PATCH("/admin/pages/:id", pageHandler.UpdatePage)
	e.DELETE("/admin/pages/:id", pageHandler.DeletePage)
	e.POST("/auth/login", authHandler.Login)
	e.POST("/user/changepassword", authHandler.ChangePassword)

	e.Logger.Fatal(e.Start(":8080"))
}
