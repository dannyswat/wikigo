package keymgmt

import "time"

type KeyPair struct {
	ID         int       `json:"id"`
	Purpose    string    `json:"purpose"`
	PublicKey  string    `json:"publicKey"`
	PrivateKey string    `json:"privateKey"`
	CreatedAt  time.Time `json:"createdAt"`
	ExpiresAt  time.Time `json:"expiresAt"`
}

func (e *KeyPair) GetValue(field string) string {
	switch field {
	case "Purpose":
		return e.Purpose
	}
	return ""
}

func (e *KeyPair) GetID() int {
	return e.ID
}

func (e *KeyPair) SetID(id int) {
	e.ID = id
}
