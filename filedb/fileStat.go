package filedb

import (
	"bufio"
	"os"
	"path/filepath"
	"strconv"
)

type FileStat interface {
	EnsureFileStatCreated() error
	CreateFileStat() error
	LoadFileStat() error
	SaveFileStat() error
	GetNextId() int
	GetCount() int
}

type fileStat struct {
	path         string
	statFilePath string
	locker       LockManager
	nextId       int
	count        int
}

func NewFileStat(path string) FileStat {
	return &fileStat{
		path:         path,
		statFilePath: filepath.FromSlash(path + "/stat"),
		locker:       NewLockManager(),
		nextId:       1,
		count:        0,
	}
}

func (fileStat *fileStat) EnsureFileStatCreated() error {
	if _, err := os.Stat(fileStat.statFilePath); os.IsNotExist(err) {
		return fileStat.CreateFileStat()
	}
	return nil
}

func (fileStat *fileStat) CreateFileStat() error {
	fileStat.locker.Lock(fileStat.statFilePath)
	defer fileStat.locker.Unlock(fileStat.statFilePath)

	file, err := os.OpenFile(fileStat.statFilePath, os.O_CREATE, 0666)
	if err != nil {
		return err
	}
	defer file.Close()
	file.WriteString("1\n0\n")
	return nil
}

func (fileStat *fileStat) LoadFileStat() error {
	fileStat.locker.Lock(fileStat.statFilePath)
	defer fileStat.locker.Unlock(fileStat.statFilePath)

	file, err := os.Open(fileStat.statFilePath)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var line string
	if scanner.Scan() {
		line = scanner.Text()
	}
	if nextId, err := strconv.Atoi(line); err != nil {
		return err
	} else {
		fileStat.nextId = nextId
	}
	if scanner.Scan() {
		line = scanner.Text()
	}
	if count, err := strconv.Atoi(line); err != nil {
		return err
	} else {
		fileStat.count = count
	}

	return nil
}

func (fileStat *fileStat) SaveFileStat() error {
	fileStat.locker.Lock(fileStat.statFilePath)
	defer fileStat.locker.Unlock(fileStat.statFilePath)

	file, err := os.OpenFile(fileStat.statFilePath, os.O_RDWR, 0666)
	if err != nil {
		return err
	}
	defer file.Close()

	file.Truncate(0)
	file.Seek(0, 0)

	file.WriteString(strconv.Itoa(fileStat.nextId) + "\n")
	file.WriteString(strconv.Itoa(fileStat.count) + "\n")

	return nil
}

func (fileStat *fileStat) GetNextId() int {
	fileStat.locker.Lock(fileStat.statFilePath + "/nextId")
	defer fileStat.locker.Unlock(fileStat.statFilePath + "/nextId")

	id := fileStat.nextId
	fileStat.nextId++

	go fileStat.SaveFileStat()

	return id
}

func (fileStat *fileStat) GetCount() int {
	return fileStat.count
}
