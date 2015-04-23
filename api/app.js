var restify   = require('restify');
var server    = restify.createServer({
	name: 'nyc-buildings-api',
	formatters: {
		'application/json': jsonFormatter
	},
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

server.get('/building/:bin', function(req, res) {
    var bin    = req.params.bin;
    var output = findBIN(bin);

    if (output) {
    	res.send(output)
    }
		else {
			// create a url to pass
			var host = 'http://localhost:8001';
			var path = '/?link=' + 'http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=' + bin;

			var options = {
			  host:   host,
			  path:   path,
			  method: 'GET',
			};

			var req = http.request(options, function(res) {
				if (res.statusCode == '200') {
					console.log('yay');
				}
				else {
					console.log('fuck')
				}
			});
		}
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
// Utilities
// -----------------------------
function jsonFormatter(req, res, body) {
  if (!body) {
	if (res.getHeader('Content-Length') === undefined &&
		res.contentLength === undefined) {
	  res.setHeader('Content-Length', 0);
	}
	return null;
  }
 
  if (body instanceof Error) {
	// snoop for RestError or HttpError, but don't rely on instanceof
	if ((body.restCode || body.httpCode) && body.body) {
	  body = body.body;
	} else {
	  body = {
		message: body.message
	  };
	}
  }
 
  if (Buffer.isBuffer(body))
	body = body.toString('base64');
 
  var data = JSON.stringify(body, null, 2);
 
  if (res.getHeader('Content-Length') === undefined &&
	  res.contentLength === undefined) {
	res.setHeader('Content-Length', Buffer.byteLength(data));
  }
 
  return data;
}

function findBIN(bin) {
	Building
	.findOne({where:{bin:bin}})
	.complete(function (err, data) {
			if (data != null) {
				var data = data.dataValues;
				var output = {
				bbl                        : data.bbl,
				bin                        : data.bin,
				health_area                : data.health_area,
				census_tract               : data.census_tract,
				community_board            : data.community_board,
				buildings_on_lot           : data.buildings_on_lot,
				tax_block                  : data.tax_block,
				condo                      : data.condo,
				vacant                     : data.vacant,
				cross_streets              : data.cross_streets,
				dob_special_place_name     : data.dob_special_place_name,
				landmark_status            : data.landmark_status,
				local_law                  : data.local_law,
				environmental_restrictions : data.environmental_restrictions,
				legal_adult_use            : data.legal_adult_use,
				loft_law                   : data.loft_law,
				special_status             : data.special_status,
				city_owned                 : data.city_owned,
				special_district           : data.special_district,
				complaints                 : {
					total                    : data.complaints_total,
					open                     : data.complaints_open,
				},
				violations                 : {
					dob_total                : data.violations_dob_total,
					dob_open                 : data.violations_dob_open,
					ecb_total                : data.violations_ecb_total,
					ecb_open                 : data.violations_ecb_open,
				},
				}
				return output;
			}
			else {
				return false
			}
}


// -----------------------------
// Start 'er up
// -----------------------------
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});