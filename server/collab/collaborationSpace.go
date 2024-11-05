package collab

import "sync"

type CollaborationSpace struct {
	Clients    map[string]*Client      `json:"clients"`
	Operations []*TransformedOperation `json:"operations"`
	State      string                  `json:"state"`
	mutex      sync.Mutex
	rowID      int
	stateRowID int
}

func NewCollaborationSpace() *CollaborationSpace {
	return &CollaborationSpace{
		Clients:    make(map[string]*Client),
		Operations: make([]*TransformedOperation, 0),
		State:      "",
		mutex:      sync.Mutex{},
		rowID:      0,
	}
}

type TransformedOperation struct {
	ClientID  string     `json:"clientId"`
	Operation *Operation `json:"operation"`
	RowID     int        `json:"rowId"`
}

func (s *CollaborationSpace) AddOperation(clientID string, op *Operation) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	s.rowID++
	rowID := s.rowID
	s.Clients[clientID].AddOperation(op)
	s.transformOperations(clientID, op)
	s.Operations = append(s.Operations, &TransformedOperation{
		ClientID:  clientID,
		Operation: op,
		RowID:     rowID,
	})
}

func (s *CollaborationSpace) transformOperations(clientID string, operation *Operation) {
	for _, op := range s.Operations {
		if op.ClientID != clientID && op.RowID > s.stateRowID {
			op.Operation = transform(operation, op.Operation)
		}
	}
}

func transform(operation, other *Operation) *Operation {
	if operation.StartPos <= other.StartPos {
		return operation
	}
	if operation.StartPos >= other.EndPos {
		return &Operation{
			Type:     operation.Type,
			StartPos: operation.StartPos + len(other.Text),
			EndPos:   operation.EndPos + len(other.Text),
			Text:     operation.Text,
		}
	}
	if operation.Type == InsertOperation {
		return &Operation{
			Type:     operation.Type,
			StartPos: other.StartPos,
			EndPos:   other.StartPos + len(operation.Text),
			Text:     operation.Text,
		}
	}
	if operation.Type == DeleteOperation {
		return &Operation{
			Type:     operation.Type,
			StartPos: other.StartPos,
			EndPos:   operation.EndPos,
			Text:     "",
		}
	}
	return operation
}
