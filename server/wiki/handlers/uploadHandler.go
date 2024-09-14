package handlers

import (
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"path/filepath"
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
	allowedExtensions = []string{".jpg", ".jpeg", ".png", ".gif", ".svg"}
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
	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), mediaParams["filename"])
	path := "/uploads"

	if !slices.Contains(allowedExtensions, strings.ToLower(filepath.Ext(fileName))) {
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
