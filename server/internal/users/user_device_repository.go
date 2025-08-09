package users

type UserDeviceRepository interface {
	Init() error
	GetByID(id int) (*UserDevice, error)
	GetByCredentialID(credentialID string) (*UserDevice, error)
	GetByUserID(userID int) ([]*UserDevice, error)
	CreateDevice(device *UserDevice) error
	UpdateDevice(device *UserDevice) error
	DeleteDevice(id int) error
}
