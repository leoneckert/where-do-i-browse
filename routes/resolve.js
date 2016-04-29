var express = require('express');
var router = express.Router();

const dns = require('dns');

var jGeoIP = require('jgeoip');

var geoip = new jGeoIP('public/db/GeoLite2-City.mmdb');



// router.post('/', function(req, res) { 
// 	for (key in req.body){
// 		console.log(key);
// 	}
// });

/* GET users listing. */
router.get('/ip', function(req, res, next) { 

	var host = req.query.host;
  	console.log("got a host: " + host);

  	dns.lookup(host,function(err, address, family) {
   		if (err) throw err;
    	
   		var a = geoip.getRecord(address);
		// console.log(a.location);
		console.log(a.location.latitude);
		console.log(a.location.longitude);
		var b = String(a.location.latitude) + "/" + String(a.location.longitude);

    	res.writeHead(200, {"Content-Type": "text/plain"});
    	res.end(b);
    });

});


router.get('/ip-list', function(req, res, next) { 
 	getResString(req.query, function(rs){
 		console.log('sending: ' + rs);
 		res.writeHead(200, {"Content-Type": "text/plain"});
  		res.end(rs); 
 	});
});

function getResString(rq, callback){
	var respond_string = "";
	first = true;
	size = 0;
	for(e in rq){
		size += 1;
	}
	for(e in rq){
		var host = rq[e];
	  	dns.lookup(host,function(err, address, family) {
	   		// if (err) throw err;
	  		try {
		  		var a = geoip.getRecord(address);
				if(first && a != null){
					first = false;
					respond_string = respond_string + String(a.location.latitude) + "/" + String(a.location.longitude);
				}else if(a != null){
					respond_string = respond_string + "//" + String(a.location.latitude) + "/" + String(a.location.longitude);
				}else{
					console.log('no locations found for this:');
					// console.log(host);
		    		console.log(address);
				}
			}
			catch(err){
				console.log(err);
			}

			size -= 1;
			if(size == 0){
				// console.log(respond_string);
				callback(respond_string);
			}	
		});	
  	}
}


module.exports = router;
