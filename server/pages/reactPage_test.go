package pages

import (
	"testing"
)

type DummyPage struct{}

func TestGetReactPageMeta(t *testing.T) {
	html := `<html><head><link rel="stylesheet" href="/static/main.css"><script src="/static/main.js"></script></head></html>`
	meta := GetReactPageMeta(html)
	if meta == nil {
		t.Fatal("Expected meta, got nil")
	}
	if meta.JsUrl != "/static/main.js" {
		t.Errorf("Expected JsUrl '/static/main.js', got '%s'", meta.JsUrl)
	}
	if meta.CssUrl != "/static/main.css" {
		t.Errorf("Expected CssUrl '/static/main.css', got '%s'", meta.CssUrl)
	}
}

func TestGetReactPageMeta_NoMatch(t *testing.T) {
	html := `<html><head></head><body>No scripts or links</body></html>`
	meta := GetReactPageMeta(html)
	if meta != nil {
		t.Errorf("Expected nil, got %+v", meta)
	}
}

func TestNewReactPage(t *testing.T) {
	page := &Page{}
	meta := &ReactPageMeta{JsUrl: "/js/app.js", CssUrl: "/css/app.css"}
	rp := NewReactPage(page, meta)
	if rp.JsUrl != meta.JsUrl {
		t.Errorf("Expected JsUrl '%s', got '%s'", meta.JsUrl, rp.JsUrl)
	}
	if rp.CssUrl != meta.CssUrl {
		t.Errorf("Expected CssUrl '%s', got '%s'", meta.CssUrl, rp.CssUrl)
	}
	if rp.Page != page {
		t.Error("Expected embedded Page to match input Page")
	}
}
