package pages

type SearchTermListRepository interface {
	Init() error
	GetSearchTermList(term string) (*SearchTermList, error)
	UpdateSearchTermLists(terms, oldTerms []string, pageId int) error
}
