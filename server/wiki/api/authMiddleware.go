package api

import (
	"github.com/dannyswat/wikigo/security"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type JWT struct {
	KeyStore security.KeyStore
}

func (j *JWT) AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
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
		if err != nil || !token.Valid || user.Value != GetUserIdFromToken(token) {
			return next(e)
		}
		e.Set("user", user.Value)
		e.Set("token", token)
		return next(e)
	}
}

func (j *JWT) ParseToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return j.KeyStore.GetPublicKey("auth")
	})
}
