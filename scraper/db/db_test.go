package db

import "testing"

var columns map[string]string
var table string

func init() {
	columns = map[string]string{
		"bin":                        "6",
		"vacant":                     "NO",
		"landmark_status":            "",
		"special_district":           "UNKNOWN",
		"complaints_total":           "33",
		"violations_ecb_open":        "4",
		"buildings_on_lot":           "1",
		"census_tract":               "68",
		"cross_streets":              "EAST   26 STREET,  EAST   27 STREET",
		"local_law":                  "YES",
		"legal_adult_use":            "NO",
		"special_status":             "N/A",
		"health_area":                "5300",
		"city_owned":                 "NO",
		"tax_block":                  "882",
		"condo":                      "NO",
		"loft_law":                   "NO",
		"complaints_open":            "0",
		"violations_dob_total":       "50",
		"violations_dob_open":        "5",
		"violations_ecb_total":       "14",
		"community_board":            "105",
		"environmental_restrictions": "N/A",
		"dob_special_place_name":     "",
	}

	table = "buildings"
}
func TestConnect(t *testing.T) {
	Connect()
}

func TestWriteColumnsMapToTable(t *testing.T) {
	err := WriteColumnsMapToTable(columns, table, "bin")
	if err != nil {
		t.Error(err)
	}
}

func TestCheckExistence(t *testing.T) {
	_, err := checkExistence(columns, table, "bin")
	if err != nil {
		t.Error(err)
	}
}
