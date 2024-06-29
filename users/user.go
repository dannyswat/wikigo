package users

import (
	"strconv"
	"time"

	"github.com/alexedwards/argon2id"
)

type User struct {
	ID          int       `json:"id"`
	UserName    string    `json:"username"`
	Password    string    `json:"password"`
	Email       string    `json:"email"`
	CreatedAt   time.Time `json:"createdAt"`
	IsLockedOut bool      `json:"isLockedOut"`
}

func (e User) GetKey() string {
	return e.UserName
}

func (e User) GetID() string {
	return strconv.Itoa(e.ID)
}

func (user *User) UpdatePassword(newPassword string) error {
	password, err := argon2id.CreateHash(newPassword, argon2id.DefaultParams)
	if err == nil {
		user.Password = password
	}
	return err
}

func (user *User) VerifyPassword(password string) (bool, error) {
	return argon2id.ComparePasswordAndHash(password, user.Password)
}
