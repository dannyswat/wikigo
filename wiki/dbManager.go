package wiki

import (
	"github.com/dannyswat/wikigo/pages"
	"github.com/dannyswat/wikigo/users"
)

type DBManager interface {
	Init() error
	Users() users.UserDB
	Pages() pages.PageDB
}

type dbManager struct {
	users users.UserDB
	pages pages.PageDB
}

func NewDBManager(path string) DBManager {
	return &dbManager{
		users: users.NewUserDB(path + "/users"),
		pages: pages.NewPageDB(path + "/pages"),
	}
}

func (m *dbManager) Init() error {
	if err := m.users.Init(); err != nil {
		return err
	}
	if err := m.pages.Init(); err != nil {
		return err
	}
	return nil
}

func (m *dbManager) Users() users.UserDB {
	return m.users
}

func (m *dbManager) Pages() pages.PageDB {
	return m.pages
}
