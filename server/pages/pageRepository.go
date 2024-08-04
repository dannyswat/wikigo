package pages

type PageRepository interface {
	Init() error
	GetPageByID(id int) (*Page, error)
	GetPageByUrl(url string) (*Page, error)
	GetPagesByAuthor(author string) ([]*Page, error)
	GetPagesByParentID(parentID *int) ([]*Page, error)
	CreatePage(page *Page) error
	UpdatePage(page *Page) error
	DeletePage(id int) error
}
