package repositories

import (
	"strconv"

	"github.com/dannyswat/filedb"
	"github.com/dannyswat/wikigo/pages"
)

type pageDB struct {
	db filedb.FileDB[*pages.Page]
}

func NewPageDB(path string) pages.PageRepository {
	return &pageDB{
		db: filedb.NewFileDB[*pages.Page](path, []filedb.FileIndexConfig{
			{Field: "Url", Unique: true},
			{Field: "CreatedBy", Unique: false},
			{Field: "ParentID", Unique: false},
		}),
	}
}

func (p *pageDB) Init() error {
	return p.db.Init()
}

func (p *pageDB) GetPageByID(id int) (*pages.Page, error) {
	page, err := p.db.Find(id)
	if err != nil {
		return nil, err
	}
	return page, nil
}

func (p *pageDB) GetPageByUrl(url string) (*pages.Page, error) {
	pages, err := p.db.List("Url", url)
	if err != nil {
		return nil, err
	}
	if len(pages) == 0 {
		return nil, nil
	}
	return pages[0], nil
}

func (p *pageDB) GetPagesByAuthor(author string) ([]*pages.Page, error) {
	return p.db.List("CreatedBy", author)
}

func (p *pageDB) GetPagesByParentID(parentID *int) ([]*pages.Page, error) {
	idStr := ""
	if parentID != nil {
		idStr = strconv.Itoa(*parentID)
	}
	return p.db.List("ParentID", idStr)
}

func (p *pageDB) CreatePage(page *pages.Page) error {
	return p.db.Insert(page)
}

func (p *pageDB) UpdatePage(page *pages.Page) error {
	return p.db.Update(page)
}

func (p *pageDB) DeletePage(id int) error {
	return p.db.Delete(id)
}
