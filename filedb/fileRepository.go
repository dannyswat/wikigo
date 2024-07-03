package filedb

import (
	"encoding/json"
	"errors"
	"os"
	"strconv"
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
	stat  FileStat
}

func NewFileRepository[T FileObject](path string) FileRepository[T] {
	return &fileRepository[T]{
		Path:  path,
		index: NewFileIndex[T](path),
		stat:  NewFileStat(path),
	}
}

func (fileRepository *fileRepository[T]) Init() error {
	if err := fileRepository.index.EnsureFileIndexCreated(); err != nil {
		return err
	}
	if err := fileRepository.index.LoadFileIndex(); err != nil {
		return err
	}
	if err := fileRepository.stat.EnsureFileStatCreated(); err != nil {
		return err
	}
	if err := fileRepository.stat.LoadFileStat(); err != nil {
		return err
	}
	return nil
}

func (fileRepository *fileRepository[T]) Create(object T) error {
	if _, err := fileRepository.index.GetEntry(object.GetKey()); err == nil {
		return errors.New("object already exists")
	}
	object.SetID(fileRepository.stat.GetNextId())

	file, err := os.Create(fileRepository.Path + "/" + strconv.Itoa(object.GetID()) + ".obj")
	if err != nil {
		return err
	}
	defer file.Close()
	jsonBytes, err := json.Marshal(object)
	if err != nil {
		return err
	}
	file.Write(jsonBytes)

	if err := fileRepository.index.AddEntry(object); err != nil {
		return err
	}
	if err := fileRepository.stat.SaveFileStat(); err != nil {
		return err
	}

	return nil
}
