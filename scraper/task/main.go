package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"strings"

	"github.com/gethaven/nyc-buildings-api/scraper/db"
	"github.com/gethaven/nyc-buildings-api/scraper/jsonscrape"
)

var locations jsonscrape.Locations

func deleteRecords(data []string, datas []string) []string {
	w := 0 // write index

loop:
	for _, x := range data {
		for _, id := range datas {
			if id == x {
				continue loop
			}
		}
		data[w] = x
		w++
	}
	return data[:w]
}

func main() {
	db.Connect()
	var err error
	locations, err = jsonscrape.ParseLocations("https://raw.githubusercontent.com/gethaven/nyc-buildings-api/master/scraper/locations/locations.json")
	if err != nil {
		log.Println("error parsing locations file:")
		log.Fatal(err)
	}

	bytes, err := ioutil.ReadFile("../../data/BINsu.txt")
	if err != nil {
		log.Println(err)
	}
	bins := strings.Split(string(bytes), "\n")

	bytes, err = ioutil.ReadFile("../../data/bin.txt")
	if err != nil {
		log.Println(err)
	}
	completedBins := strings.Split(string(bytes), "\n")

	bins = deleteRecords(bins, completedBins)

	ci := make(chan string, len(bins))
	for _, bin := range bins {
		ci <- bin
	}

	for n := 0; n < 10; n++ {
		go func() {
			for {
				bin := <-ci
				var url string
				url = "http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=" +
					bin
				_, err := jsonscrape.GetOutputFromUrl(url, locations)
				if err != nil {
					log.Println("error with jsonscrape: ", err.Error())
					return
				}
				fmt.Println("Scraped", bin)
			}
		}()
	}
	select {}
}
