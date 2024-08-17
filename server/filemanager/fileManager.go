package filemanager

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type FileManager interface {
	Init()
	SaveFile(fileBinary []byte, fileName string, path string) error
	DeleteFile(fileName string, path string) error
	CreatePath(path string) error
	ListFiles(path string) ([]string, error)
	DeletePathIfEmpty(path string) error
}

type fileManager struct {
	RootPath             string
	DisallowedExtensions []string
	MaxFileSize          string
	maxFileSizeBytes     int64
}

func NewFileManager(rootPath string, disallowedExtensions []string, maxFileSize string) (FileManager, error) {
	fm := &fileManager{
		RootPath:             rootPath,
		DisallowedExtensions: disallowedExtensions,
		MaxFileSize:          maxFileSize,
	}
	err := fm.setMaxFileSize(maxFileSize)
	if err != nil {
		return nil, err
	}
	return fm, nil
}

func (fm *fileManager) Init() {

	_, err := os.Stat(fm.RootPath)
	if os.IsNotExist(err) {
		os.Mkdir(fm.RootPath, 0755)
	}
}

func (fm *fileManager) SaveFile(fileBinary []byte, fileName string, path string) error {
	if !fm.isFileNameAllowed(fileName) {
		return fmt.Errorf("file extension not allowed")
	}
	if !fm.isPathAllowed(path) {
		return fmt.Errorf("invalid path")
	}
	if int64(len(fileBinary)) > fm.maxFileSizeBytes {
		return fmt.Errorf("file size exceeds the maximum allowed size")
	}
	filePath := filepath.FromSlash(filepath.Join(fm.RootPath, path, fileName))
	err := os.MkdirAll(filepath.Dir(filePath), 0755)
	if err != nil {
		return err
	}
	_, err = os.Stat(filePath)
	if os.IsExist(err) {
		fm.DeleteFile(fileName, path)
	}
	err = os.WriteFile(filePath, fileBinary, 0644)
	return err
}

func (fm *fileManager) DeleteFile(fileName string, path string) error {
	filePath := filepath.FromSlash(filepath.Join(fm.RootPath, path, fileName))
	return os.Remove(filePath)
}

func (fm *fileManager) CreatePath(path string) error {
	if !fm.isPathAllowed(path) {
		return fmt.Errorf("invalid path")
	}
	filePath := filepath.FromSlash(filepath.Join(fm.RootPath, path))
	return os.MkdirAll(filePath, 0755)
}

func (fm *fileManager) DeletePathIfEmpty(path string) error {
	if !fm.isPathAllowed(path) {
		return fmt.Errorf("invalid path")
	}
	filePath := filepath.FromSlash(filepath.Join(fm.RootPath, path))
	files, err := os.ReadDir(filePath)
	if err != nil {
		return err
	}
	if len(files) == 0 {
		return os.Remove(filePath)
	}
	return nil
}

func (fm *fileManager) ListFiles(path string) ([]string, error) {
	if !fm.isPathAllowed(path) {
		return nil, fmt.Errorf("invalid path")
	}
	filePath := filepath.FromSlash(filepath.Join(fm.RootPath, path))
	files, err := os.ReadDir(filePath)
	if err != nil {
		return nil, err
	}
	fileNames := make([]string, len(files))
	for _, file := range files {
		fileNames = append(fileNames, file.Name())
	}
	return fileNames, nil
}

func (fm *fileManager) isFileNameAllowed(fileName string) bool {
	ext := strings.ToLower(filepath.Ext(fileName))
	for _, disallowedExt := range fm.DisallowedExtensions {
		if disallowedExt == ext {
			return false
		}
	}
	return true
}

func (fm *fileManager) isPathAllowed(path string) bool {
	return strings.HasPrefix(path, "/") && !strings.Contains(path, "..")
}

func (fm *fileManager) setMaxFileSize(maxFileSize string) error {
	var err error
	fm.maxFileSizeBytes, err = parseSize(maxFileSize)
	return err
}

func parseSize(size string) (int64, error) {
	var unit int64
	var num float64
	_, err := fmt.Sscanf(size, "%f%c", &num, &unit)
	if err != nil {
		return 0, err
	}
	switch unit {
	case 'K':
		return int64(num * 1024), nil
	case 'M':
		return int64(num * 1024 * 1024), nil
	case 'G':
		return int64(num * 1024 * 1024 * 1024), nil
	default:
		return 0, fmt.Errorf("invalid unit")
	}
}
