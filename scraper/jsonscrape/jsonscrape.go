package jsonscrape

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type Locations struct {
	Endpoints []Endpoints `json:"endpoints"`
}
type Endpoints struct {
	Root  string  `json:"root"`
	Paths []Paths `json:"paths"`
}
type Paths struct {
	Name  string  `json:"name"`
	Items []Items `json:"items"`
}
type Items struct {
	Location string `json:"location"`
	Name     string `json:"name"`
	Regex    string `json:"regex"`
}

func ParseLocations(filepath string) (locations Locations, err error) {
	bytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		return
	}
	json.Unmarshal(bytes, &locations)
	return
}

func MatchUrl(url string, locations Locations) (items []Items, err error) {
	for _, endpoint := range locations.Endpoints {
		rootMatchString := endpoint.Root + ".*"
		rootMatchString = prepareStringForRegex(rootMatchString)
		match, err := regexp.MatchString(rootMatchString, url)
		if err != nil {
			log.Fatal(err)
		}
		if match == true {
			items, err = MatchPath(url, endpoint.Root, endpoint.Paths)
			if err == nil {
				return items, err
			}
		}
	}
	err = fmt.Errorf("no match found")
	return
}

func MatchPath(url, root string, paths []Paths) (items []Items, err error) {
	for _, path := range paths {
		splitPaths := strings.Split(path.Name, "|")
		for _, splitPath := range splitPaths {
			regexSplitPath := strings.Replace(splitPath, "*", ".*", -1)
			pathMatchString := root + regexSplitPath
			pathMatchString = prepareStringForRegex(pathMatchString)
			match, err := regexp.MatchString(pathMatchString, url)
			if err != nil {
				// hmm, ignore this for now?
				// need to find an error test case
				// return items, err
			}
			if match == true {
				items = path.Items
				return items, err
			}
		}
	}
	err = fmt.Errorf("no matched paths")
	return
}

func ReturnValuesFromDoc(doc *goquery.Document, items []Items) (
	values map[string]string) {

	values = make(map[string]string)

	for _, item := range items {
		text := doc.Find(item.Location).Text()
		text = strings.TrimSpace(text)

		// replace &nbsp; with regular space
		text = strings.Replace(text, "\u00a0", " ", -1)

		if item.Regex != "" {
			re := regexp.MustCompile(item.Regex)
			results := re.FindAllStringSubmatch(text, -1)
			if len(results) > 0 {
				text = ""
				for _, value := range results[0][1:] {
					text = text + value
				}
			}
		}
		values[item.Name] = text
	}
	return
}

func prepareStringForRegex(input string) string {
	input = strings.Replace(input, "?", "\\?", -1)
	input = strings.Replace(input, "/", "\\/", -1)
	return input
}

func main() {

}
