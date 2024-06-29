package users

import "github.com/dannyswat/wikigo/filedb"

type UserFileRepository interface{}

type userFileRepository struct {
	Path string
	Repo filedb.FileRepository[User]
}

func NewUserFileRepository(path string) UserFileRepository {
	return &userFileRepository{Path: path, Repo: filedb.NewFileRepository[User](path)}
}

func (repo *userFileRepository) CreateUser(user User) error {
	return repo.Repo.Create(user)
}
