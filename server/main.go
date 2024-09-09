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
	}
	if err := wiki.Setup(); err != nil {
		panic(err)
	}

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Gzip())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderSetCookie},
	}))
	e.Use(middlewares.ErrorMiddleware())

	wiki.RegisterHandlers(e)

	port := "localhost:3001"
	if os.Getenv("PORT") != "" {
		port = ":" + os.Getenv("PORT")
	}
	e.Logger.Fatal(e.Start(port))
}
