package apihelper

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func GetUserId(e echo.Context) string {
	tokenObj := e.Get("token")
	if tokenObj == nil {
		return ""
	}
	token := tokenObj.(*jwt.Token)
	if token == nil {
		return ""
	}
	return GetUserIdFromToken(token)
}

func GetUserIdFromToken(token *jwt.Token) string {
	claims := token.Claims.(jwt.MapClaims)
	uid := claims["uid"]
	if uid == nil {
		return ""
	}
	return uid.(string)
}
