package apihelper

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func GetUserId(e echo.Context) string {
	token := e.Get("token").(*jwt.Token)
	return GetUserIdFromToken(token)
}

func GetUserIdFromToken(token *jwt.Token) string {
	claims := token.Claims.(jwt.MapClaims)
	return claims["uid"].(string)
}
