package pages

import (
	"strconv"

	"github.com/dannyswat/filedb"
)

type PageDB interface {
	Init() error
	GetPageByID(id int) (*Page, error)
	GetPageByUrl(url string) (*Page, error)
	GetPagesByAuthor(author string) ([]*Page, error)
	GetPagesByParentID(parentID *int) ([]*Page, error)
	CreatePage(page *Page) error
	UpdatePage(page *Page) error
	DeletePage(id int) error
}

type pageDB struct {
	db filedb.FileDB[*Page]
}

func NewPageDB(path string) PageDB {
	return &pageDB{
		db: filedb.NewFileDB[*Page](path, []filedb.FileIndexConfig{
			{Field: "Url", Unique: true},
			{Field: "CreatedBy", Unique: false},
			{Field: "ParentID", Unique: false},
		}),
	}
}

func (p *pageDB) Init() error {
	return p.db.Init()
}

func (p *pageDB) GetPageByID(id int) (*Page, error) {
	page, err := p.db.Find(id)
	if err != nil {
		return nil, err
	}
	return page, nil
}

func (p *pageDB) GetPageByUrl(url string) (*Page, error) {
	pages, err := p.db.List("Url", url)
	if err != nil {
		return nil, err
	}
	if len(pages) == 0 {
		return nil, nil
	}
	return pages[0], nil
}

func (p *pageDB) GetPagesByAuthor(author string) ([]*Page, error) {
	return p.db.List("CreatedBy", author)
}

func (p *pageDB) GetPagesByParentID(parentID *int) ([]*Page, error) {
	idStr := ""
	if parentID != nil {
		idStr = strconv.Itoa(*parentID)
	}
	return p.db.List("ParentID", idStr)
}

func (p *pageDB) CreatePage(page *Page) error {
	return p.db.Insert(page)
}

func (p *pageDB) UpdatePage(page *Page) error {
	return p.db.Update(page)
}

func (p *pageDB) DeletePage(id int) error {
	return p.db.Delete(id)
}
