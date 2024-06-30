package filedb

import (
	"bufio"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
)

type FileIndex[T Entity] interface {
	EnsureFileIndexCreated() error
	CreateFileIndex() error
	LoadFileIndex() error
	SaveFileIndex() error
	SaveFileIndexAsync(erc chan error)
	GetEntry(key string) (int, error)
	DeleteEntry(key string) error
	AddEntry(object T) error
}

type PropertySelector func(interface{}) string
type IDSelector func(interface{}) int
type ObjectCreator func() interface{}

type fileIndex[T Entity] struct {
	path       string
	indexPath  string
	locker     LockManager
	indexCache *sync.Map
}

func NewFileIndex[T Entity](path string) FileIndex[T] {
	return &fileIndex[T]{
		path:       path,
		indexPath:  filepath.FromSlash(path + "/index"),
		locker:     NewLockManager(),
		indexCache: new(sync.Map),
	}
}

func (fileIndex *fileIndex[T]) CreateFileIndex() error {
	if _, err := os.Stat(fileIndex.indexPath); !os.IsNotExist(err) {
		return errors.New("index already exists")
	}

	fileIndex.locker.Lock(fileIndex.indexPath)
	defer fileIndex.locker.Unlock(fileIndex.indexPath)

	file, err := os.OpenFile(fileIndex.indexPath, os.O_CREATE, 0666)
	if err != nil {
		return err
	}

	objectFiles, err := os.ReadDir(fileIndex.indexPath)
	if err != nil {
		return err
	}
	for _, objectFile := range objectFiles {
		if !strings.HasSuffix(objectFile.Name(), ".obj") {
			continue
		}
		objectBytes, err := os.ReadFile(filepath.FromSlash(fileIndex.path + "/" + objectFile.Name()))
		if err != nil {
			return err
		}
		object := NewEntity[T]()
		err = json.Unmarshal(objectBytes, object)
		if err != nil {
			return err
		}
		file.WriteString(object.(Entity).GetKey() + "\t" + strconv.Itoa(object.(Entity).GetID()) + "\n")
	}

	return nil
}

func (fileIndex *fileIndex[T]) EnsureFileIndexCreated() error {
	_, err := os.Stat(fileIndex.indexPath)
	if os.IsNotExist(err) {
		return fileIndex.CreateFileIndex()
	}
	return err
}

func (fileIndex *fileIndex[T]) LoadFileIndex() error {
	file, err := os.Open(fileIndex.indexPath)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		id, err := strconv.Atoi(line[len(line)-1:])
		if err != nil {
			return err
		}
		fileIndex.indexCache.Store(line[:len(line)-1], id)
	}

	return nil
}

func (fileIndex *fileIndex[T]) SaveFileIndex() error {
	fileIndex.indexCache.Range(func(key, value interface{}) bool {
		if strings.Contains(key.(string), "\t") {
			return false
		}
		return true
	})

	fileIndex.locker.Lock(fileIndex.indexPath)
	defer fileIndex.locker.Unlock(fileIndex.indexPath)

	file, err := os.OpenFile(fileIndex.indexPath, os.O_RDWR, 0666)
	if err != nil {
		return err
	}
	defer file.Close()

	file.Truncate(0)
	file.Seek(0, 0)

	fileIndex.indexCache.Range(func(key, value interface{}) bool {
		file.WriteString(key.(string) + "\t" + strconv.Itoa(value.(int)) + "\n")
		return true
	})
	return nil
}

func (fileIndex *fileIndex[T]) SaveFileIndexAsync(erc chan error) {
	erc <- fileIndex.SaveFileIndex()
}

func (fileIndex *fileIndex[T]) GetEntry(key string) (int, error) {
	id, ok := fileIndex.indexCache.Load(key)
	if !ok {
		return 0, errors.New("key not found")
	}

	return id.(int), nil
}

func (fileIndex *fileIndex[T]) DeleteEntry(key string) error {
	if strings.Contains(key, "\t") {
		return errors.New("key cannot contain tab character")
	}
	_, loaded := fileIndex.indexCache.LoadAndDelete(key)
	if !loaded {
		return errors.New("key not found")
	}

	go fileIndex.SaveFileIndex()
	return nil
}

func (fileIndex *fileIndex[T]) AddEntry(object T) error {
	if strings.Contains(object.GetKey(), "\t") {
		return errors.New("key cannot contain tab character")
	}
	fileIndex.locker.Lock(fileIndex.path + "/index")
	defer fileIndex.locker.Unlock(fileIndex.path + "/index")

	_, loaded := fileIndex.indexCache.LoadOrStore(object.GetKey(), object.GetID())
	if loaded {
		return errors.New("key already exists")
	}

	file, err := os.OpenFile(filepath.FromSlash(fileIndex.indexPath), os.O_APPEND, 0666)
	if err != nil {
		return err
	}
	defer file.Close()
	file.WriteString(object.GetKey() + "\t" + strconv.Itoa(object.GetID()) + "\n")

	return nil
}
