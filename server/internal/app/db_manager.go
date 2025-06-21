package wiki

import (
	"path/filepath"
	"wikigo/internal/app/repositories"
	"wikigo/internal/keymgmt"
	"wikigo/internal/pages"
	"wikigo/internal/revisions"
	"wikigo/internal/setting"
	"wikigo/internal/users"
)

type DBManager interface {
	Init() error
	Users() users.UserRepository
	Pages() pages.PageRepository
	Keys() keymgmt.KeyRepository
	PageRevisions() revisions.RevisionRepository[*pages.Page]
	SearchTerms() pages.SearchTermListRepository
	Settings() setting.SettingRepository
}

type dbManager struct {
	users         users.UserRepository
	pages         pages.PageRepository
	keys          keymgmt.KeyRepository
	pageRevisions revisions.RevisionRepository[*pages.Page]
	searchTerms   pages.SearchTermListRepository
	settings      setting.SettingRepository
}

func NewDBManager(path string) DBManager {
	return &dbManager{
		users:         repositories.NewUserDB(path + "/users"),
		pages:         repositories.NewPageDB(path + "/pages"),
		keys:          repositories.NewKeyDB(path + "/keys"),
		pageRevisions: repositories.NewRevisionRepository[*pages.Page](path + "/revisions"),
		searchTerms:   repositories.NewSearchTermListRepository(path + "/search_terms"),
		settings:      &repositories.SettingRepository{Path: filepath.Join(path, "setting.json")},
	}
}

func (m *dbManager) Init() error {
	if err := m.users.Init(); err != nil {
		return err
	}
	if err := m.pages.Init(); err != nil {
		return err
	}
	if err := m.keys.Init(); err != nil {
		return err
	}
	if err := m.pageRevisions.Init(); err != nil {
		return err
	}
	if err := m.searchTerms.Init(); err != nil {
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

func (m *dbManager) Keys() keymgmt.KeyRepository {
	return m.keys
}

func (m *dbManager) PageRevisions() revisions.RevisionRepository[*pages.Page] {
	return m.pageRevisions
}

func (m *dbManager) SearchTerms() pages.SearchTermListRepository {
	return m.searchTerms
}

func (m *dbManager) Settings() setting.SettingRepository {
	return m.settings
}
