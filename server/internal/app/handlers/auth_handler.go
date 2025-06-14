package handlers

import (
	"encoding/base64"
	stderrors "errors"
	"log"
	"net/http"
	"sync"
	"time"

	"wikigo/internal/common/apihelper"
	"wikigo/internal/common/errors"
	"wikigo/internal/keymgmt"
	"wikigo/internal/users"

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

var loginAttemptMutex sync.Mutex
var lastLoginAttempt = make(map[string]time.Time)

func (h *AuthHandler) Login(e echo.Context) error {
	req := new(LoginRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	if err := validator.New().Struct(req); err != nil {
		return e.JSON(400, apihelper.NewInvalidRequestError("invalid request"))
	}
	// Rate limit: allow login for each username every 2 seconds
	loginAttemptMutex.Lock()
	last, exists := lastLoginAttempt[req.UserName]
	now := time.Now()
	if exists && now.Sub(last) < 2*time.Second {
		loginAttemptMutex.Unlock()
		return e.JSON(429, apihelper.NewRateLimitError("Too many login attempts. Please wait a moment."))
	}
	lastLoginAttempt[req.UserName] = now
	loginAttemptMutex.Unlock()

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
		"uid":   user.UserName,
		"scope": user.Role,
		"iat":   time.Now().Unix(),
		"exp":   tokenExpiry.Unix(),
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
	CurrentPassword string `json:"oldPassword" validate:"required"`
	NewPassword     string `json:"newPassword" validate:"required"`
	Key             string `json:"key" validate:"required"`
	NewKey          string `json:"newKey" validate:"required"`
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
	passwordWithTime, err := h.KeyStore.Decrypt("login", pwdBytes, keyBytes)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid password"}
	}
	password := passwordWithTime[14:]
	newPwdBytes, err := base64.StdEncoding.DecodeString(req.NewPassword)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid new password"}
	}
	keyBytes, err = base64.StdEncoding.DecodeString(req.NewKey)
	if err != nil {
		return &users.UnauthorizedError{Message: "invalid new password"}
	}
	newPasswordWithTime, err := h.KeyStore.Decrypt("changepassword", newPwdBytes, keyBytes)
	if err != nil {
		return errors.NewValidationError("invalid new password", "newPassword")
	}
	newPassword := newPasswordWithTime[14:]

	token := e.Get("token").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	username := str(claims["uid"])
	err = h.UserService.ChangePassword(username, string(password), string(newPassword))
	if err != nil {
		log.Println(err)
		return stderrors.New("failed to change password")
	}
	return e.JSON(200, "password updated")
}

type RoleResponse struct {
	Role string `json:"role"`
}

func (h *AuthHandler) GetRole(e echo.Context) error {
	role := str(e.Get("role"))
	return e.JSON(200, &RoleResponse{Role: role})
}

func (h *AuthHandler) Logout(e echo.Context) error {
	apihelper.RemoveAuthCookie(e)
	return e.JSON(200, "success")
}

func str(o interface{}) string {
	s, ok := o.(string)
	if !ok {
		return ""
	}
	return s
}
