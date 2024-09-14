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
	"encoding/pem"
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

type KeyMgmtService struct {
	DB KeyRepository
}

func (k *KeyMgmtService) Init() error {
	return k.DB.Init()
}

func (k *KeyMgmtService) GenerateECKeyPairIfNotExist(purpose string) error {
	keyPair, err := k.DB.GetKeyPairByPurpose(purpose)
	if err != nil {
		return err
	}
	if keyPair == nil {
		_, err = k.GenerateECKeyPair(purpose)
		if err != nil {
			return err
		}
	}
	return nil
}

func (k *KeyMgmtService) GenerateECKeyPair(purpose string) (*ecdsa.PublicKey, error) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, err
	}
	publicKey := &privateKey.PublicKey
	privateKeyPem, err := ConvertECPrivateKeyToPem(privateKey)
	if err != nil {
		return nil, err
	}
	publicKeyPem, err := ConvertPublicKeyToPem(publicKey)
	if err != nil {
		return nil, err
	}
	keyPair := &KeyPair{
		Purpose:    purpose,
		PublicKey:  publicKeyPem,
		PrivateKey: privateKeyPem,
	}
	err = k.DB.CreateKeyPair(keyPair)
	if err != nil {
		return nil, err
	}
	return publicKey, nil
}

func (k *KeyMgmtService) GetPublicKey(purpose string) (*ecdsa.PublicKey, error) {
	keyPair, err := k.DB.GetKeyPairByPurpose(purpose)
	if err != nil {
		return nil, err
	}
	return ConvertPemToPublicKey(keyPair.PublicKey)
}

func (k *KeyMgmtService) GetPublicKeyForSignature(purpose string) ([]byte, error) {
	publicKey, err := k.GetPublicKey(purpose)
	if err != nil {
		return nil, err
	}
	return x509.MarshalPKIXPublicKey(publicKey)
}

func (k *KeyMgmtService) GetPublicKeyForEncryption(purpose string) ([]byte, error) {
	keyPair, err := k.DB.GetKeyPairByPurpose(purpose)
	if err != nil {
		return nil, err
	}
	publicKey, err := ConvertPemToPublicKey(keyPair.PublicKey)
	if err != nil {
		return nil, err
	}
	ecdhPublicKey, err := publicKey.ECDH()
	if err != nil {
		return nil, err
	}
	return ecdhPublicKey.Bytes(), nil
}
func (k *KeyMgmtService) getPrivateKey(purpose string) (*ecdsa.PrivateKey, error) {
	keyPair, err := k.DB.GetKeyPairByPurpose(purpose)
	if err != nil {
		return nil, err
	}
	return ConvertPemToECPrivateKey(keyPair.PrivateKey)
}

func (k *KeyMgmtService) Sign(purpose string, data []byte) ([]byte, error) {
	privateKey, err := k.getPrivateKey(purpose)
	if err != nil {
		return nil, err
	}
	hash := sha256.Sum256(data)
	return ecdsa.SignASN1(rand.Reader, privateKey, hash[:])
}

func (k *KeyMgmtService) Verify(purpose string, data, signature []byte) (bool, error) {
	publicKey, err := k.GetPublicKey(purpose)
	if err != nil {
		return false, err
	}
	hash := sha256.Sum256(data)
	verified := ecdsa.VerifyASN1(publicKey, hash[:], signature)
	return verified, nil
}

func (k *KeyMgmtService) Encrypt(purpose string, data, remotePublicKey []byte) ([]byte, error) {
	privateKey, err := k.getPrivateKey(purpose)
	if err != nil {
		return nil, err
	}
	privateKeyECDH, err := privateKey.ECDH()
	if err != nil {
		return nil, err
	}
	publicKey, err := ecdh.P256().NewPublicKey(remotePublicKey)
	if err != nil {
		return nil, err
	}
	sharedKey, err := privateKeyECDH.ECDH(publicKey)
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
	privateKey, err := k.getPrivateKey(purpose)
	if err != nil {
		return nil, err
	}
	privateKeyECDH, err := privateKey.ECDH()
	if err != nil {
		return nil, err
	}
	publicKey, err := ecdh.P256().NewPublicKey(remotePublicKey)
	if err != nil {
		return nil, err
	}
	sharedKey, err := privateKeyECDH.ECDH(publicKey)
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
		return k.GetPublicKey(purpose)
	})
}

func (k *KeyMgmtService) findLatestKeyPair(purpose string) (*KeyPair, error) {
	keyPair, err := k.DB.GetKeyPairByPurpose(purpose)
	if err != nil {
		return nil, err
	}
	if keyPair == nil {
		return nil, errors.New("key pair not found")
	}
	return keyPair, nil
}

func ConvertKeyToPem(keyType string, keyBytes []byte) string {
	block := &pem.Block{
		Type:  keyType,
		Bytes: keyBytes,
	}
	return string(pem.EncodeToMemory(block))
}

func ConvertPemToKey(pemString string) ([]byte, error) {
	block, _ := pem.Decode([]byte(pemString))
	if block == nil {
		return nil, errors.New("failed to decode pem block")
	}
	return block.Bytes, nil
}
