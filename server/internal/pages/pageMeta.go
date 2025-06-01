package pages

type PageMeta struct {
	ID          int    `json:"id"`
	ParentID    *int   `json:"parentId"`
	Url         string `json:"url"`
	Title       string `json:"title"`
	IsPinned    bool   `json:"isPinned"`
	IsProtected bool   `json:"isProtected"`
}
