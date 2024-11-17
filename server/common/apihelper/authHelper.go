package apihelper

import (
	"net/http"
	"time"

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

func GetUserIdAndRole(e echo.Context) (string, string) {
	tokenObj := e.Get("token")
	if tokenObj == nil {
		return "", ""
	}
	token := tokenObj.(*jwt.Token)
	if token == nil {
		return "", ""
	}
	return GetUserIdAndRoleFromToken(token)
}

func GetUserIdFromToken(token *jwt.Token) string {
	claims := token.Claims.(jwt.MapClaims)
	if claims == nil {
		return ""
	}
	uid := claims["uid"]
	if uid == nil {
		return ""
	}
	return uid.(string)
}

func GetUserIdAndRoleFromToken(token *jwt.Token) (string, string) {
	claims := token.Claims.(jwt.MapClaims)
	uid := claims["uid"]
	if uid == nil {
		return "", ""
	}
	role := claims["scope"]
	if role == nil {
		return uid.(string), ""
	}
	return uid.(string), role.(string)
}

func RemoveAuthCookie(e echo.Context) {
	e.SetCookie(&http.Cookie{
		Name:     "user",
		Value:    "",
		Expires:  time.Now(),
		SameSite: http.SameSiteDefaultMode,
		Path:     "/",
	})
	e.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now(),
		SameSite: http.SameSiteDefaultMode,
		HttpOnly: true,
		Path:     "/",
	})
}
