package api

import (
	"github.com/dannyswat/wikigo/common"
	"github.com/dannyswat/wikigo/users"
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

func GetErrorStatus(err error) int {
	switch err.(type) {
	case *users.UnauthorizedError:
		return 401
	case *common.ValidationError:
		return 400
	default:
		return 500
	}
}
