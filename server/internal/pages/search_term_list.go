package pages

import (
	"strconv"
	"strings"
)

type SearchTermList struct {
	ID      int    `json:"id"`
	Term    string `json:"term" validate:"required"`
	PageIds []int  `json:"page_ids" validate:"required"`
}

func (s *SearchTermList) GetID() int {
	return s.ID
}
func (s *SearchTermList) SetID(id int) {
	s.ID = id
}
func (s *SearchTermList) GetValue(field string) string {
	switch field {
	case "Term":
		return s.Term
	case "PageIds":
		return intArrayToString(s.PageIds)
	}
	return ""
}

func intArrayToString(array []int) string {
	if len(array) == 0 {
		return ""
	}
	strs := make([]string, len(array))
	for i, v := range array {
		strs[i] = strconv.Itoa(v)
	}
	return strings.Join(strs, ",")
}
