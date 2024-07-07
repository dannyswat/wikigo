package pages

import (
	"time"

	"github.com/dannyswat/wikigo/common"
	"github.com/go-playground/validator/v10"
)

type PageService struct {
	DB PageDB
}

func (s *PageService) GetPageByID(id int) (*Page, error) {
	return s.DB.GetPageByID(id)
}

func (s *PageService) GetPageByUrl(url string) (*Page, error) {
	return s.DB.GetPageByUrl(url)
}

func (s *PageService) GetPagesByAuthor(author string) ([]*Page, error) {
	return s.DB.GetPagesByAuthor(author)
}

func (s *PageService) GetPagesByParentID(parentID int) ([]*Page, error) {
	return s.DB.GetPagesByParentID(parentID)
}

func (s *PageService) CreatePage(page *Page, user string) error {
	if err := ValidatePage(page, true); err != nil {
		return err
	}
	page.CreatedAt = time.Now()
	page.CreatedBy = user
	page.LastModifiedAt = page.CreatedAt
	page.LastModifiedBy = user
	return s.DB.CreatePage(page)
}

func (s *PageService) UpdatePage(page *Page, user string) error {
	if err := ValidatePage(page, false); err != nil {
		return err
	}
	page.LastModifiedAt = time.Now()
	page.LastModifiedBy = user
	return s.DB.UpdatePage(page)
}

func (s *PageService) DeletePage(id int) error {
	return s.DB.DeletePage(id)
}

func ValidatePage(page *Page, isNew bool) error {
	if page == nil {
		return common.NewValidationError("page is nil")
	}
	if !isNew && page.ID == 0 {
		return common.NewValidationError("page not found")
	}
	v := validator.New()
	if err := v.Struct(page); err != nil {
		return common.NewValidationError(err.Error())
	}
	return nil
}
