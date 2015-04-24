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

server.get('/buildings/:bin', function(req, res) {
    var bin    = req.params.bin;
    var output = getBuildingOutput(bin, function(output) {
	    if (output) {
	    	res.send(output);
	    }
			else {
				var url = '?link=' + encodeURIComponent('http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=' + bin);
				code = passUrlToScraper("http://localhost:8001", url)
				if (code != 200) {
						res.status(code);
						res.send();
				} else {
					var output = getBuildingOutput(bin, function(output) {
						res.status(200);
						res.send(output);
					})
				}
			}
    });
  }
);


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

function getBuildingOutput(bin, callback) {
	Building
	.findOne({where:{bin:bin}})
	.complete(function (err, data) {
		var output = false;
		if (data != null) {
			var data = data.dataValues;
			output = {
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
		}
		return callback(output);
	});
}

function passUrlToScraper(url) {
	try {
		var res = request(url);
		return res.status		
	} catch (e) {
		return 500
	}
}


// -----------------------------
// Start 'er up
// -----------------------------
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});