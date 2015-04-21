package jsonscrape

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/url"
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
	Name       string       `json:"name"`
	Directives []Directives `json:"directives"`
}
type Directives struct {
	Items []Items `json:"items"`
	Table string  `json:"table"`
	Type  string  `json:"type"`
}
type Items struct {
	Location string `json:"location"`
	Name     string `json:"name"`
	Regex    string `json:"regex"`
}

type Output struct {
	Table   string
	Columns map[string]string
}

func ReturnUrlsFromDoc(doc *goquery.Document, items []Items) (
	urls []string) {
	for _, item := range items {
		doc.Find(item.Location).Each(func(i int, s *goquery.Selection) {
			href, exists := s.Attr("href")
			if exists == true {
				parseUrl, err := url.Parse(href)
				if err != nil {
					log.Println(err)
				}

				href = doc.Url.ResolveReference(parseUrl).String()
				urls = append(urls, href)
			}
		})
	}
	return
}
func ReturnFormUrlsFromDoc(doc *goquery.Document, items []Items) (
	urls []string) {

	return
}

func ParseDirectivesWithDoc(doc *goquery.Document, directives []Directives) (outputs []Output) {
	for _, directive := range directives {

		var urls []string
		if directive.Type == "links" {
			urls = ReturnUrlsFromDoc(doc, directive.Items)
		} else if directive.Type == "form" {
			urls = ReturnFormUrlsFromDoc(doc, directive.Items)
		}
		for _, url := range urls {
			linkOutput, err := GetOutputFromUrl(url)
			if err != nil {
				log.Println(err)
			}
			outputs = append(outputs, linkOutput...)
		}

		if directive.Type == "scrape" {
			values := ReturnTableValuesFromDoc(doc, directive.Items)
			outputs = append(outputs, Output{
				Table:   directive.Table,
				Columns: values,
			})
		}

	}
	return
}

func GetOutputFromUrl(url string) (outputs []Output, err error) {

	doc, err := goquery.NewDocument(url)
	if err != nil {
		log.Println(err)
		return
	}
	locations, err := ParseLocations("../locations/locations.json")
	if err != nil {
		log.Println(err)
	}
	directives, err := GetDirectives(url, locations)
	if err != nil {
		log.Println(err)
	}
	outputs = ParseDirectivesWithDoc(doc, directives)
	return
}

func ReturnTableValuesFromDoc(doc *goquery.Document, items []Items) (
	values map[string]string) {

	values = make(map[string]string)

	for _, item := range items {
		fmt.Println(item.Location)
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

func ParseLocations(filepath string) (locations Locations, err error) {
	bytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		return
	}
	json.Unmarshal(bytes, &locations)
	return
}

func GetDirectives(url string, locations Locations) (directives []Directives, err error) {
	for _, endpoint := range locations.Endpoints {
		rootMatchString := endpoint.Root + ".*"
		rootMatchString = prepareStringForRegex(rootMatchString)
		match, err := regexp.MatchString(rootMatchString, url)
		if err != nil {
			log.Fatal(err)
		}
		if match == true {
			directives, err = MatchPath(url, endpoint.Root, endpoint.Paths)
			if err == nil {
				return directives, err
			}
		}
	}
	err = fmt.Errorf("no match found")
	return
}

func MatchPath(url, root string, paths []Paths) (directives []Directives, err error) {
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
				directives = path.Directives
				return directives, err
			}
		}
	}
	err = fmt.Errorf("no matched paths")
	return
}

func prepareStringForRegex(input string) string {
	input = strings.Replace(input, "?", "\\?", -1)
	input = strings.Replace(input, "/", "\\/", -1)
	return input
}

func main() {

}
