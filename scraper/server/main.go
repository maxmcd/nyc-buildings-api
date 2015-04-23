package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gethaven/nyc-buildings-api/scraper/db"
	"github.com/gethaven/nyc-buildings-api/scraper/jsonscrape"
)

func main() {
	db.Connect()
	http.HandleFunc("/", LinkHandler)
	port := "8001"
	log.Println("Server running on port:", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func LinkHandler(w http.ResponseWriter, req *http.Request) {
	link := req.URL.Query().Get("link")

	fmt.Println(link)
	outputs, err := jsonscrape.GetOutputFromUrl(link)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var errors []string
	for _, output := range outputs {
		err := db.WriteColumnsMapToTable(
			output.Columns,
			output.Table,
			output.Identifier,
		)
		if err != nil {
			log.Println(err)
			errors = append(errors, err.Error())
		}
	}

	output := strings.Join(errors, ", ")
	if len(output) > 0 {
		w.Write([]byte(output))
	} else {
		w.Write([]byte("ok"))
	}

	return
}
