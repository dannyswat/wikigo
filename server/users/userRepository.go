package users

type UserRepository interface {
	Init() error
	GetUserByID(id int) (*User, error)
	GetUserByUserName(username string) (*User, error)
	GetUserByEmail(email string) (*User, error)
	CreateUser(user *User) error
	UpdateUser(user *User) error
	DeleteUser(id int) error
}
