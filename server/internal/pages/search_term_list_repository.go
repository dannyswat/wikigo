package pages

type SearchTermListRepository interface {
	Init() error
	GetSearchTermList(term string) (*SearchTermList, error)
	UpdateSearchTermLists(terms []string, pageId int) error
}
