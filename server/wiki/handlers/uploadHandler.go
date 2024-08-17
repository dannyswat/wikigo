package handlers

import (
	"encoding/base64"

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
