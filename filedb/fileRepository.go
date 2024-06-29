package filedb

import (
	"errors"
	"reflect"
)

type FileObject interface {
	GetID() string
	GetKey() string
}

type FileRepository[T FileObject] interface {
	Init() error
	Create(object T) error
}

type fileRepository[T FileObject] struct {
	Path  string
	index FileIndex
}

func NewFileRepository[T FileObject](path string) FileRepository[T] {
	return &fileRepository[T]{Path: path, index: NewFileIndex(path)}
}

func (fileRepository *fileRepository[T]) Init() error {
	return fileRepository.index.EnsureFileIndexCreated(newObj[T], getKey, getId)
}

func (fileRepository *fileRepository[T]) Create(object T) error {
	index, err := fileRepository.index.LoadFileIndex()
	if err != nil {
		return err
	}
	if _, ok := index[object.GetKey()]; ok {
		return errors.New("object already exists")
	}

	err = fileRepository.index.AddEntry(object, getKey, getId)
	if err != nil {
		return err
	}
	return nil
}

func newObj[T interface{}]() interface{} {
	var zero [0]T
	tType := reflect.TypeOf(zero).Elem()
	return reflect.New(tType)
}

func getKey(o interface{}) string {
	return o.(FileObject).GetKey()
}

func getId(o interface{}) string {
	return o.(FileObject).GetKey()
}
