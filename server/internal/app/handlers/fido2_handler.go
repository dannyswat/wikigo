package handlers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"

	"wikigo/internal/common/apihelper"
	"wikigo/internal/keymgmt"
	"wikigo/internal/users"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type Fido2Handler struct {
	UserService  *users.UserService
	WebAuthn     *webauthn.WebAuthn
	KeyStore     *keymgmt.KeyMgmtService
	SessionStore *SessionStore
	RateLimiter  *apihelper.RateLimiter
}

// Simple in-memory session store for WebAuthn sessions
type SessionStore struct {
	mu       sync.RWMutex
	sessions map[string]*SessionData
}

type SessionData struct {
	Data      *webauthn.SessionData
	ExpiresAt time.Time
}

func NewSessionStore() *SessionStore {
	store := &SessionStore{
		sessions: make(map[string]*SessionData),
	}
	// Start cleanup goroutine
	go store.cleanup()
	return store
}

func (s *SessionStore) Set(key string, data *webauthn.SessionData, ttl time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[key] = &SessionData{
		Data:      data,
		ExpiresAt: time.Now().Add(ttl),
	}
}

func (s *SessionStore) Get(key string) *webauthn.SessionData {
	s.mu.RLock()
	defer s.mu.RUnlock()
	session, exists := s.sessions[key]
	if !exists || time.Now().After(session.ExpiresAt) {
		return nil
	}
	return session.Data
}

func (s *SessionStore) Delete(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, key)
}

func (s *SessionStore) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for key, session := range s.sessions {
			if now.After(session.ExpiresAt) {
				delete(s.sessions, key)
			}
		}
		s.mu.Unlock()
	}
}

// WebAuthnUser wraps User to implement webauthn.User interface
type WebAuthnUser struct {
	*users.User
	devices []*users.UserDevice
}

func (u WebAuthnUser) WebAuthnID() []byte {
	return []byte(strconv.Itoa(u.ID))
}

func (u WebAuthnUser) WebAuthnName() string {
	return u.UserName
}

func (u WebAuthnUser) WebAuthnDisplayName() string {
	return u.UserName
}

func (u WebAuthnUser) WebAuthnCredentials() []webauthn.Credential {
	credentials := make([]webauthn.Credential, len(u.devices))
	for i, device := range u.devices {
		credentialID, _ := base64.StdEncoding.DecodeString(device.CredentialID)
		publicKey, _ := base64.StdEncoding.DecodeString(device.PublicKey)

		credentials[i] = webauthn.Credential{
			ID:        credentialID,
			PublicKey: publicKey,
			Authenticator: webauthn.Authenticator{
				AAGUID:       []byte(device.AAGUID),
				SignCount:    device.SignCount,
				CloneWarning: false,
				Attachment:   "",
			},
			Flags: webauthn.CredentialFlags{
				UserPresent:    true,
				UserVerified:   true,
				BackupEligible: device.BackupEligible,
				BackupState:    device.BackupState,
			},
		}
	}
	return credentials
}

func (u WebAuthnUser) WebAuthnIcon() string {
	return ""
}

// BeginRegistration starts the passkey registration process
func (h *Fido2Handler) BeginRegistration(e echo.Context) error {
	username := apihelper.GetUserId(e)
	if username == "" {
		return e.JSON(401, map[string]string{"error": "unauthorized"})
	}

	user, err := h.UserService.DB.GetUserByUserName(username)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "user not found"})
	}

	devices, err := h.UserService.DeviceDB.GetByUserID(user.ID)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "failed to get user devices"})
	}

	webAuthnUser := WebAuthnUser{
		User:    user,
		devices: devices,
	}

	credentialCreation, sessionData, err := h.WebAuthn.BeginRegistration(webAuthnUser)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "failed to begin registration"})
	}

	// Store session data in session store with 5 minute TTL
	sessionKey := e.Request().Header.Get("X-Session-Key")
	if sessionKey == "" {
		sessionKey = fmt.Sprintf("reg_%s_%d", username, time.Now().UnixNano())
	}
	h.SessionStore.Set(sessionKey, sessionData, 5*time.Minute)

	// Store session key in response headers for the client to use
	e.Response().Header().Set("X-Session-Key", sessionKey)

	return e.JSON(200, credentialCreation)
}

// FinishRegistration completes the passkey registration process
func (h *Fido2Handler) FinishRegistration(e echo.Context) error {
	username := apihelper.GetUserId(e)
	if username == "" {
		return e.JSON(401, map[string]string{"error": "unauthorized"})
	}

	user, err := h.UserService.DB.GetUserByUserName(username)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "user not found"})
	}

	// Parse the full request body first
	var fullRequest map[string]interface{}
	if err := e.Bind(&fullRequest); err != nil {
		fmt.Printf("Error binding full request: %v\n", err)
		return e.JSON(400, map[string]string{"error": "invalid request: " + err.Error()})
	}

	// Extract our custom fields
	deviceName, ok := fullRequest["name"].(string)
	if !ok {
		fmt.Printf("Missing or invalid device name\n")
		return e.JSON(400, map[string]string{"error": "device name is required"})
	}

	sessionKey := e.Request().Header.Get("X-Session-Key")
	if sessionKey == "" {
		fmt.Printf("Missing or invalid session key\n")
		return e.JSON(400, map[string]string{"error": "session key is required"})
	}

	fmt.Printf("Parsed request - Name: %s, SessionKey: %s\n", deviceName, sessionKey)

	// Remove our custom fields to get the raw WebAuthn credential
	delete(fullRequest, "name")
	delete(fullRequest, "sessionKey")

	devices, err := h.UserService.DeviceDB.GetByUserID(user.ID)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "failed to get user devices"})
	}

	webAuthnUser := WebAuthnUser{
		User:    user,
		devices: devices,
	}

	// Get session data from session store
	fmt.Printf("Looking for session key: %s\n", sessionKey)
	sessionData := h.SessionStore.Get(sessionKey)
	if sessionData == nil {
		fmt.Printf("Session not found or expired for key: %s\n", sessionKey)
		// Debug: print all active sessions
		h.SessionStore.mu.RLock()
		fmt.Printf("Active sessions: %d\n", len(h.SessionStore.sessions))
		for key := range h.SessionStore.sessions {
			fmt.Printf("Session key: %s\n", key)
		}
		h.SessionStore.mu.RUnlock()
		return e.JSON(400, map[string]string{"error": "no registration session found or session expired"})
	}
	fmt.Printf("Session found successfully\n")

	// Create a new request with only the WebAuthn credential data
	credentialJSON, err := json.Marshal(fullRequest)
	if err != nil {
		fmt.Printf("Error marshalling credential data: %v\n", err)
		return e.JSON(400, map[string]string{"error": "invalid credential data"})
	}

	// Create a new HTTP request with the clean credential data
	credentialRequest := e.Request().Clone(e.Request().Context())
	credentialRequest.Body = io.NopCloser(bytes.NewReader(credentialJSON))
	credentialRequest.ContentLength = int64(len(credentialJSON))

	credential, err := h.WebAuthn.FinishRegistration(webAuthnUser, *sessionData, credentialRequest)
	if err != nil {
		fmt.Printf("Error finishing registration: %v\n", err)
		return e.JSON(400, map[string]string{"error": "failed to finish registration: " + err.Error()})
	}

	// Clean up session
	h.SessionStore.Delete(sessionKey)

	// Store the credential in the database
	now := time.Now()
	device := &users.UserDevice{
		UserID:         user.ID,
		Name:           deviceName,
		CredentialID:   base64.StdEncoding.EncodeToString(credential.ID),
		PublicKey:      base64.StdEncoding.EncodeToString(credential.PublicKey),
		SignCount:      credential.Authenticator.SignCount,
		AAGUID:         string(credential.Authenticator.AAGUID),
		BackupEligible: credential.Flags.BackupEligible,
		BackupState:    credential.Flags.BackupState,
		CreatedAt:      now,
		IsActive:       true,
	}

	if err := h.UserService.DeviceDB.CreateDevice(device); err != nil {
		return e.JSON(500, map[string]string{"error": "failed to save device"})
	}

	return e.JSON(200, map[string]string{"message": "passkey registered successfully"})
}

// BeginLogin starts the passkey authentication process
func (h *Fido2Handler) BeginLogin(e echo.Context) error {
	assertion, sessionData, err := h.WebAuthn.BeginDiscoverableLogin()
	if err != nil {
		return e.JSON(500, map[string]string{"error": "failed to begin login"})
	}

	if h.RateLimiter != nil && !h.RateLimiter.AllowRequest(e.RealIP()) {
		return e.JSON(429, map[string]string{"error": "too many login attempts. Please wait a moment."})
	}

	// Store session data in session store with 5 minute TTL
	sessionKey := e.Request().Header.Get("X-Session-Key")
	if sessionKey == "" {
		sessionKey = fmt.Sprintf("login_%d", time.Now().UnixNano())
	}
	h.SessionStore.Set(sessionKey, sessionData, 5*time.Minute)

	// Store session key in response headers for the client to use
	e.Response().Header().Set("X-Session-Key", sessionKey)

	return e.JSON(200, assertion)
}

// FinishLogin completes the passkey authentication process
func (h *Fido2Handler) FinishLogin(e echo.Context) error {
	// Parse the full request body first
	var fullRequest map[string]interface{}
	if err := e.Bind(&fullRequest); err != nil {
		fmt.Printf("Error binding login request: %v\n", err)
		return e.JSON(400, map[string]string{"error": "invalid request: " + err.Error()})
	}

	// Extract session key from request
	sessionKey := e.Request().Header.Get("X-Session-Key")
	if sessionKey == "" {
		fmt.Printf("Missing or invalid session key in login request\n")
		return e.JSON(400, map[string]string{"error": "session key is required"})
	}

	// Remove our custom field to get the raw WebAuthn credential
	delete(fullRequest, "sessionKey")

	// Get session data from session store
	fmt.Printf("Looking for login session key: %s\n", sessionKey)
	sessionData := h.SessionStore.Get(sessionKey)
	if sessionData == nil {
		fmt.Printf("Login session not found or expired for key: %s\n", sessionKey)
		return e.JSON(400, map[string]string{"error": "no login session found or session expired"})
	}
	fmt.Printf("Login session found successfully\n")

	// Define the discoverable user handler
	handler := func(rawID, userHandle []byte) (webauthn.User, error) {
		// Find the user device by credential ID
		credentialID := base64.StdEncoding.EncodeToString(rawID)
		fmt.Printf("Looking for device with credential ID: %s\n", credentialID)
		device, err := h.UserService.DeviceDB.GetByCredentialID(credentialID)
		if err != nil || device == nil {
			fmt.Printf("Device not found for credential ID: %s\n", credentialID)
			return nil, fmt.Errorf("credential not found")
		}

		if !device.IsActive {
			fmt.Printf("Device is inactive: %s\n", device.Name)
			return nil, fmt.Errorf("device is inactive")
		}

		fmt.Printf("Found device: %s for user ID: %d\n", device.Name, device.UserID)

		// Get the user
		user, err := h.UserService.DB.GetUserByID(device.UserID)
		if err != nil || user == nil {
			fmt.Printf("User not found for device: %s\n", device.Name)
			return nil, fmt.Errorf("user not found")
		}

		if user.IsLockedOut {
			fmt.Printf("User is locked out: %s\n", user.UserName)
			return nil, fmt.Errorf("account is locked")
		}

		devices, err := h.UserService.DeviceDB.GetByUserID(user.ID)
		if err != nil {
			fmt.Printf("Failed to get user devices: %v\n", err)
			return nil, fmt.Errorf("failed to get user devices")
		}
		fmt.Printf("Returning user with %d devices\n", len(devices))
		return WebAuthnUser{
			User:    user,
			devices: devices,
		}, nil
	}

	// Create a new request with only the WebAuthn credential data
	credentialJSON, err := json.Marshal(fullRequest)
	if err != nil {
		fmt.Printf("Error marshalling login credential data: %v\n", err)
		return e.JSON(400, map[string]string{"error": "invalid credential data"})
	}

	// Create a new HTTP request with the clean credential data
	credentialRequest := e.Request().Clone(e.Request().Context())
	credentialRequest.Body = io.NopCloser(bytes.NewReader(credentialJSON))
	credentialRequest.ContentLength = int64(len(credentialJSON))

	// Finish the login process
	user, credential, err := h.WebAuthn.FinishPasskeyLogin(handler, *sessionData, credentialRequest)
	if err != nil {
		fmt.Printf("Error finishing login: %v\n", err)
		return e.JSON(401, map[string]string{"error": "authentication failed: " + err.Error()})
	}

	// Clean up session
	h.SessionStore.Delete(sessionKey)

	// Get the actual user from our handler result
	webAuthnUser, ok := user.(WebAuthnUser)
	if !ok {
		fmt.Printf("Failed to cast user to WebAuthnUser\n")
		return e.JSON(500, map[string]string{"error": "internal error"})
	}

	// Find the device to update
	credentialID := base64.StdEncoding.EncodeToString(credential.ID)
	device, err := h.UserService.DeviceDB.GetByCredentialID(credentialID)
	if err == nil && device != nil {
		// Update device sign count, backup state, and last used time
		device.SignCount = credential.Authenticator.SignCount
		device.BackupEligible = credential.Flags.BackupEligible
		device.BackupState = credential.Flags.BackupState
		now := time.Now()
		device.LastUsedAt = &now
		if err := h.UserService.DeviceDB.UpdateDevice(device); err != nil {
			// Log error but don't fail the login
			fmt.Printf("Failed to update device: %v\n", err)
		}
	}

	// Generate JWT token (similar to regular login)
	tokenExpiry := time.Now().Add(time.Hour * 24)
	signedToken, err := h.KeyStore.SignJWT(jwt.MapClaims{
		"uid":   webAuthnUser.UserName,
		"scope": webAuthnUser.Role,
		"iat":   time.Now().Unix(),
		"exp":   tokenExpiry.Unix(),
	}, "auth")

	if err != nil {
		return e.JSON(500, map[string]string{"error": "failed to generate token"})
	}

	e.SetCookie(&http.Cookie{
		Name:     "user",
		Value:    webAuthnUser.UserName,
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

	// Return similar to regular login
	type LoginResponse struct {
		Token string `json:"token"`
	}
	return e.JSON(200, &LoginResponse{Token: signedToken})
}

// GetUserDevices returns all devices for the authenticated user
func (h *Fido2Handler) GetUserDevices(e echo.Context) error {
	username := apihelper.GetUserId(e)
	if username == "" {
		return e.JSON(401, map[string]string{"error": "unauthorized"})
	}

	user, err := h.UserService.DB.GetUserByUserName(username)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "user not found"})
	}

	devices, err := h.UserService.DeviceDB.GetByUserID(user.ID)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "failed to get user devices"})
	}

	// Return devices without sensitive data
	type DeviceResponse struct {
		ID         int        `json:"id"`
		Name       string     `json:"name"`
		CreatedAt  time.Time  `json:"createdAt"`
		LastUsedAt *time.Time `json:"lastUsedAt"`
		IsActive   bool       `json:"isActive"`
	}

	responses := make([]DeviceResponse, len(devices))
	for i, device := range devices {
		responses[i] = DeviceResponse{
			ID:         device.ID,
			Name:       device.Name,
			CreatedAt:  device.CreatedAt,
			LastUsedAt: device.LastUsedAt,
			IsActive:   device.IsActive,
		}
	}

	return e.JSON(200, responses)
}

// DeleteDevice removes a passkey device
func (h *Fido2Handler) DeleteDevice(e echo.Context) error {
	username := apihelper.GetUserId(e)
	if username == "" {
		return e.JSON(401, map[string]string{"error": "unauthorized"})
	}

	deviceIDStr := e.Param("id")
	deviceID, err := strconv.Atoi(deviceIDStr)
	if err != nil {
		return e.JSON(400, map[string]string{"error": "invalid device ID"})
	}

	user, err := h.UserService.DB.GetUserByUserName(username)
	if err != nil {
		return e.JSON(500, map[string]string{"error": "user not found"})
	}

	device, err := h.UserService.DeviceDB.GetByID(deviceID)
	if err != nil || device == nil {
		return e.JSON(404, map[string]string{"error": "device not found"})
	}

	// Ensure the device belongs to the authenticated user
	if device.UserID != user.ID {
		return e.JSON(403, map[string]string{"error": "forbidden"})
	}

	if err := h.UserService.DeviceDB.DeleteDevice(deviceID); err != nil {
		return e.JSON(500, map[string]string{"error": "failed to delete device"})
	}

	return e.JSON(200, map[string]string{"message": "device deleted successfully"})
}
