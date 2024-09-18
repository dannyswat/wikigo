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
	policy.AllowAttrs("style").OnElements("span", "div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img", "table", "tr", "td", "th", "tbody", "thead", "tfoot", "caption", "ul", "ol", "li", "blockquote", "code", "pre", "hr", "br", "em", "strong", "b", "i", "u", "s", "sub", "sup", "del", "mark", "small", "big", "center", "font", "strike")
	return policy
}
