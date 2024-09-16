package pages

import (
	"regexp"

	"github.com/microcosm-cc/bluemonday"
)

func CreateHtmlPolicy() *bluemonday.Policy {
	policy := bluemonday.UGCPolicy()
	policy.AllowAttrs("class").Matching(regexp.MustCompile("^(language-[a-zA-Z0-9]+)$")).OnElements("code", "pre")
	policy.AllowAttrs("data-language").OnElements("pre")
	policy.AllowAttrs("target").OnElements("a")
	return policy
}
