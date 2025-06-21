package pages

type SearchTermList struct {
	Term    string `json:"term" validate:"required"`
	PageIds []int  `json:"page_ids" validate:"required"`
}
