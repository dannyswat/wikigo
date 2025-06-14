package revisions

import "time"

type RevisionService[T interface{}] struct {
	Repository RevisionRepository[T]
}

func (s *RevisionService[T]) Init() error {
	return s.Repository.Init()
}

func (s *RevisionService[T]) GetLatestRevision(recordID int) (*Revision[T], error) {
	return s.Repository.GetLatestRevision(recordID)
}

func (s *RevisionService[T]) AddRevision(recordID int, record T) error {
	e := &Revision[T]{RecordID: recordID, Record: record}
	e.InsertDate = time.Now()
	return s.Repository.AddRevision(e)
}
