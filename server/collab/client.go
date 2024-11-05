package collab

import "github.com/gorilla/websocket"

type Client struct {
	ID         string              `json:"id"`
	Connection *websocket.Conn     `json:"-"`
	Operations []*Operation        `json:"operations"`
	Space      *CollaborationSpace `json:"-"`
}

func NewClient(id string, conn *websocket.Conn, space *CollaborationSpace) *Client {
	client := &Client{
		ID:         id,
		Connection: conn,
		Operations: make([]*Operation, 0),
		Space:      space,
	}
	space.Clients[id] = client
	return client
}

func (c *Client) AddOperation(op *Operation) {
	c.Operations = append(c.Operations, op)
}
