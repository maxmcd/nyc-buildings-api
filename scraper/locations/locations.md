## Scraping locations structure

### Json Description
"endpoints" defines the beginning of a url string. This is converted into a regex and the inbound url is checked against all possible endpoints until a match is found. 

The paths contain wildcard matches for the rest of the url. Regex is permitted as an alternative for both the endpoints and paths.

In each path:
 - "name" defines the path
 - "location" defines a css path to the element
 - "regex" defines a regex match if not all text is needed. All regex groups will be pulled and concated from the regex string.

### Go conversion
Use [gojson](https://github.com/ChimeraCoder/gojson) to convert json file into Go struct. 
```
cat locations.json | gojson
```
Output:
```go
type Locations struct {
	Endpoints []struct {
		Paths []struct {
			Items []struct {
				Location string `json:"location"`
				Name     string `json:"name"`
				Regex    string `json:"regex"`
			} `json:"items"`
			Name string `json:"name"`
		} `json:"paths"`
		Root string `json:"root"`
	} `json:"endpoints"`
}
```