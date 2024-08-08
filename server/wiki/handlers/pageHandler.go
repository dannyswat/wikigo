package handlers

import (
	"strconv"

	"github.com/dannyswat/wikigo/common/apihelper"
	"github.com/dannyswat/wikigo/pages"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
)

type PageHandler struct {
	PageService *pages.PageService
	HtmlPolicy  *bluemonday.Policy
}

func (h *PageHandler) GetPageByID(e echo.Context) error {
	idStr := e.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return e.JSON(400, "invalid page id")
	}
	page, err := h.PageService.GetPageByID(id)
	if err != nil {
		return e.JSON(404, err)
	}
	return e.JSON(200, page)
}

func (h *PageHandler) GetPageByUrl(e echo.Context) error {
	url := e.Param("url")
	page, err := h.PageService.GetPageByUrl(url)
	if err != nil {
		return e.JSON(404, err)
	}
	return e.JSON(200, page)
}

func (h *PageHandler) GetPagesByAuthor(e echo.Context) error {
	author := e.QueryParam("author")
	pages, err := h.PageService.GetPagesByAuthor(author)
	if err != nil {
		return e.JSON(404, err)
	}
	return e.JSON(200, pages)
}

func (h *PageHandler) GetPagesByParentID(e echo.Context) error {
	idStr := e.Param("id")
	var id *int
	if idStr != "" {
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			return e.JSON(400, "invalid page id")
		}
		id = &idInt
	}

	pages, err := h.PageService.GetPagesByParentID(id)
	if err != nil {
		return e.JSON(404, err)
	}
	return e.JSON(200, pages)
}

type CreatePageRequest struct {
	Url       string   `json:"url" validate:"required,max=100"`
	Title     string   `json:"title" validate:"required,max=100"`
	Content   string   `json:"content" validate:"required"`
	ShortDesc string   `json:"shortDesc" validate:"max=300"`
	ParentID  *int     `json:"parentId"`
	Tags      []string `json:"tags" validate:"max=10"`
}

func (h *PageHandler) CreatePage(e echo.Context) error {

	req := new(CreatePageRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	if err := validator.New().Struct(req); err != nil {
		return e.JSON(400, "invalid request")
	}
	page := new(pages.Page)
	page.Url = req.Url
	page.Title = req.Title
	page.Content = h.HtmlPolicy.Sanitize(req.Content)
	page.ShortDesc = req.ShortDesc
	page.ParentID = req.ParentID
	page.Tags = req.Tags
	if err := h.PageService.CreatePage(page, apihelper.GetUserId(e)); err != nil {
		return apihelper.ReturnErrorResponse(e, err)
	}
	return e.JSON(200, req)
}

type UpdatePageRequest struct {
	ID        int      `json:"id" validate:"required"`
	Url       string   `json:"url" validate:"required,max=100"`
	Title     string   `json:"title" validate:"required,max=100"`
	Content   string   `json:"content" validate:"required"`
	ShortDesc string   `json:"shortDesc" validate:"max=300"`
	ParentID  *int     `json:"parentId"`
	Tags      []string `json:"tags" validate:"max=10"`
}

func (h *PageHandler) UpdatePage(e echo.Context) error {
	req := new(UpdatePageRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	if err := validator.New().Struct(req); err != nil {
		return e.JSON(400, "invalid request")
	}
	page := new(pages.Page)
	page.ID = req.ID
	page.Url = req.Url
	page.Title = req.Title
	page.Content = h.HtmlPolicy.Sanitize(req.Content)
	page.ShortDesc = req.ShortDesc
	page.ParentID = req.ParentID
	page.Tags = req.Tags
	if err := h.PageService.UpdatePage(page, apihelper.GetUserId(e)); err != nil {
		return apihelper.ReturnErrorResponse(e, err)
	}
	return e.JSON(200, req)
}

func (h *PageHandler) DeletePage(e echo.Context) error {
	idStr := e.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return e.JSON(400, "invalid page id")
	}
	if err := h.PageService.DeletePage(id); err != nil {
		return apihelper.ReturnErrorResponse(e, err)
	}
	return e.JSON(200, "page deleted")
}