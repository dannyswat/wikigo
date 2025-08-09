package users

import (
	"strconv"
	"time"
)

type UserDevice struct {
	ID             int        `json:"id"`
	UserID         int        `json:"userId"`
	Name           string     `json:"name" validate:"required,max=100"`
	CredentialID   string     `json:"credentialId"`
	PublicKey      string     `json:"publicKey"`
	SignCount      uint32     `json:"signCount"`
	AAGUID         string     `json:"aaguid"`
	BackupEligible bool       `json:"backupEligible"`
	BackupState    bool       `json:"backupState"`
	CreatedAt      time.Time  `json:"createdAt"`
	LastUsedAt     *time.Time `json:"lastUsedAt"`
	IsActive       bool       `json:"isActive"`
}

func (e *UserDevice) GetValue(field string) string {
	switch field {
	case "UserID":
		return strconv.Itoa(e.UserID)
	case "CredentialID":
		return e.CredentialID
	}
	return ""
}

func (e *UserDevice) GetID() int {
	return e.ID
}

func (e *UserDevice) SetID(id int) {
	e.ID = id
}
