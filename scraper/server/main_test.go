package main

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/gethaven/nyc-buildings-api/scraper/db"
)

func init() {
	db.Connect()
}

func TestLinkHandler(t *testing.T) {
	lex88 := "http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?boro=1&block=882&lot=21&go3=+GO+&requestid=0"

	req, err := http.NewRequest(
		"GET",
		"http://example.com/?link="+url.QueryEscape(lex88),
		nil,
	)
	if err != nil {
		t.Error(err)
	}
	w := httptest.NewRecorder()

	LinkHandler(w, req)
}
