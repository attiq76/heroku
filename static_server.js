/*const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
CryptoJS   = require("crypto-js");
var express  = require('express');
var bodyParser = require('body-parser');
var nStatic = require('node-static');


const { parse } = require('querystring');
// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = process.env.PORT || 5000;


 
var views = path.join(__dirname, 'public/views');

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

var shared='4881D00745436C40A56ED4DA98FD57A6DD006BA187C2BDFA3FAE7A48D1FB3021';
http.createServer(function (req, res) {
  console.log('${req.method} ${req.url}');

  // parse URL
  const parsedUrl = url.parse(req.url);
  var signed_req=null;
 
  if(req.method=='POST')
  {
	  console.log(' *** POST ****');
	  let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
		console.log('**** BODY= '+body );
		var str=body.substring(body.indexOf('=')+1,body.length);
		str=decodeURIComponent(str);
		console.log(' ******JSON BODY === '+str);
		
		signed_req=str
		//signed_request=JSON.parse(body).signed_request;
        //res.end('ok');
		// extract URL path
		  // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
		  // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
		  // by limiting the path to current directory only
		  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
		  let pathname = path.join(__dirname+'/public/views', sanitizePath);
		  //pathname=path.join('/public/views' , pathname); // default to public/views
		  console.log(' PATH= '+pathname);

		  fs.exists(pathname, function (exist) {
			if(!exist) {
			  // if the file is not found, return 404
			  res.statusCode = 404;
			  res.end('File ${pathname} not found!');
			  return;
			}
			
			
		  if(typeof signed_req !== 'undefined' && signed_req!=null)
		  {
			  console.log('signed req=' + signed_req);
			  // split request at '.'
			  var hashedContext = signed_req.split('.')[0];
			  var context = signed_req.split('.')[1];
			  // Sign hash with secret
			  var hash = CryptoJS.HmacSHA256(context, shared); 
			  // encrypt signed hash to base64
			  var b64Hash = CryptoJS.enc.Base64.stringify(hash);
			  if (hashedContext === b64Hash) {
				// if is a directory, then look for index.html
				if (fs.statSync(pathname).isDirectory()) {
				  pathname += '/aptos_index.html';
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
			  } else {
				res.send("authentication failed");
			  };
		  }

			
		  });
		  

    });
  }
  else if(req.method=='GET')
  {
	   // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
		  // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
		  // by limiting the path to current directory only
		 
		  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
		  let pathname;
		   if(sanitizePath.endsWith('.html'))
		   {
				pathname = path.join(__dirname+'/public/views', sanitizePath);
		   }
		  //pathname=path.join('/public/views' , pathname); // default to public/views
		  console.log(' PATH= '+pathname);

		  fs.exists(pathname, function (exist) {
			if(!exist) {
			  // if the file is not found, return 404
			  res.statusCode = 404;
			  res.end('File ${pathname} not found!  Path=' + pathname);
			  return;
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
			
		  if(typeof signed_req !== 'undefined' && signed_req!=null)
		  {
			  console.log('signed req=' + signed_req);
			  // split request at '.'
			  var hashedContext = signed_req.split('.')[0];
			  var context = signed_req.split('.')[1];
			  // Sign hash with secret
			  var hash = CryptoJS.HmacSHA256(context, shared); 
			  // encrypt signed hash to base64
			  var b64Hash = CryptoJS.enc.Base64.stringify(hash);
			  if (hashedContext === b64Hash) {
				// if is a directory, then look for index.html
				if (fs.statSync(pathname).isDirectory()) {
				  pathname += '/aptos_index.html';
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
			  } else {
				res.send("authentication failed");
			  };
		  }
		  else{
			  res.end("This page can only be accessed via salesforce");
		  }

			
		  });
  }
  
  

}).listen(parseInt(port));

console.log('Server listening on port ${port}');*/
/*
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
var nStatic = require('node-static');
const port = process.env.PORT || 5000;

http.createServer(function (req, res) {
  console.log('${req.method} ${req.url}');

  // parse URL
  const parsedUrl = url.parse(req.url);
  // extract URL path
 
  // based on the URL path, extract the file extention. e.g. .js, .doc, ...
  const ext = path.parse(parsedUrl.pathname).ext;
  // maps file extention to MIME typere
  const map = {
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
    '.doc': 'application/msword'
  };
 const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
		  let pathname = path.join(__dirname+'/public/views', sanitizePath);
		  //pathname=path.join('/public/views' , pathname); // default to public/views
		  console.log(' PATH= '+pathname);

  fs.exists(pathname, function (exist) {
	console.log(' PATH=' + pathname);
    if(!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end('File ${pathname} not found!');
      return;
    }

    // if is a directory search for index file matching the extention
   // if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;
	
    // read file from file system
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end('Error getting the file: ${err}.');
      } else {
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', map[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });


}).listen(parseInt(port));

console.log('Server listening on port ${port}');*/
const port = process.env.PORT || 5000;

var http = require('http');

var nStatic = require('node-static');

var fileServer = new nStatic.Server('./public');

http.createServer(function (req, res) {
    
    fileServer.serve(req, res);

}).listen(port);


