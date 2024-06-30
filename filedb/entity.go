package filedb

type Entity interface {
	GetID() int
	SetID(id int)
	GetKey() string
}

func GetEntityID(e interface{}) int {
	return e.(Entity).GetID()
}

func GetEntityKey(e interface{}) string {
	return e.(Entity).GetKey()
}

func NewEntity[T Entity]() interface{} {
	return new(T)
}
