package revisions

type RevisionRepository[T interface{}] interface {
	Init() error
	GetLatestRevision(recordID int) (*Revision[T], error)
	AddRevision(e *Revision[T]) error
}
