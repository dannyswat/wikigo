package pages

import (
	"regexp"
	"time"

	"github.com/dannyswat/wikigo/common/errors"
	"github.com/dannyswat/wikigo/revisions"
	"github.com/go-playground/validator/v10"
)

type PageService struct {
	DB              PageRepository
	RevisionService *revisions.RevisionService[*Page]
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

func (s *PageService) GetAllPages(includeProtected bool) ([]*PageMeta, error) {
	return s.DB.GetAllPages(includeProtected)
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
	oldPage, err := s.DB.GetPageByID(page.ID)
	if err != nil {
		return err
	}
	if err := ValidatePage(page, false); err != nil {
		return err
	}
	page.LastModifiedAt = time.Now()
	page.LastModifiedBy = user
	err = s.DB.UpdatePage(page)
	if err != nil {
		return err
	}
	return s.RevisionService.AddRevision(page.ID, oldPage)
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
	if matched, err := regexp.Match(`^(([/])|(([/][a-zA-Z0-9-]+)+))$`, []byte(page.Url)); !matched || err != nil {
		return errors.NewValidationError("invalid url", "Url")
	}
	return nil
}
