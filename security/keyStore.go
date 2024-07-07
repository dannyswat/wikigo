package security

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdh"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"errors"
	"time"

	"github.com/dannyswat/filedb"
)

type KeyStore interface {
	Init() error
	GenerateECKeyPair(purpose string) ([]byte, error)
	GetPublicKey(purpose string) ([]byte, error)
	Sign(purpose string, data []byte) ([]byte, error)
	Verify(purpose string, data, signature []byte) (bool, error)
	Encrypt(purpose string, data, remotePublicKey []byte) ([]byte, error)
	Decrypt(purpose string, data, remotePublicKey []byte) ([]byte, error)
}

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

type keyStore struct {
	db filedb.FileDB[*KeyPair]
}

func NewKeyStore(path string) KeyStore {
	return &keyStore{
		db: filedb.NewFileDB[*KeyPair](path, []filedb.FileIndexConfig{
			{Field: "Purpose", Unique: true},
		}),
	}
}

func (k *keyStore) Init() error {
	return k.db.Init()
}

func (k *keyStore) GenerateECKeyPair(purpose string) ([]byte, error) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, err
	}
	publicKey := &privateKey.PublicKey
	privateBytes, err := x509.MarshalECPrivateKey(privateKey)
	if err != nil {
		return nil, err
	}
	publicBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return nil, err
	}

	keyPair := &KeyPair{
		Purpose:    purpose,
		PublicKey:  base64.StdEncoding.EncodeToString(publicBytes),
		PrivateKey: base64.StdEncoding.EncodeToString(privateBytes),
	}
	err = k.db.Insert(keyPair)
	if err != nil {
		return nil, err
	}
	return publicBytes, nil
}

func (k *keyStore) GetPublicKey(purpose string) ([]byte, error) {
	keyPairs, err := k.db.List("Purpose", purpose)
	if err != nil {
		return nil, err
	}
	if len(keyPairs) == 0 {
		return nil, errors.New("key pair not found")
	}
	keyPair := keyPairs[0]
	for _, kp := range keyPairs {
		if kp.ExpiresAt.After(keyPair.ExpiresAt) {
			keyPair = kp
		}
	}
	return base64.StdEncoding.DecodeString(keyPair.PublicKey)
}

func (k *keyStore) Sign(purpose string, data []byte) ([]byte, error) {
	keyPair, err := k.findLatestKeyPair(purpose)
	if err != nil {
		return nil, err
	}
	privateBytes, err := base64.StdEncoding.DecodeString(keyPair.PrivateKey)
	if err != nil {
		return nil, err
	}
	privateKey, err := x509.ParseECPrivateKey(privateBytes)
	if err != nil {
		return nil, err
	}
	hash := sha256.Sum256(data)
	return ecdsa.SignASN1(rand.Reader, privateKey, hash[:])
}

func (k *keyStore) Verify(purpose string, data, signature []byte) (bool, error) {
	keyPair, err := k.findLatestKeyPair(purpose)
	if err != nil {
		return false, err
	}
	publicBytes, err := base64.StdEncoding.DecodeString(keyPair.PublicKey)
	if err != nil {
		return false, err
	}
	publicKey, err := x509.ParsePKIXPublicKey(publicBytes)
	if err != nil {
		return false, err
	}
	hash := sha256.Sum256(data)
	verified := ecdsa.VerifyASN1(publicKey.(*ecdsa.PublicKey), hash[:], signature)
	return verified, nil
}

func (k *keyStore) Encrypt(purpose string, data, remotePublicKey []byte) ([]byte, error) {
	keyPair, err := k.findLatestKeyPair(purpose)
	if err != nil {
		return nil, err
	}
	privateBytes, err := base64.StdEncoding.DecodeString(keyPair.PrivateKey)
	if err != nil {
		return nil, err
	}
	privateKey, err := ecdh.P256().NewPrivateKey(privateBytes)
	if err != nil {
		return nil, err
	}
	publicKey, err := ecdh.P256().NewPublicKey(remotePublicKey)
	if err != nil {
		return nil, err
	}
	sharedKey, err := privateKey.ECDH(publicKey)
	if err != nil {
		return nil, err
	}
	cipherBlock, err := aes.NewCipher(sharedKey)
	if err != nil {
		return nil, err
	}
	aesGcm, err := cipher.NewGCM(cipherBlock)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, aesGcm.NonceSize())
	_, err = rand.Read(nonce)
	if err != nil {
		return nil, err
	}
	cipherText := aesGcm.Seal(nonce, nonce, data, nil)
	return cipherText, nil
}

func (k *keyStore) Decrypt(purpose string, data, remotePublicKey []byte) ([]byte, error) {
	keyPair, err := k.findLatestKeyPair(purpose)
	if err != nil {
		return nil, err
	}
	privateBytes, err := base64.StdEncoding.DecodeString(keyPair.PrivateKey)
	if err != nil {
		return nil, err
	}
	privateKey, err := ecdh.P256().NewPrivateKey(privateBytes)
	if err != nil {
		return nil, err
	}
	publicKey, err := ecdh.P256().NewPublicKey(remotePublicKey)
	if err != nil {
		return nil, err
	}
	sharedKey, err := privateKey.ECDH(publicKey)
	if err != nil {
		return nil, err
	}
	cipherBlock, err := aes.NewCipher(sharedKey)
	if err != nil {
		return nil, err
	}
	aesGcm, err := cipher.NewGCM(cipherBlock)
	if err != nil {
		return nil, err
	}
	nonceSize := aesGcm.NonceSize()
	nonce, cipherText := data[:nonceSize], data[nonceSize:]
	plainText, err := aesGcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return nil, err
	}
	return plainText, nil
}

func (k *keyStore) findLatestKeyPair(purpose string) (*KeyPair, error) {
	keyPairs, err := k.db.List("Purpose", purpose)
	if err != nil {
		return nil, err
	}
	if len(keyPairs) == 0 {
		return nil, errors.New("key pair not found")
	}
	keyPair := keyPairs[0]
	for _, kp := range keyPairs {
		if kp.ExpiresAt.After(keyPair.ExpiresAt) {
			keyPair = kp
		}
	}
	return keyPair, nil
}
