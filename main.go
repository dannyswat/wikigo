package main

import (
	"time"

	"github.com/dannyswat/wikigo/users"
	"github.com/dannyswat/wikigo/wiki"
)

func main() {
	dbManager := wiki.NewDBManager("data")
	dbManager.Init()
	adminUser, err := dbManager.Users().GetUserByUserName("admin")
	if err != nil {
		panic(err)
	}
	if adminUser != nil {
		adminUser = &users.User{
			UserName:    "admin",
			Email:       "dhlwat@live.com",
			IsLockedOut: false,
			CreatedAt:   time.Now(),
		}
		adminUser.UpdatePassword("PleaseChange")
		dbManager.Users().CreateUser(adminUser)
	}
}
