package wiki

import "github.com/dannyswat/wikigo/users"

type DBManager interface {
	Init() error
	Users() users.UserDB
}

type dbManager struct {
	users users.UserDB
}

func NewDBManager(path string) DBManager {
	return &dbManager{
		users: users.NewUserDB(path + "/users"),
	}
}

func (m *dbManager) Init() error {
	if err := m.users.Init(); err != nil {
		return err
	}
	return nil
}

func (m *dbManager) Users() users.UserDB {
	return m.users
}
