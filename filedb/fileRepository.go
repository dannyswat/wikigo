package filedb

import (
	"errors"
)

type FileObject interface {
	GetID() int
	SetID(id int)
	GetKey() string
}

type FileRepository[T FileObject] interface {
	Init() error
	Create(object T) error
}

type fileRepository[T FileObject] struct {
	Path  string
	index FileIndex[T]
}

func NewFileRepository[T FileObject](path string) FileRepository[T] {
	return &fileRepository[T]{Path: path, index: NewFileIndex[T](path)}
}

func (fileRepository *fileRepository[T]) Init() error {
	if err := fileRepository.index.EnsureFileIndexCreated(); err != nil {
		return err
	}
	return fileRepository.index.LoadFileIndex()
}

func (fileRepository *fileRepository[T]) Create(object T) error {
	if _, err := fileRepository.index.GetEntry(object.GetKey()); err == nil {
		return errors.New("object already exists")
	}
	return fileRepository.index.AddEntry(object)
}
