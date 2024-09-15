package main

import (
	"os"

	"github.com/dannyswat/wikigo/wiki"
	"github.com/dannyswat/wikigo/wiki/middlewares"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	wiki := &wiki.WikiStartUp{
		DataPath:  "data",
		BaseRoute: "/api",
		MediaPath: "media",
	}
	if err := wiki.Setup(); err != nil {
		panic(err)
	}

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Gzip())
	e.Use(middleware.Recover())
	e.Static("/media", wiki.MediaPath)
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       "public",
		Skipper:    nil,
		Index:      "index.html",
		Browse:     false,
		HTML5:      true,
		IgnoreBase: false,
		Filesystem: nil,
	}))
	e.Use(middlewares.ErrorMiddleware())
	wiki.RegisterHandlers(e)
	e.GET("*", func(c echo.Context) error {
		return c.File("public/index.html")
	})
	port := "localhost:3001"
	if os.Getenv("PORT") != "" {
		port = ":" + os.Getenv("PORT")
	}
	e.Logger.Fatal(e.Start(port))
}
