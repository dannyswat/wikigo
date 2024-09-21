package pages

type PageRepository interface {
	Init() error
	GetPageByID(id int) (*Page, error)
	GetPageByUrl(url string) (*Page, error)
	GetPagesByAuthor(author string) ([]*PageMeta, error)
	GetPagesByParentID(parentID *int) ([]*PageMeta, error)
	GetAllPages(includeProtected bool) ([]*PageMeta, error)
	CreatePage(page *Page) error
	UpdatePage(page *Page) error
	DeletePage(id int) error
}
