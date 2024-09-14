package handlers

import (
	"encoding/base64"
	stderrors "errors"
	"log"
	"net/http"
	"time"

	"github.com/dannyswat/wikigo/common/errors"
	"github.com/dannyswat/wikigo/keymgmt"
	"github.com/dannyswat/wikigo/users"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	UserService *users.UserService
	KeyStore    *keymgmt.KeyMgmtService
}

type PublicKeyResponse struct {
	Key       string `json:"key"`
	Timestamp string `json:"timestamp"`
}

func (h *AuthHandler) GetPublicKey(e echo.Context) error {
	purpose := e.Param("id")
	if purpose == "" {
		return e.JSON(400, "invalid request")
	}
	if purpose != "login" && purpose != "changepassword" {
		return e.JSON(400, "invalid request")
	}
	key, err := h.KeyStore.GetPublicKeyForEncryption(purpose)
	if err != nil {
		return e.JSON(500, err)
	}
	return e.JSON(200, &PublicKeyResponse{
		Key:       base64.StdEncoding.EncodeToString(key),
		Timestamp: time.Now().Format("20060102150405"),
	})
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
	passwordWithTime, err := h.KeyStore.Decrypt("login", pwdBytes, keyBytes)
	if err != nil {
		return e.JSON(401, "invalid username or password")
	}
	timestamp, password := string(passwordWithTime[:14]), string(passwordWithTime[14:])
	pwdTime, err := time.Parse("20060102150405", timestamp)
	if err != nil || pwdTime.Add(time.Minute*5).Before(time.Now()) {
		return e.JSON(401, "invalid username or password")
	}

	user, err := h.UserService.Login(req.UserName, password)
	if err != nil {
		return e.JSON(401, err)
	}
	tokenExpiry := time.Now().Add(time.Hour * 24)
	signedToken, err := h.KeyStore.SignJWT(jwt.MapClaims{
		"uid": user.UserName,
		"iat": time.Now().Unix(),
		"exp": tokenExpiry.Unix(),
	}, "auth")

	if err != nil {
		return e.JSON(500, err)
	}
	e.SetCookie(&http.Cookie{
		Name:     "user",
		Value:    user.UserName,
		Expires:  tokenExpiry,
		SameSite: http.SameSiteDefaultMode,
		Path:     "/",
	})
	e.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    signedToken,
		Expires:  tokenExpiry,
		SameSite: http.SameSiteDefaultMode,
		HttpOnly: true,
		Path:     "/",
	})
	return e.JSON(200, &LoginResponse{Token: signedToken})
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
		return errors.NewValidationError("invalid request", "")
	}
	pwdBytes, err := base64.StdEncoding.DecodeString(req.CurrentPassword)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid password"}
	}
	keyBytes, err := base64.StdEncoding.DecodeString(req.Key)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid password"}
	}
	password, err := h.KeyStore.Decrypt("login", pwdBytes, keyBytes)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid password"}
	}
	newPwdBytes, err := base64.StdEncoding.DecodeString(req.NewPassword)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid new password"}
	}
	keyBytes, err = base64.StdEncoding.DecodeString(req.Key)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid new password"}
	}
	newPassword, err := h.KeyStore.Decrypt("changepassword", newPwdBytes, keyBytes)
	if err != nil {
		return errors.NewValidationError("invalid new password", "newPassword")
	}

	token := e.Get("token").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	username := claims["uid"].(string)
	err = h.UserService.ChangePassword(username, string(password), string(newPassword))
	if err != nil {
		log.Println(err)
		return stderrors.New("failed to change password")
	}
	return e.JSON(200, "password updated")
}
