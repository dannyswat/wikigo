package main

import (
	"html/template"
	"os"

	"github.com/dannyswat/wikigo/wiki"
	"github.com/dannyswat/wikigo/wiki/handlers"
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
	e.Renderer = &handlers.Template{
		Templates: template.Must(template.ParseGlob("views/*.html")),
	}
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
	port := os.Getenv("PORT")
	if port == "" {
		port = os.Getenv("SERVER_PORT")
	}
	if port == "" {
		port = os.Getenv("HTTP_PLATFORM_PORT")
	}
	if port == "" {
		port = "8080"
	}

	e.Logger.Printf("Server started at port %s", port)
	e.Logger.Fatal(e.Start(":" + port))
}
