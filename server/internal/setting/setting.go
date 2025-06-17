package setting

type Setting struct {
	SiteName string `json:"site_name"`
	SiteURL  string `json:"site_url"`
	Logo     string `json:"logo"`
	Theme    string `json:"theme"`
	Footer   string `json:"footer"`
	Language string `json:"language"`
}
