package keymgmt

type KeyRepository interface {
	Init() error
	GetKeyPairByPurpose(purpose string) (*KeyPair, error)
	CreateKeyPair(entity *KeyPair) error
	UpdateKeyPair(entity *KeyPair) error
	DeleteKeyPair(id int) error
}
