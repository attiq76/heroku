const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = process.argv[2] || 9000;

// maps file extention to MIME types
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt'
};

http.createServer(function (req, res) {
  console.log('${req.method} ${req.url}');

  // parse URL
  const parsedUrl = url.parse(req.url);

  // extract URL path
  // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
  // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
  // by limiting the path to current directory only
  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let pathname = path.join(__dirname, sanitizePath);

  fs.exists(pathname, function (exist) {
    if(!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end('File ${pathname} not found!');
      return;
    }

    // if is a directory, then look for index.html
    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/Home.html';
    }

    // read file from file system
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end('Error getting the file: ${err}.');
      } else {
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });


}).listen(parseInt(port));

console.log('Server listening on port ${port}');

/*var express  = require('express'),
  bodyParser = require('body-parser'),
  path       = require('path'),
  crypto=require('crypto');
  CryptoJS   = require("crypto-js");
  var request = require('request');
  var http = require('http');
  var jwt = require('jsonwebtoken');
 
  var jwt_token=null;

 
app        = express();
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public/views')));
app.use(bodyParser.json()); // create application/json parser
app.use(bodyParser.urlencoded({ entended: true })); //create application/x-www-urlencoded parser


 
var views = path.join(__dirname, 'public/views');
var   consumerSecret = process.env.SF_CANVASAPP_CLIENT_SECRET;
var idpValue=process.env.IDP;

app.get('/root/aptos_index.html', (req, res) => {
	if(req.body!=null && req.body!='undefined')
	{
		var signed_req = req.body.signed_request;
		console.log('signed req is  *****' + signed_req);
		 if(typeof signed_req === 'undefined' || signed_req=='null')
		{
			console.log('signed req is null *****');
			res.sendFile("error.html", {"root": path.join(__dirname, 'public')});
		}
	}
	else
	{
		res.sendFile("error.html", {"root": path.join(__dirname, 'public')});
	}
});

app.get('*', (req, res) => {
	console.log('HTTP * SIGNED REQ=' + req.body.signed_request);
 
  var shared = consumerSecret;
  var signed_req = req.body.signed_request;
  if(jwt_token==null)
	   jwt_token=req.body.id_token;
  console.log("GET: JWT TOKEN= " + jwt_token);
 
	
  if(typeof signed_req !== 'undefined' && signed_req!='null')
  {
	  //let data = "Aptos2019!";
	  //let encryption=crypto.createHash('md5').update(data).digest("hex");

	  console.log('signed req=' + signed_req);
	  // split request at '.'
	  var hashedContext = signed_req.split('.')[0];
	  var context = signed_req.split('.')[1];
	  // Sign hash with secret
	  var hash = CryptoJS.HmacSHA256(context, shared); 
	  // encrypt signed hash to base64
	  var b64Hash = CryptoJS.enc.Base64.stringify(hash);
	  if (hashedContext === b64Hash) {
		res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/root')});
		
		//res.redirect("https://d3i9249bxi8vv1.cloudfront.net/?key=" + encryption);
	  } else {
		res.send("authentication failed");
	  };
  }
  else if(typeof jwt_token!=='undefined')
  {
	  var decoded = jwt.decode(jwt_token, {complete: true});
      if(decoded.payload.idp==idpValue)
	  {
		  res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/root')});
	  }
	  else {
		res.send("jwt get: authentication failed");
	  }
	  
  }
	else {
		console.log('signed req IS NULL=' + signed_req);
		//res.send("authentication failed");
		res.sendFile("error.html", {"root": path.join(__dirname, 'public')});
	  };  
});


app.post('/', function (req, res) {
  console.log('HTTP POST REQ STRINGS=' + JSON.stringify(req.body));
  console.log('HTTP POST SIGNED REQ=' + req.body.signed_request);
   // Desk secret key	
  var shared = consumerSecret;
  // Grab signed request
  var signed_req = req.body.signed_request;
  console.log('POST JSON = ' + JSON.stringify(req.body));
  
 if(jwt_token==null)
	   jwt_token=req.body.id_token;
  console.log("POST: JWT TOKEN= " + jwt_token);
  // invalid token - synchronous
	var decoded = jwt.decode(jwt_token, {complete: true});

//console.log('IDP=  '+ decoded.payload.idp);
	
  if(typeof signed_req !== 'undefined')
  {
	 // var data = "Aptos2019!";
	 // var encryption=crypto.createHash('md5').update(data).digest("hex");

	  // split request at '.'
	  var hashedContext = signed_req.split('.')[0];
	  var context = signed_req.split('.')[1];
	  // Sign hash with secret
	  var hash = CryptoJS.HmacSHA256(context, shared); 
	  // encrypt signed hash to base64
	  var b64Hash = CryptoJS.enc.Base64.stringify(hash);
	  if (hashedContext === b64Hash) {
		
		res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/root')});
		//return res.redirect('https://d3i9249bxi8vv1.cloudfront.net/?key=' + encryption);
		
	  } else {
		res.send("authentication failed");
	  };
  }
  else if(typeof jwt_token!=='undefined')
  {
	  var decoded = jwt.decode(jwt_token, {complete: true});
	   console.log("stored value=="+idpValue);
	   console.log("incoming value=="+decoded.payload.idp);
      if(decoded.payload.idp==idpValue)
	  {
		  console.log('SEND FILE CALLED FROM POST');
		  res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/root')});
		  //res.render(__dirname +'/public/views/aptos_index.html');
	  }
	  else {
		res.send("jwt post: authentication failed");
	  }
	  
  }
 else {
		res.send("authentication failed");
	  };  		
});
 



var port = process.env.PORT || 9000;
app.listen(port);
console.log('Listening on port ' + port);*/