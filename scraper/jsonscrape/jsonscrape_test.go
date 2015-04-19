package jsonscrape

import (
	"encoding/json"
	"testing"

	"github.com/PuerkitoBio/goquery"
)

var locations Locations
var items []Items

const (
	lex88          = "http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?boro=1&block=882&lot=21&go3=+GO+&requestid=0"
	jsonTestString = `
	{
		"health_area": "5300",
		"census_tract":"68",
		"community_board":"105",
		"buildings_on_lot":"1",
		"tax_block":"882",
		"condo":"NO",
		"vacant":"NO",
		"cross_streets":"EAST   26 STREET,   EAST   27 STREET",
		"dob_special_place_name":"",
		"landmark_status":"",
		"local_law":"YES",
		"environmental_restrictions":"N/A",
		"legal_adult_use":"NO",
		"loft_law":"NO",
		"special_status":"N/A",
		"city_owned":"NO",
		"special_district":"UNKNOWN",
		"complaints_total":"33",
		"complaints_open":"0",
		"violations_dob_total":"50",
		"violations_dob_open":"2",
		"violations_ecb_total":"14",
		"violations_ecb_open":"4"
	}
	`
)

func TestParseLocations(t *testing.T) {
	var err error
	locations, err = ParseLocations("../locations/locations.json")
	if err != nil {
		t.Error(err)
	}
	if len(locations.Endpoints) < 1 {
		t.Errorf("not enough endpoints in struct")
	}
}

func TestMatchUrl(t *testing.T) {
	var err error
	items, err = MatchUrl(
		lex88,
		locations,
	)
	if err != nil {
		t.Error(err)
	}
	if len(items) < 1 {
		t.Errorf("nope, items should be returned")
	}
}

func TestReturnValuesFromDoc(t *testing.T) {
	doc, err := goquery.NewDocument(lex88)
	if err != nil {
		t.Error(err)
	}
	values := ReturnValuesFromDoc(doc, items)
	testJson := make(map[string]string)
	err = json.Unmarshal([]byte(jsonTestString), &testJson)
	if err != nil {
		t.Error(err)
	}
	for key, value := range testJson {
		if values[key] != value {
			t.Errorf(
				"Wrong value for key %s. Got \"%s\" wanted \"%s\"",
				key,
				values[key],
				value,
			)
		}
	}
}
