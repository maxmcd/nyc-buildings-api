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
