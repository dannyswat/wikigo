package revisions

import (
	"strconv"
	"time"
)

type Revision[T interface{}] struct {
	ID         int       `json:"id"`
	RecordID   int       `json:"recordId"`
	InsertDate time.Time `json:"insertDate"`
	Record     T         `json:"record"`
}

func (r *Revision[T]) GetID() int {
	return r.ID
}

func (r *Revision[T]) SetID(id int) {
	r.ID = id
}

func (r *Revision[T]) GetValue(field string) string {
	switch field {
	case "RecordID":
		return strconv.Itoa(r.RecordID)
	case "InsertDate":
		return r.InsertDate.String()
	}
	return ""
}
