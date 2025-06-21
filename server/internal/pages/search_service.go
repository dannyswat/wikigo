package pages

import (
	"regexp"
	"sort"
	"strings"
)

type SearchService struct {
	SearchTermListRepository SearchTermListRepository
	PageRepository           PageRepository
}

func NewSearchService(searchTermListRepository SearchTermListRepository, pageRepository PageRepository) *SearchService {
	return &SearchService{
		SearchTermListRepository: searchTermListRepository,
		PageRepository:           pageRepository,
	}
}

func (s *SearchService) Init() error {
	if err := s.SearchTermListRepository.Init(); err != nil {
		return err
	}
	if err := s.PageRepository.Init(); err != nil {
		return err
	}
	return nil
}

func (s *SearchService) Search(text string, pageSize int) []*PageMeta {
	terms := tokenize(text)
	pageMatchCount := make(map[int]int)
	for _, term := range terms {
		if term == "" {
			continue
		}
		searchTermList, err := s.SearchTermListRepository.GetSearchTermList(term)
		if err != nil {
			continue // Handle error appropriately
		}
		if searchTermList == nil {
			searchTermList = &SearchTermList{Term: term, PageIds: []int{}}
		}
		pageIds := searchTermList.PageIds
		for _, pageId := range pageIds {
			pageMatchCount[pageId]++
		}
	}
	// Sort page IDs by match count descending
	type pageCount struct {
		pageId int
		count  int
	}
	var pageCounts []pageCount
	for pageId, count := range pageMatchCount {
		pageCounts = append(pageCounts, pageCount{pageId, count})
	}
	// Sort descending by count
	sort.Slice(pageCounts, func(i, j int) bool {
		return pageCounts[i].count > pageCounts[j].count
	})

	var results []*PageMeta
	for _, pc := range pageCounts {
		if pc.count > 0 {
			if pageSize > 0 && len(results) >= pageSize {
				break
			}
			page, err := s.PageRepository.GetPageByID(pc.pageId)
			if err != nil {
				continue // Handle error appropriately
			}
			results = append(results, &PageMeta{
				ID:    page.ID,
				Title: page.Title,
				Url:   page.Url,
			})
		}
	}
	return results
}

func (s *SearchService) UpdatePageSearchTerms(page *Page) error {
	if page == nil || page.ID <= 0 {
		return nil // No valid page to update
	}
	terms := tokenize(page.Title + " " + page.Content)
	return s.SearchTermListRepository.UpdateSearchTermLists(terms, page.ID)
}

func tokenize(text string) []string {
	// Remove HTML tags
	re := regexp.MustCompile(`<[^>]*>`) // matches anything between < and >
	plain := re.ReplaceAllString(text, " ")
	return strings.Fields(plain)
}
