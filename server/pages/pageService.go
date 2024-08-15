package pages

import (
	"time"

	"github.com/dannyswat/wikigo/common/errors"
	"github.com/go-playground/validator/v10"
)

type PageService struct {
	DB PageRepository
}

func (s *PageService) GetPageByID(id int) (*Page, error) {
	return s.DB.GetPageByID(id)
}

func (s *PageService) GetPageByUrl(url string) (*Page, error) {
	return s.DB.GetPageByUrl(url)
}

func (s *PageService) GetPagesByAuthor(author string) ([]*PageMeta, error) {
	return s.DB.GetPagesByAuthor(author)
}

func (s *PageService) GetPagesByParentID(parentID *int) ([]*PageMeta, error) {
	return s.DB.GetPagesByParentID(parentID)
}

func (s *PageService) CreatePage(page *Page, user string) error {
	if err := ValidatePage(page, true); err != nil {
		return err
	}
	if page.ParentID != nil {
		parent, err := s.DB.GetPageByID(*page.ParentID)
		if err != nil {
			return err
		}
		if parent == nil {
			return errors.NewValidationError("parent page not found", "ParentID")
		}
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
		return errors.NewValidationError("page is nil", "")
	}
	if !isNew && page.ID == 0 {
		return errors.NewValidationError("page not found", "")
	}
	v := validator.New()
	if err := v.Struct(page); err != nil {
		validateError := err.(validator.ValidationErrors)

		aggError := &errors.AggregateValidationError{}
		for _, e := range validateError {
			aggError.AddError(errors.NewValidationError(e.Error(), e.Field()))
		}
		return aggError
	}
	return nil
}
