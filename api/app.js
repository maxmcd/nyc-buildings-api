var restify   = require('restify');
var server    = restify.createServer({
	name: 'nyc-buildings-api',
});

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);

var Building  = sequelize.define('buildings', {
  "bbl"                        : Sequelize.STRING,
  "bin"                        : Sequelize.STRING,
  "health_area"                : Sequelize.STRING,
  "census_tract"               : Sequelize.STRING,
  "community_board"            : Sequelize.STRING,
  "buildings_on_lot"           : Sequelize.STRING,
  "tax_block"                  : Sequelize.STRING,
  "condo"                      : Sequelize.STRING,
  "vacant"                     : Sequelize.STRING,
  "cross_streets"              : Sequelize.STRING,
  "dob_special_place_name"     : Sequelize.STRING,
  "landmark_status"            : Sequelize.STRING,
  "local_law"                  : Sequelize.STRING,
  "environmental_restrictions" : Sequelize.STRING,
  "legal_adult_use"            : Sequelize.STRING,
  "loft_law"                   : Sequelize.STRING,
  "special_status"             : Sequelize.STRING,
  "city_owned"                 : Sequelize.STRING,
  "special_district"           : Sequelize.STRING,
  "complaints_total"           : Sequelize.STRING,
  "complaints_open"            : Sequelize.STRING,
  "violations_dob_total"       : Sequelize.STRING,
  "violations_dob_open"        : Sequelize.STRING,
  "violations_ecb_total"       : Sequelize.STRING,
  "violations_ecb_open"        : Sequelize.STRING,
});
  


// -----------------------------
// Endpoints
// -----------------------------
server.get('/building/:bbl', function(req, res) {
    var bbl = req.params.lot;

    Building
    	.findOne({where:{bbl:bbl}})
  		.complete(function (err, data) {
 				res.send(data);
 			});
  }
);

server.get('/another', function(req, res) {
	Building.create({
		"bbl": "1008820021",
		"bin": "1018131",
	  "health_area": "5300",
	  "census_tract":"68",
	  "community_board":"105",
	  "buildings_on_lot":"1",
	  "tax_block":"882",
	  "condo":"NO",
	  "vacant":"NO",
	  "cross_streets":"EAST   26 STREET,   EAST   27 STREET",
	  "dob_special_place_name":"",
	  "landmark_status":"",
	  "local_law":"YES",
	  "environmental_restrictions":"N/A",
	  "legal_adult_use":"NO",
	  "loft_law":"NO",
	  "special_status":"N/A",
	  "city_owned":"NO",
	  "special_district":"UNKNOWN",
	  "complaints_total":"33",
	  "complaints_open":"0",
	  "violations_dob_total":"50",
	  "violations_dob_open":"2",
	  "violations_ecb_total":"14",
	  "violations_ecb_open":"4"
	}).then(function(building) {
	  console.log(building.get({
	    plain: true
	  }))
	}).then(function() {
		res.send('foo - it was added');
	});	
})




// -----------------------------
// Start 'er up
// -----------------------------
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});