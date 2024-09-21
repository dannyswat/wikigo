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
			{Field: "CreatedBy", Unique: false, Include: []string{"Url", "ParentID", "Title", "IsPinned", "IsProtected"}},
			{Field: "ParentID", Unique: false, Include: []string{"Url", "Title", "IsPinned", "IsProtected"}},
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

func (p *pageDB) GetPagesByAuthor(author string) ([]*pages.PageMeta, error) {
	entries, err := p.db.ListIndexFields("CreatedBy", author)
	if err != nil {
		return nil, err
	}
	pagesResult := GetPageMetasFromIndexEntries(entries, "CreatedBy")
	return pagesResult, nil
}

func (p *pageDB) GetPagesByParentID(parentID *int) ([]*pages.PageMeta, error) {
	idStr := ""
	if parentID != nil {
		idStr = strconv.Itoa(*parentID)
	}
	entries, err := p.db.ListIndexFields("ParentID", idStr)
	if err != nil {
		return nil, err
	}
	pagesResult := GetPageMetasFromIndexEntries(entries, "ParentID")
	return pagesResult, nil
}

func (p *pageDB) GetAllPages(includeProtected bool) ([]*pages.PageMeta, error) {
	entries, err := p.db.ListAllIndexFields("CreatedBy")
	if err != nil {
		return nil, err
	}
	pagesResult := GetPageMetasFromIndexEntries(entries, "CreatedBy")
	if includeProtected {
		return pagesResult, nil
	}
	var result []*pages.PageMeta
	for _, page := range pagesResult {
		if !page.IsProtected {
			result = append(result, page)
		}
	}
	return result, nil
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

func GetPageMetasFromIndexEntries(entries []*filedb.IndexEntry, field string) []*pages.PageMeta {
	pagesResult := make([]*pages.PageMeta, len(entries))
	for i, entry := range entries {
		pagesResult[i] = GetPageMetaFromIndexEntry(entry, field)
	}
	return pagesResult
}

func GetPageMetaFromIndexEntry(entry *filedb.IndexEntry, field string) *pages.PageMeta {
	var parentId *int
	var parentIdStr string
	if field == "ParentID" {
		parentIdStr = entry.Value
	} else {
		parentIdStr = entry.Others["ParentID"]
	}
	if pid, err := strconv.Atoi(parentIdStr); err == nil {
		parentId = &pid
	}
	var isPinned bool
	if pinned, err := strconv.ParseBool(entry.Others["IsPinned"]); err == nil {
		isPinned = pinned
	}
	var isProtected bool
	if protected, err := strconv.ParseBool(entry.Others["IsProtected"]); err == nil {
		isProtected = protected
	}
	return &pages.PageMeta{
		ID:          entry.ID,
		ParentID:    parentId,
		Url:         entry.Others["Url"],
		Title:       entry.Others["Title"],
		IsPinned:    isPinned,
		IsProtected: isProtected,
	}
}
