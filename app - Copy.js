var express  = require('express'),
  bodyParser = require('body-parser'),
  path       = require('path'),
  crypto=require('crypto');
  CryptoJS   = require("crypto-js");
  var request = require('request');
  var http = require('http');
 


 
app        = express(),
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/views')));
app.use(bodyParser.json()); // create application/json parser
app.use(bodyParser.urlencoded({ entended: true })); //create application/x-www-urlencoded parser
 
var views = path.join(__dirname, 'public/views');
var   consumerSecret = process.env.SF_CANVASAPP_CLIENT_SECRET;

app.get('*', (req, res) => {
	console.log('HTTP * SIGNED REQ=' + req.body.signed_request);
  // Desk secret key	
  var shared = consumerSecret;
  // Grab signed request
  var signed_req = req.body.signed_request;
  if(typeof signed_req !== 'undefined' && signed_req!='null')
  {
	  let data = "Aptos2019!";
	  let encryption=crypto.createHash('md5').update(data).digest("hex");

	  console.log('signed req=' + signed_req);
	  // split request at '.'
	  var hashedContext = signed_req.split('.')[0];
	  var context = signed_req.split('.')[1];
	  // Sign hash with secret
	  var hash = CryptoJS.HmacSHA256(context, shared); 
	  // encrypt signed hash to base64
	  var b64Hash = CryptoJS.enc.Base64.stringify(hash);
	  if (hashedContext === b64Hash) {
		res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/views')});
		
		//res.redirect("https://d3i9249bxi8vv1.cloudfront.net/?key=" + encryption);
	  } else {
		res.send("authentication failed");
	  };
  }
	else {
		console.log('signed req IS NULL=' + signed_req);
		//res.send("authentication failed");
		res.sendFile("error.html", {"root": path.join(__dirname, 'public')});
	  };  
});


app.post('/', function (req, res) {
  console.log('HTTP POST SIGNED REQ=');
   // Desk secret key	
  var shared = consumerSecret;
  // Grab signed request
  var signed_req = req.body.signed_request;
  console.log('JSON = ' + JSON.stringify(req.body));
  
  if(typeof signed_req !== 'undefined')
  {
	  var data = "Aptos2019!";
	  var encryption=crypto.createHash('md5').update(data).digest("hex");

	  // split request at '.'
	  var hashedContext = signed_req.split('.')[0];
	  var context = signed_req.split('.')[1];
	  // Sign hash with secret
	  var hash = CryptoJS.HmacSHA256(context, shared); 
	  // encrypt signed hash to base64
	  var b64Hash = CryptoJS.enc.Base64.stringify(hash);
	  if (hashedContext === b64Hash) {
		console.log(req);
		res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/views')});
		//return res.redirect('https://d3i9249bxi8vv1.cloudfront.net/?key=' + encryption);
		
	  } else {
		res.send("authentication failed");
	  };
  }
	else {
		res.send("authentication failed");
	  };  		
});
 
var port = process.env.PORT || 9000;
app.listen(port);
console.log('Listening on port ' + port);