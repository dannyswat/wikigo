package handlers

import (
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/dannyswat/wikigo/filemanager"
	"github.com/labstack/echo/v4"
)

type UploadHandler struct {
	FileManager filemanager.FileManager
}

type UploadFileRequest struct {
	FileBase64 string `json:"file" validate:"required"`
	FileName   string `json:"fileName" validate:"required"`
	Path       string `json:"path" validate:"required"`
}

func (uh *UploadHandler) UploadFile(e echo.Context) error {
	// Get the file from the request
	req := new(UploadFileRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	// Save the file to the media path
	fileBinary, err := base64.StdEncoding.DecodeString(req.FileBase64)
	if err != nil {
		return e.JSON(400, err)
	}
	err = uh.FileManager.SaveFile(fileBinary, req.FileName, req.Path)
	if err != nil {
		return e.JSON(400, err)
	}

	return e.JSON(200, "File uploaded successfully")
}

type CKEditorUploadRequest struct {
	Upload []byte `form:"upload" validate:"required"`
}

var (
	allowedExtensions    = []string{".jpg", ".jpeg", ".png", ".gif"}
	invalidFileNameChars = `[ \/:*?"<>|]`
)

func (uh *UploadHandler) CKEditorUpload(e echo.Context) error {
	req := new(CKEditorUploadRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	upload := e.Request().MultipartForm.File["upload"][0]
	file, err := upload.Open()
	if err != nil {
		return e.JSON(400, err)
	}
	defer file.Close()
	fileBinary, err := io.ReadAll(file)
	if err != nil {
		return e.JSON(400, err)
	}
	disposition := upload.Header.Get("Content-Disposition")
	_, mediaParams, err := mime.ParseMediaType(disposition)
	if err != nil {
		return e.JSON(400, err)
	}
	ext := filepath.Ext(mediaParams["filename"])
	onlyFileName := strings.TrimSuffix(filepath.Base(mediaParams["filename"]), ext)
	cleanFileName := regexp.MustCompile(invalidFileNameChars).ReplaceAllString(onlyFileName, "")
	fileName := fmt.Sprintf("%d_%s%s", time.Now().Unix(), cleanFileName, ext)
	path := "/uploads"

	if !slices.Contains(allowedExtensions, ext) {
		return e.JSON(400, "file extension not allowed")
	}

	err = uh.FileManager.SaveFile(fileBinary, fileName, path)
	if err != nil {
		return e.JSON(400, err)
	}

	return e.JSON(200, map[string]interface{}{
		"uploaded": 1,
		"fileName": fileName,
		"url":      "/media" + path + "/" + fileName,
	})
}

func (uh *UploadHandler) CreatePath(e echo.Context) error {
	path := e.QueryParam("path")
	err := uh.FileManager.CreatePath(path)
	if err != nil {
		return e.JSON(400, err)
	}
	return e.JSON(200, "Path created successfully")
}

type SaveDiagramRequest struct {
	DiagramJson string `json:"diagram" validate:"required"`
	SvgContent  string `json:"svg" validate:"required"`
	Id          string `json:"id" validate:"required"`
}

type SaveDiagramResponse struct {
	Id            string `json:"id"`
	DiagramSvgUrl string `json:"diagramSvgUrl"`
}

func (uh *UploadHandler) SaveDiagram(e echo.Context) error {
	req := new(SaveDiagramRequest)
	if err := e.Bind(req); err != nil {
		return e.JSON(400, err)
	}
	err := uh.FileManager.SaveFile([]byte(req.DiagramJson), req.Id+".json", "dgsource")
	if err != nil {
		return e.JSON(500, err)
	}
	err = uh.FileManager.SaveFile([]byte(req.SvgContent), req.Id+".svg", "diagrams")
	if err != nil {
		return e.JSON(500, err)
	}
	return e.JSON(200, &SaveDiagramResponse{
		Id:            req.Id,
		DiagramSvgUrl: "/media/diagrams/" + req.Id + ".svg",
	})
}
