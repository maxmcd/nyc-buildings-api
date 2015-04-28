# NYC Buildings API
A Simple API and notification service built on top of NYC's DOB building information search.

## Documentation
[NYC Buildings API Documentation](http://gethaven.github.io/nyc-buildings-api-docs)

## Development

This application consists of two components. A public-facing Node api built on restify, and a scraping server written in Go.

### Overview

### API

**Dev Setup**
``` bash
# cd into api directory
createdb nyc-buildings-api
npm install
npm install -g sequelize-cli
sequelize db:migrate
```

## Resources

 - Goat http://a030-goat.nyc.gov/goat/Default.aspx
 - BIS http://a810-bisweb.nyc.gov/bisweb/bispi00.jsp

**ToDo**
 - Sentence case all the all-caps complaints
 - Validate JSON file when parsing

**Notes**
Add a looping structure to the json format so that we can tell the parser t grab links on a page and then concurrently scrape those sublinks. 

Once a we scrape a sublink it is just passed back up the tree and parsed as a regular url. This process could technically go on continually. 

Node talks to go with a query string that is easiest for the go api to turn into the correct bis url, while still being relatively simple for the nodejs app to reference. 

Background tasks could maybe be handled as a datbase table that is checked regularly. 



## Archive.org

If we want to scrape information from archive.org, a few guidelines:
 - There's an endpoint to check if a url exists: `http://archive.org/wayback/available?url=`
 - You can return all records for an available domain. Responses are limited to 150,000 items:
	 + Two example urls:
		 + http://web.archive.org/cdx/search/cdx?url=http://a810-bisweb.nyc.gov/bisweb/*&output=json&offset=150000
		 + http://web.archive.org/cdx/search/cdx?url=http://a810-bisweb.nyc.gov/bisweb/*&output=json
	 + Docs here: https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server
 - The archived content of the page can be returned by using urls like so: http://web.archive.org/web/20121110215833/http://a810-bisweb.nyc.gov
	 - The url format is `http://web.archive.org/web/{most-recent-timestamp}/{url}`
	 - If you don't want to return the Wayback Machine header append `id_` to `most-recent-timestap`
	 - `most-recent-timestamp` self-corrects. You can just pass a very recent timestamp
	 - Example of a well formatteed query: http://web.archive.org/web/20100607134616id_/http://a810-bisweb.nyc.gov/bisweb