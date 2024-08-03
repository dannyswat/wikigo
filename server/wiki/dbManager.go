package wiki

import (
	"github.com/dannyswat/wikigo/pages"
	"github.com/dannyswat/wikigo/users"
	"github.com/dannyswat/wikigo/wiki/repositories"
)

type DBManager interface {
	Init() error
	Users() users.UserRepository
	Pages() pages.PageRepository
}

type dbManager struct {
	users users.UserRepository
	pages pages.PageRepository
}

func NewDBManager(path string) DBManager {
	return &dbManager{
		users: repositories.NewUserDB(path + "/users"),
		pages: repositories.NewPageDB(path + "/pages"),
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

func (m *dbManager) Users() users.UserRepository {
	return m.users
}

func (m *dbManager) Pages() pages.PageRepository {
	return m.pages
}
