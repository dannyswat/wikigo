package pages

import (
	"regexp"
	"sort"
	"strings"
	"unicode"
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

func (s *SearchService) Search(text string, pageSize int) ([]*PageMeta, error) {
	terms := Tokenize(text)
	pageMatchCount := make(map[int]int)
	for _, term := range terms {
		if term == "" {
			continue
		}
		searchTermList, err := s.SearchTermListRepository.GetSearchTermList(term)
		if err != nil {
			return nil, err
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

	results := make([]*PageMeta, 0)
	for _, pc := range pageCounts {
		if pc.count > 0 {
			if pageSize > 0 && len(results) >= pageSize {
				break
			}
			page, err := s.PageRepository.GetPageByID(pc.pageId)
			if err != nil {
				return nil, err
			}
			results = append(results, &PageMeta{
				ID:    page.ID,
				Title: page.Title,
				Url:   page.Url,
			})
		}
	}
	return results, nil
}

func (s *SearchService) AddPageSearchTerms(page *Page) error {
	if page == nil {
		return nil // No valid page to add
	}
	terms := Tokenize(page.Title + " " + page.Content)
	return s.SearchTermListRepository.UpdateSearchTermLists(terms, []string{}, page.ID)
}

func (s *SearchService) UpdatePageSearchTerms(page *Page, oldPage *Page) error {
	if page == nil || page.ID <= 0 {
		return nil // No valid page to update
	}
	var oldTerms []string
	if oldPage != nil {
		oldTerms = Tokenize(oldPage.Title + " " + oldPage.Content)
	} else {
		oldTerms = []string{}
	}
	terms := Tokenize(page.Title + " " + page.Content)
	return s.SearchTermListRepository.UpdateSearchTermLists(terms, oldTerms, page.ID)
}

func (s *SearchService) DeletePageSearchTerms(page *Page) error {
	oldTerms := Tokenize(page.Title + " " + page.Content)
	return s.SearchTermListRepository.UpdateSearchTermLists([]string{}, oldTerms, page.ID)
}

func Tokenize(text string) []string {
	// Remove HTML tags
	re := regexp.MustCompile(`<[^>]*>`) // matches anything between < and >
	plain := re.ReplaceAllString(text, " ")

	// Common English stopwords
	stopwords := map[string]bool{
		"a": true, "an": true, "and": true, "are": true, "as": true, "at": true, "be": true, "by": true,
		"for": true, "from": true, "has": true, "he": true, "in": true, "is": true, "it": true, "its": true,
		"of": true, "on": true, "that": true, "the": true, "to": true, "was": true, "will": true, "with": true,
	}

	// Use a map to track unique terms
	uniqueTerms := make(map[string]bool)
	runes := []rune(plain)

	// Process text character by character, handling different scripts separately
	for i := 0; i < len(runes); i++ {
		if isChinese(runes[i]) {
			// Find consecutive Chinese characters
			start := i
			for i < len(runes) && isChinese(runes[i]) {
				i++
			}
			chineseText := runes[start:i]

			// Generate 2-grams only if we have 2 or more Chinese characters
			if len(chineseText) >= 2 {
				for j := 0; j < len(chineseText)-1; j++ {
					term := string(chineseText[j : j+2])
					uniqueTerms[term] = true
				}
			}
			i-- // Adjust for the outer loop increment
		} else if unicode.Is(unicode.Latin, runes[i]) || unicode.IsDigit(runes[i]) {
			// Start collecting Latin-based word
			start := i
			for i < len(runes) && (unicode.Is(unicode.Latin, runes[i]) || unicode.IsDigit(runes[i])) {
				i++
			}
			word := strings.ToLower(string(runes[start:i]))
			if len(word) > 2 && !stopwords[word] {
				uniqueTerms[word] = true
			}
			i-- // Adjust for the outer loop increment
		}
		// Skip other Unicode scripts (as requested)
	}

	// Convert map to slice
	result := make([]string, 0, len(uniqueTerms))
	for term := range uniqueTerms {
		result = append(result, term)
	}

	return result
}

func (s *SearchService) RebuildSearchIndex() error {
	// Get all pages from the repository
	pages, err := s.PageRepository.GetAllPages(false)
	if err != nil {
		return err
	}

	// Clear existing search terms
	if err := s.SearchTermListRepository.DeleteAll(); err != nil {
		return err
	}

	// Rebuild search terms for each page
	for _, page := range pages {
		pageWithContent, err := s.PageRepository.GetPageByID(page.ID)
		if err != nil {
			return err
		}
		if err := s.AddPageSearchTerms(pageWithContent); err != nil {
			return err
		}
	}
	return nil
}

func isChinese(r rune) bool {
	return unicode.Is(unicode.Han, r)
}
