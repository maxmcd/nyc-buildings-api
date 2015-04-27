package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gethaven/nyc-buildings-api/scraper/db"
	"github.com/gethaven/nyc-buildings-api/scraper/jsonscrape"
)

var locations jsonscrape.Locations

func init() {

	var err error
	locations, err = jsonscrape.ParseLocations("https://raw.githubusercontent.com/gethaven/nyc-buildings-api/master/scraper/locations/locations.json")
	// locations, err = jsonscrape.ParseLocalLocations("scraper/locations/locations.json")
	if err != nil {
		log.Println("error parsing locations file:")
		log.Fatal(err)
	}

}

func main() {
	db.Connect()
	http.HandleFunc("/", LinkHandler)
	port := "8001"
	log.Println("Server running on port:", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func LinkHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Add("Connection", "keep-alive")
	w.Header().Add("Keep-Alive", "timeout=600")

	log.Println(req.URL)
	link := req.URL.Query().Get("link")

	if link == "" {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("include a link"))
		return
	}

	outputs, err := jsonscrape.GetOutputFromUrl(link, locations)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		log.Println("error with jsonscrape: ", err.Error())
		return
	}

	var errors []string

	var wg sync.WaitGroup
	for _, output := range outputs {
		wg.Add(1)
		go func(output jsonscrape.Output) {
			err := db.WriteColumnsMapToTable(
				output.Columns,
				output.Table,
				output.Identifier,
			)
			if err != nil {
				log.Println(err)
				errors = append(errors, err.Error())
			}
			wg.Done()
		}(output)
	}
	wg.Wait()

	output := strings.Join(errors, ", ")
	if len(output) > 0 {
		w.Write([]byte(output))
		log.Println("errors: ", output)
	} else {
		w.Write([]byte(fmt.Sprintf("parsed %d records", len(outputs))))
	}
	return
}
