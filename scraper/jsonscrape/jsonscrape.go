package jsonscrape

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/mitchellh/goamz/aws"
	"github.com/mitchellh/goamz/s3"
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
	Items      []Items `json:"items"`
	Table      string  `json:"table"`
	Identifier string  `json:"identifier"`
	Type       string  `json:"type"`
}
type Items struct {
	Location string `json:"location"`
	Name     string `json:"name"`
	Regex    string `json:"regex"`
}

type Output struct {
	Table      string
	Identifier string
	Columns    map[string]string
}

/*
Returns urls from a page that need to be scraped
Takes the document and an array of items. Looks
for the "location" or regex match of each item
and then extracts its href and calculates its
absolute url.

A list of urls to scrape is returned.
*/
func returnUrlsFromDoc(doc *goquery.Document, items []Items) (
	urls []string) {
	for _, item := range items {
		doc.Find(item.Location).Each(func(i int, s *goquery.Selection) {
			href, exists := s.Attr("href")
			if exists == true {
				parseUrl, err := url.Parse(href)
				if err != nil {
					log.Println(err)
				} else {
					href = doc.Url.ResolveReference(parseUrl).String()
					urls = append(urls, href)
				}
			}
		})
	}
	return
}

/*
TODO
The NYC bis uses forms for some links. This function
parses the form inputs and generates the necessary
url string to follow.
*/
func ReturnFormUrlsFromDoc(doc *goquery.Document, items []Items) (
	urls []string) {

	return
}

/*
Recursive page parsing function. Takes a slice of
directives and the page.

Looks for three type of directives. "links" for a
directive that returns links that need to be
scraped. "form" for a directive that returns links
calculated from forms. "scrape" the most common
directive, that simply returns values scraped from
a page.

Any urls created from the first two directive are
passed to the GetOutputFromUrl, which calls this
function to grab the necessary output. This
operation will be repeated recursively until all
outputs are generated and returned.
*/
func parseDirectivesWithDoc(doc *goquery.Document, directives []Directives) (outputs []Output) {
	for _, directive := range directives {

		var urls []string
		if directive.Type == "links" {
			urls = returnUrlsFromDoc(doc, directive.Items)
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
			values := returnTableValuesFromDoc(doc, directive.Items)
			outputs = append(outputs, Output{
				Table:      directive.Table,
				Columns:    values,
				Identifier: directive.Identifier,
			})
		}

	}
	return
}

func randSeq(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func GetOutputFromUrl(url string) (outputs []Output, err error) {
	var resp *http.Response

	for {
		client := &http.Client{}
		req, err := http.NewRequest("GET", url, nil)
		req.Header.Add("User-Agent", randSeq(100))
		resp, err = client.Do(req)
		if err != nil {
			log.Println(err)
			time.Sleep(time.Second * 20)
		} else {
			break
		}
	}
	doc, err := goquery.NewDocumentFromResponse(resp)
	if err != nil {
		log.Println(err)
		return
	}

	err = archivePageToS3(doc)
	if err != nil {
		log.Println(err)
	}
	locations, err := parseLocations("../locations/locations.json")
	if err != nil {
		log.Println(err)
	}
	directives, err := getDirectives(url, locations)
	if err != nil {
		log.Println(err)
	}
	outputs = parseDirectivesWithDoc(doc, directives)
	return
}

func returnTableValuesFromDoc(doc *goquery.Document, items []Items) (
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

func parseLocations(filepath string) (locations Locations, err error) {
	bytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		return
	}
	json.Unmarshal(bytes, &locations)
	return
}

func getDirectives(url string, locations Locations) (directives []Directives, err error) {
	for _, endpoint := range locations.Endpoints {
		rootMatchString := endpoint.Root + ".*"
		rootMatchString = prepareStringForRegex(rootMatchString)
		match, err := regexp.MatchString(rootMatchString, url)
		if err != nil {
			log.Fatal(err)
		}
		if match == true {
			directives, err = matchPath(url, endpoint.Root, endpoint.Paths)
			if err == nil {
				return directives, err
			}
		}
	}
	err = fmt.Errorf("no match found")
	return
}

func matchPath(url, root string, paths []Paths) (directives []Directives, err error) {
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

func archivePageToS3(doc *goquery.Document) error {

	auth, err := aws.EnvAuth()
	if err != nil {
		return err
	}

	client := s3.New(auth, aws.USEast)
	bucket := client.Bucket("nycb-api")
	html, err := doc.Html()
	if err != nil {
		return err
	}

	timestamp := time.Now().UnixNano()
	url := doc.Url.Host + doc.Url.RequestURI()
	fmt.Printf("%d, %s\n", timestamp, url)
	err = bucket.Put(
		fmt.Sprintf("%s/%d", url, timestamp),
		[]byte(html),
		"text/html",
		s3.AuthenticatedRead,
	)
	if err != nil {
		return err
	}

	return nil
}
