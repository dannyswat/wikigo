package pages

import "regexp"

type ReactPageMeta struct {
	JsUrl  string `json:"jsUrl"`
	CssUrl string `json:"cssUrl"`
}

type ReactPage struct {
	*Page
	JsUrl  string `json:"jsUrl"`
	CssUrl string `json:"cssUrl"`
}

var (
	reactIndexRegExp = regexp.MustCompile(`<script[^>]+ src="([^"]+)"|<link[^>]+ href="([^"]+)"`)
)

func NewReactPage(page *Page, reactPage *ReactPageMeta) *ReactPage {
	return &ReactPage{
		Page:   page,
		JsUrl:  reactPage.JsUrl,
		CssUrl: reactPage.CssUrl,
	}
}

func GetReactPageMeta(content string) *ReactPageMeta {
	matches := reactIndexRegExp.FindAllStringSubmatch(content, -1)
	if len(matches) == 0 {
		return nil
	}
	meta := &ReactPageMeta{}
	for _, match := range matches {
		if len(match) < 2 {
			continue
		}
		if match[1] != "" {
			meta.JsUrl = match[1]
		} else if match[2] != "" {
			meta.CssUrl = match[2]
		}
	}
	return meta
}
