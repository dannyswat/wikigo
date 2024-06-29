package filedb

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
)

type FileIndex interface {
	EnsureFileIndexCreated(newObject ObjectCreator, key PropertySelector, id PropertySelector) error
	CreateFileIndex(newObject ObjectCreator, key PropertySelector, id PropertySelector) error
	LoadFileIndex() (map[string]string, error)
	GetEntry(key string) (string, error)
	DeleteEntry(key string) error
	AddEntry(object interface{}, key PropertySelector, id PropertySelector) error
}

type PropertySelector func(interface{}) string
type ObjectCreator func() interface{}

type fileIndex struct {
	path   string
	locker *Lock
}

func NewFileIndex(path string) FileIndex {
	return &fileIndex{path: path, locker: &Lock{}}
}

func (fileIndex *fileIndex) EnsureFileIndexCreated(newObject ObjectCreator, key PropertySelector, id PropertySelector) error {
	_, err := os.Stat(filepath.FromSlash(fileIndex.path + "/index"))
	if os.IsNotExist(err) {
		return fileIndex.CreateFileIndex(newObject, key, id)
	}
	return err
}

func (fileIndex *fileIndex) CreateFileIndex(newObject ObjectCreator, key PropertySelector, id PropertySelector) error {

	file, err := os.OpenFile(filepath.FromSlash(fileIndex.path+"/index"), os.O_CREATE, 0666)
	if err != nil {
		return err
	}
	defer file.Close()

	objectFiles, err := os.ReadDir(fileIndex.path)
	if err != nil {
		return err
	}
	for _, objectFile := range objectFiles {
		if objectFile.IsDir() {
			continue
		}
		objectBytes, err := os.ReadFile(filepath.FromSlash(fileIndex.path + "/" + objectFile.Name()))
		if err != nil {
			return err
		}
		object := newObject()
		err = json.Unmarshal(objectBytes, object)
		if err != nil {
			return err
		}
		file.WriteString(key(object) + ":" + id(object) + "\n")
	}

	return nil
}

func (fileIndex *fileIndex) LoadFileIndex() (map[string]string, error) {
	file, err := os.Open(filepath.FromSlash(fileIndex.path + "/index"))
	if err != nil {
		return nil, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	index := make(map[string]string)
	for scanner.Scan() {
		line := scanner.Text()
		index[line[:len(line)-1]] = line[len(line)-1:]
	}
	return index, nil
}

func (fileIndex *fileIndex) GetEntry(key string) (string, error) {
	file, err := os.Open(filepath.FromSlash(fileIndex.path + "/index"))
	if err != nil {
		return "", err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if line[:len(key)] == key {
			return line[len(key)+1:], nil
		}
	}
	return "", nil
}

func (fileIndex *fileIndex) DeleteEntry(key string) error {
	file, err := os.OpenFile(filepath.FromSlash(fileIndex.path+"/index"), os.O_RDWR, 0666)
	if err != nil {
		return err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	entries := make([]string, 0)
	for scanner.Scan() {
		line := scanner.Text()
		if line[:len(key)] == key {
			continue
		}
		entries = append(entries, line)
	}
	file.Truncate(0)
	file.Seek(0, 0)
	for _, entry := range entries {
		file.WriteString(entry + "\n")
	}
	return nil
}

func (fileIndex *fileIndex) AddEntry(object interface{}, key PropertySelector, id PropertySelector) error {
	file, err := os.OpenFile(filepath.FromSlash(fileIndex.path+"/index"), os.O_APPEND, 0666)
	if err != nil {
		return err
	}
	defer file.Close()
	file.WriteString(key(object) + ":" + id(object) + "\n")
	return nil
}
