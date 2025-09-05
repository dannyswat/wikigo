package apihelper

import (
	"github.com/labstack/echo/v4"
)

func OkMessage(e echo.Context, m string) error {
	return e.JSON(200, map[string]string{"message": m})
}
