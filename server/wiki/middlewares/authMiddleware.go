package middlewares

import (
	"github.com/dannyswat/wikigo/common/apihelper"
	"github.com/dannyswat/wikigo/common/errors"
	"github.com/dannyswat/wikigo/keymgmt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type JWT struct {
	KeyStore *keymgmt.KeyMgmtService
}

func (j *JWT) AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(e echo.Context) error {
			user, err := e.Cookie("user")
			if err != nil {
				return next(e)
			}
			accessToken, err := e.Cookie("token")
			if err != nil {
				return next(e)
			}
			token, err := j.KeyStore.VerifyJWT(accessToken.Value, "auth")
			if err != nil || !token.Valid || user.Value != apihelper.GetUserIdFromToken(token) {
				return next(e)
			}
			e.Set("user", user.Value)
			e.Set("token", token)
			return next(e)
		}
	}
}

func (j *JWT) ParseToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return j.KeyStore.GetPublicKey("auth")
	})
}

func AuthorizeMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(e echo.Context) error {
			token := e.Get("token").(*jwt.Token)
			if !token.Valid {
				return &errors.ForbiddenError{Message: "unauthorized to access the resource"}
			}
			return next(e)
		}
	}
}
