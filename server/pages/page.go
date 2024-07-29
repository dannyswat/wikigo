package pages

import (
	"strconv"
	"strings"
	"time"
)

type Page struct {
	ID             int       `json:"id"`
	ParentID       *int      `json:"parentId"`
	Url            string    `json:"url" validate:"required,max=100,regexp=^((\\/)|((\\/[a-zA-Z0-9-]+)+))$"`
	Title          string    `json:"title" validate:"required,max=100"`
	ShortDesc      string    `json:"shortDesc" validate:"max=300"`
	Content        string    `json:"content"`
	Tags           []string  `json:"tags" validate:"max=10"`
	CreatedAt      time.Time `json:"createdAt"`
	CreatedBy      string    `json:"createdBy"`
	LastModifiedAt time.Time `json:"lastModifiedAt"`
	LastModifiedBy string    `json:"lastModifiedBy"`
}

func (p *Page) GetValue(field string) string {
	switch field {
	case "CreatedBy":
		return p.CreatedBy
	case "LastModifiedBy":
		return p.LastModifiedBy
	case "Url":
		return p.Url
	case "ParentID":
		if p.ParentID != nil {
			return strconv.Itoa(*p.ParentID)
		}
	}
	return ""
}

func (p *Page) GetValues(field string) []string {
	switch field {
	case "Tags":
		return p.Tags
	case "Title":
		return strings.Fields(p.Title)
	case "ShortDesc":
		return strings.Fields(p.ShortDesc)
	}
	return nil
}

func (p *Page) GetID() int {
	return p.ID
}

func (p *Page) SetID(id int) {
	p.ID = id
}