package collab

type OperationType string

const (
	InsertOperation OperationType = "insert"
	DeleteOperation OperationType = "delete"
)

type Operation struct {
	Type        OperationType `json:"type"`
	StartPos    int           `json:"startPos"`
	EndPos      int           `json:"endPos"`
	Text        string        `json:"text"`
	ServerRowID int           `json:"rowID"`
}

func NewInsertOperation(startPos int, text string, rowID int) *Operation {
	return &Operation{
		Type:        InsertOperation,
		StartPos:    startPos,
		EndPos:      startPos + len(text),
		Text:        text,
		ServerRowID: rowID,
	}
}

func NewDeleteOperation(startPos, endPos int, rowID int) *Operation {
	return &Operation{
		Type:        DeleteOperation,
		StartPos:    startPos,
		EndPos:      endPos,
		Text:        "",
		ServerRowID: rowID,
	}
}
