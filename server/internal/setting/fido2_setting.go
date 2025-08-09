package setting

type Fido2Setting struct {
	ID          string   `json:"id"`
	DisplayName string   `json:"display_name"`
	Hosts       []string `json:"hosts"`
}
