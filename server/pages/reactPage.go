package pages

import (
	"fmt"
	"regexp"
	"strings"
)

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
	reactIndexRegExp = regexp.MustCompile(`<script[^>]{0,} src="([^"]+)"|<link[^>]{0,} href="([^"]+)"`)
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
	fmt.Println("Matches:", matches)
	for _, match := range matches {
		fmt.Println("Match:", match)
		if len(match) < 3 {
			continue
		}
		if strings.HasPrefix(match[0], "<script") && match[1] != "" {
			meta.JsUrl = match[1]
		}
		if strings.HasPrefix(match[0], "<link") && match[2] != "" {
			meta.CssUrl = match[2]
		}
	}
	return meta
}
