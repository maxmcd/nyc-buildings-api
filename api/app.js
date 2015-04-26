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
var config, sequelize;
if (env == "production") {
	console.log(process.env.NYCBDB)
	sequelize = new Sequelize("postgres://" + process.env.NYCBDB);
} else {
	config    = require(__dirname + '/config/config.json')[env];
	sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// -----------------------------
// Model definitions
// -----------------------------

var Building  = sequelize.define('buildings', {
  'bbl'                             : Sequelize.STRING,
  'bin'                             : Sequelize.STRING,
  'health_area'                     : Sequelize.STRING,
  'census_tract'                    : Sequelize.STRING,
  'community_board'                 : Sequelize.STRING,
  'buildings_on_lot'                : Sequelize.STRING,
  'tax_block'                       : Sequelize.STRING,
  'condo'                           : Sequelize.STRING,
  'vacant'                          : Sequelize.STRING,
  'cross_streets'                   : Sequelize.STRING,
  'dob_special_place_name'          : Sequelize.STRING,
  'landmark_status'                 : Sequelize.STRING,
  'local_law'                       : Sequelize.STRING,
  'environmental_restrictions'      : Sequelize.STRING,
  'legal_adult_use'                 : Sequelize.STRING,
  'loft_law'                        : Sequelize.STRING,
  'special_status'                  : Sequelize.STRING,
  'city_owned'                      : Sequelize.STRING,
  'special_district'                : Sequelize.STRING,
  'complaints_total'                : Sequelize.STRING,
  'complaints_open'                 : Sequelize.STRING,
  'violations_dob_total'            : Sequelize.STRING,
  'violations_dob_open'             : Sequelize.STRING,
  'violations_ecb_total'            : Sequelize.STRING,
  'violations_ecb_open'             : Sequelize.STRING,
});

var Complaint  = sequelize.define('complaints', {
  'bin'                             : Sequelize.STRING,
  'complaint_num'                   : Sequelize.STRING,
  'regarding'                       : Sequelize.STRING,
  'category'                        : Sequelize.STRING,
  'assigned_to'                     : Sequelize.STRING,
  'priority'                        : Sequelize.STRING,
  'received'                        : Sequelize.STRING,
  'block'                           : Sequelize.STRING,
  'lot'                             : Sequelize.STRING,
  'community_board'                 : Sequelize.STRING,
  'owner'                           : Sequelize.STRING,
  'last_inspection'                 : Sequelize.STRING,
  'disposition'                     : Sequelize.STRING,
  'dob_violation_num'               : Sequelize.STRING,
  'ecb_violation_num'               : Sequelize.STRING,
  'comments'                        : Sequelize.STRING,
});

var DOB_Violation  = sequelize.define('dob_violations', {
  'bin'                             : Sequelize.STRING,
  'violation_number'                : Sequelize.STRING,
  'violation_category'              : Sequelize.STRING,
  'issue_date'                      : Sequelize.STRING,
  'violation_type'                  : Sequelize.STRING,
  'device_number'                   : Sequelize.STRING,
  'ecb_number'                      : Sequelize.STRING,
  'infraction_codes'                : Sequelize.STRING,
  'description'                     : Sequelize.STRING,
  'disposition_code'                : Sequelize.STRING,
  'disposition_date'                : Sequelize.STRING,
  'disposition_inspector'           : Sequelize.STRING,
  'comments'                        : Sequelize.STRING,
});

var ECB_Violation  = sequelize.define('ecb_violations', {
  'bin'                             : Sequelize.STRING,
  'violation_number'                : Sequelize.STRING,
  'dob_violation_number'            : Sequelize.STRING,
  'violation_status'                : Sequelize.STRING,
  'severity'                        : Sequelize.STRING,
  'certification_status'            : Sequelize.STRING,
  'hearing_status'                  : Sequelize.STRING,
  'respondent_name'                 : Sequelize.STRING,
  'respondent_mailing_address'      : Sequelize.STRING,
  'violation_date'                  : Sequelize.STRING,
  'violation_type'                  : Sequelize.STRING,
  'violation_served_date'           : Sequelize.STRING,
  'violation_inspection_unit'       : Sequelize.STRING,
  'infraction_codes'                : Sequelize.STRING,
  'section_of_law'                  : Sequelize.STRING,
  'standard_description'            : Sequelize.STRING,
  'specifics_and_remedy'            : Sequelize.STRING,
  'issuing_inspector_id'            : Sequelize.STRING,
  'issued_as_aggravated_level'      : Sequelize.STRING,
  'compliance_certification_status' : Sequelize.STRING,
  'compliance_on'                   : Sequelize.STRING,
  'scheduled_hearing_date'          : Sequelize.STRING,
  'scheduled_hearing_status'        : Sequelize.STRING,
  'scheduled_hearing_time'          : Sequelize.STRING,
  'penalty_imposed'                 : Sequelize.STRING,
  'penalty_adjustments'             : Sequelize.STRING,
  'penalty_amount_paid'             : Sequelize.STRING,
  'penalty_balance_due'             : Sequelize.STRING,
  'penalty_court_docket_date'       : Sequelize.STRING,
});


// -----------------------------
// Endpoints
// -----------------------------

server.get('/', function(req, res) {
	res.send('Hello world.')
});

server.get('/buildings/:bin', function(req, res) {
    var bin    = req.params.bin;
    var output = getBuilding_profile(bin, function(output) {
	    if (output) {
	    	res.status(200);
	    	res.send(output);
	    }
			else {
				var url = '?link=' + encodeURIComponent('http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=' + bin);
				code = passUrlToScraper("http://localhost:8001", url);
				if (code != 200) {
						res.status(code);
						res.send();
				} else {
					var output = getBuilding_profile(bin, function(output) {
						res.status(200);
						res.send(output);
					})
				}
			}
    });
  }
);

server.get('/buildings/:bin/complaints', function(req, res) {
    var bin    = req.params.bin;
    var output = getBuilding_complaints(bin, function(output) {
	    if (output) {
	    	res.status(200);
	    	res.send(output);
	    }
			else {
				var url = '?link=' + encodeURIComponent('http://a810-bisweb.nyc.gov/bisweb/ComplaintsByAddressServlet?allbin=' + bin);
				code = passUrlToScraper("http://localhost:8001", url);
				if (code != 200) {
						res.status(code);
						res.send();
				} else {
					var output = getBuilding_complaints(bin, function(output) {
						res.status(200);
						res.send(output);
					})
				}
			}
    });
  }
);

server.get('/complaint/:complaint_num', function(req, res) {
    var complaint_num = req.params.complaint_num;
    var output        = getComplaint(complaint_num, function(output) {
	    if (output) {
	    	res.send(output);
	    }
			else {
				var url = '?link=' + encodeURIComponent('http://a810-bisweb.nyc.gov/bisweb/OverviewForComplaintServlet?vlcompdetlkey=' + bin);
				code = passUrlToScraper("http://localhost:8001", url);
				if (code != 200) {
						res.status(code);
						res.send();
				} else {
					var output = getBuilding_profile(bin, function(output) {
						res.status(200);
						res.send(output);
					})
				}
			}
    });
  }
);






server.get('/create/building', function(req, res) {
	Building.create({
		'bbl'                        : '1008820021',
		'bin'                        : '1018131',
	  'health_area'                : '5300',
	  'census_tract'               : '68',
	  'community_board'            : '105',
	  'buildings_on_lot'           : '1',
	  'tax_block'                  : '882',
	  'condo'                      : 'NO',
	  'vacant'                     : 'NO',
	  'cross_streets'              : 'East 26 Street, East 27 Street',
	  'dob_special_place_name'     : '',
	  'landmark_status'            : '',
	  'local_law'                  : 'YES',
	  'environmental_restrictions' : 'N/A',
	  'legal_adult_use'            : 'NO',
	  'loft_law'                   : 'NO',
	  'special_status'             : 'N/A',
	  'city_owned'                 : 'NO',
	  'special_district'           : 'UNKNOWN',
	  'complaints_total'           : '33',
	  'complaints_open'            : '0',
	  'violations_dob_total'       : '50',
	  'violations_dob_open'        : '2',
	  'violations_ecb_total'       : '14',
	  'violations_ecb_open'        : '4'
	}).then(function(building) {
	  console.log(building.get({
	    plain: true
	  }))
	}).then(function() {
		res.send('Success - it was added');
	});	
})

server.get('/create/complaint', function(req, res) {
	Complaint.create({
	  'bin'               : '1018131',
	  'complaint_num'     : '1347014',
	  'regarding'         : 'ELECTRICAL AND PLUMBING WORK INPROGRESS WITHOUT PERMITS INAPTS 11A-8G-4E-7G-2K-4L-9L.',
	  'category'          : '66      PLUMBING WORK - ILLEGAL/NO PERMIT(ALSO SPRINKLER/STANDPIPE)',
	  'assigned_to'       : 'PLUMBING DIVISION',
	  'priority'          : 'B',
	  'received'          : '04/17/2013',
	  'block'             : '882',
	  'lot'               : '21',
	  'community_board'   : '105',
	  'owner'             : '88 LEX OWNER 8, LLC',
	  'last_inspection'   : '06/06/2013 - - BY BADGE # 2339',
	  'disposition'       : '06/06/2013 - I2 - NO VIOLATION WARRANTED FOR COMPLAINT AT TIME OF INSPECTION',
	  'dob_violation_num' : '',
	  'ecb_violation_num' : '',
	  'comments'          : 'NO ACTION NECESSARY',
	}).then(function(building) {
	  console.log(building.get({
	    plain: true
	  }))
	}).then(function() {
		res.send('Success - it was added');
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

function getBuilding_profile(bin, callback) {
	Building
	.findOne({where:{bin:bin}})
	.complete(function (err, data) {
		var output = false;
		if (data != null) {
			var element = data.dataValues;
			output = {
				bin                        : element.bin,
				health_area                : element.health_area,
				census_tract               : element.census_tract,
				community_board            : element.community_board,
				buildings_on_lot           : element.buildings_on_lot,
				tax_block                  : element.tax_block,
				condo                      : element.condo,
				vacant                     : element.vacant,
				cross_streets              : element.cross_streets,
				dob_special_place_name     : element.dob_special_place_name,
				landmark_status            : element.landmark_status,
				local_law                  : element.local_law,
				environmental_restrictions : element.environmental_restrictions,
				legal_adult_use            : element.legal_adult_use,
				loft_law                   : element.loft_law,
				special_status             : element.special_status,
				city_owned                 : element.city_owned,
				special_district           : element.special_district,
				complaints                 : {
					total                    : element.complaints_total,
					open                     : element.complaints_open,
				},
				violations                 : {
					dob_total                : element.violations_dob_total,
					dob_open                 : element.violations_dob_open,
					ecb_total                : element.violations_ecb_total,
					ecb_open                 : element.violations_ecb_open,
				},
			}
		}
		return callback(output);
	});
}

function getBuilding_complaints(bin, callback) {
	Complaint
	.findAll({where:{bin:bin}})
	.complete(function (err, data) {
		var output_list = [];
		if (data != null) {
			for (var i = 0; i < data.length; i ++) {
				var element = data[i].dataValues;
				output = {
					bin               : element.bin,
					complaint_num     : element.complaint_num,
					regarding         : element.regarding,
					category          : element.category,
					assigned_to       : element.assigned_to,
					priority          : element.priority,
					received          : element.received,
					block             : element.block,
					lot               : element.lot,
					community_board   : element.community_board,
					owner             : element.owner,
					last_inspection   : element.last_inspection,
					disposition       : element.disposition,
					dob_violation_num : element.dob_violation_num,
					ecb_violation_num : element.ecb_violation_num,
					comments          : element.comments,
				}
				output_list.push(output);
			}
		}
		return callback(output_list);
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