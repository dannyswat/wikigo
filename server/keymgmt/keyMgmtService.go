package keymgmt

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

	"github.com/golang-jwt/jwt/v5"
)

type KeyMgmtService struct {
	DB KeyRepository
}

func (k *KeyMgmtService) Init() error {
	return k.DB.Init()
}

func (k *KeyMgmtService) GenerateECKeyPair(purpose string) ([]byte, error) {
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
	err = k.DB.CreateKeyPair(keyPair)
	if err != nil {
		return nil, err
	}
	return publicBytes, nil
}

func (k *KeyMgmtService) GetPublicKey(purpose string) ([]byte, error) {
	keyPair, err := k.DB.GetKeyPairByPurpose(purpose)
	if err != nil {
		return nil, err
	}
	return base64.StdEncoding.DecodeString(keyPair.PublicKey)
}

func (k *KeyMgmtService) Sign(purpose string, data []byte) ([]byte, error) {
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

func (k *KeyMgmtService) Verify(purpose string, data, signature []byte) (bool, error) {
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

func (k *KeyMgmtService) Encrypt(purpose string, data, remotePublicKey []byte) ([]byte, error) {
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

func (k *KeyMgmtService) Decrypt(purpose string, data, remotePublicKey []byte) ([]byte, error) {
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

func (k *KeyMgmtService) SignJWT(claims jwt.Claims, purpose string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodES256, claims)
	privateKey, err := k.getPrivateKey(purpose)
	if err != nil {
		return "", err
	}
	return token.SignedString(privateKey)
}

func (k *KeyMgmtService) VerifyJWT(tokenString, purpose string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		publicBytes, err := k.GetPublicKey(purpose)
		if err != nil {
			return nil, err
		}
		return x509.ParsePKIXPublicKey(publicBytes)
	})
}

func (k *KeyMgmtService) findLatestKeyPair(purpose string) (*KeyPair, error) {
	return k.DB.GetKeyPairByPurpose(purpose)
}

func (k *KeyMgmtService) getPrivateKey(purpose string) (*ecdsa.PrivateKey, error) {
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
	return privateKey, nil
}
