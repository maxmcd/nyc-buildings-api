# nyc-dob-api
Simple api and notification service built on top of NYC's DOB building information search.


## API

**Dev Setup**
``` bash
# cd into api directory
createdb nyc-buildings-api
npm install
npm install -g sequelize-cli
sequelize db:migrate
```




Add a looping structure to the json format so that we can tell the parser t grab links on a page and then concurrently scrape those sublinks. 

Once a we scrape a sublink it is just passed back up the tree and parsed as a regular url. This process could technically go on continually. 

Node talks to go with a query string that is easiest for the go api to turn into the correct bis url, while still being relatively simple for the nodejs app to reference. 

Background tasks could maybe be handled as a datbase table that is checked regularly. 