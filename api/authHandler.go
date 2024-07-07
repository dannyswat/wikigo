package api

import (
	"encoding/base64"
	"encoding/json"
	"time"

	"github.com/dannyswat/wikigo/security"
	"github.com/dannyswat/wikigo/users"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	UserService users.UserService
	KeyStore    security.KeyStore
}

type LoginRequest struct {
	UserName string `json:"userName" validate:"required,max=50"`
	Password string `json:"password" validate:"required"`
	Key      string `json:"key" validate:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func (h *AuthHandler) Login(e echo.Context) error {
	req := new(LoginRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	if err := validator.New().Struct(req); err != nil {
		return e.JSON(400, "invalid request")
	}
	pwdBytes, err := base64.StdEncoding.DecodeString(req.Password)
	if err != nil {
		return e.JSON(401, "invalid username or password")
	}
	keyBytes, err := base64.StdEncoding.DecodeString(req.Key)
	if err != nil {
		return e.JSON(401, "invalid username or password")
	}
	password, err := h.KeyStore.Decrypt("login", pwdBytes, keyBytes)
	if err != nil {
		return e.JSON(401, "invalid username or password")
	}

	user, err := h.UserService.Login(req.UserName, string(password))
	if err != nil {
		return e.JSON(401, err)
	}
	token := jwt.NewWithClaims(jwt.SigningMethodES256, jwt.MapClaims{
		"uid": user.UserName,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})
	jsonToken, err := json.Marshal(token)
	if err != nil {
		return e.JSON(500, err)
	}
	signedToken, err := h.KeyStore.Sign("auth", jsonToken)
	if err != nil {
		return e.JSON(500, err)
	}
	return e.JSON(200, &LoginResponse{Token: base64.StdEncoding.EncodeToString(signedToken)})
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" validate:"required"`
	NewPassword     string `json:"newPassword" validate:"required"`
	Key             string `json:"key" validate:"required"`
}

func (h *AuthHandler) ChangePassword(e echo.Context) error {
	req := new(ChangePasswordRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	if err := validator.New().Struct(req); err != nil {
		return e.JSON(400, "invalid request")
	}
	pwdBytes, err := base64.StdEncoding.DecodeString(req.CurrentPassword)
	if err != nil {
		return e.JSON(401, "invalid password")
	}
	keyBytes, err := base64.StdEncoding.DecodeString(req.Key)
	if err != nil {
		return e.JSON(401, "invalid password")
	}
	password, err := h.KeyStore.Decrypt("login", pwdBytes, keyBytes)
	if err != nil {
		return e.JSON(401, "invalid password")
	}
	newPwdBytes, err := base64.StdEncoding.DecodeString(req.NewPassword)
	if err != nil {
		return e.JSON(401, "invalid password")
	}
	keyBytes, err = base64.StdEncoding.DecodeString(req.Key)
	if err != nil {
		return e.JSON(401, "invalid password")
	}
	newPassword, err := h.KeyStore.Decrypt("changepassword", newPwdBytes, keyBytes)
	if err != nil {
		return e.JSON(401, "invalid password")
	}

	token := e.Get("token").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	username := claims["uid"].(string)
	err = h.UserService.ChangePassword(username, string(password), string(newPassword))
	if err != nil {
		return e.JSON(401, err)
	}
	return e.JSON(200, "password updated")
}
