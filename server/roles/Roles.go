package roles

type Role string

const (
	Reader Role = "reader"
	Editor Role = "editor"
	Admin  Role = "admin"
)
