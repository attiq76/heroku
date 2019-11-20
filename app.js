  var express  = require('express'),
  bodyParser = require('body-parser'),
  path       = require('path'),
  crypto=require('crypto');
  CryptoJS   = require("crypto-js");
  var request = require('request');
  var http = require('http');
  var jwt = require('jsonwebtoken');
  var fs = require('fs');
  
  var signedRequest='TEST';
  var jwt_token=null;
  
  //AWS credentials
  var username = 'user';
  var password = 'password';
	
 
app        = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/views')));

app.set('views', path.join(__dirname, '/public/views/eom/About-Digital-Commerce/'));

app.use(bodyParser.json()); // create application/json parser
app.use(bodyParser.urlencoded({ entended: true })); //create application/x-www-urlencoded parser
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
 
var   consumerSecret = process.env.SF_CANVASAPP_CLIENT_SECRET;
var eomPublicKey=process.env.EOM_PUBLIC_KEY;
var awsUrl=process.env.AWS_URL;

   
app.get('/', (req, res) => {
	console.log('11111111111111111111111111111111');
	console.log('HTTP * SIGNED REQ=' + req.body.signed_request);
  // Desk secret key	
	var shared = consumerSecret;
  // Grab signed request
	var signed_req;
	if(signedRequest!='TEST')  
		signed_req= signedRequest;
	else
		signed_req=req.body.signed_request;
	
	console.log('SR= ' + signed_req);
	
	var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
	// set aws authentication header
	res.setHeader('authorization', auth);
	
	if(jwt_token==null)
	{
	   jwt_token=req.body.eom_token;
	   console.log("GET: JWT TOKEN= " + jwt_token);
	}

  if(typeof signed_req !== 'undefined' && signed_req!='null' && signed_req!=null)
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
		 
		//res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/views')});
		signed_req=null
		res.redirect(awsUrl);
		
	  } else {
		  signed_req=null
		res.redirect(awsUrl+'error.html');
	  };
  }
  else if(jwt_token!=null && jwt_token!=='undefined') //EOM authentication
  {
	 var decodedToken=jwt.decode(jwt_token, {complete: true});

		if(decodedToken !=null &&  decodedToken!=='undefined')
		{
			var eomPath= decodedToken.payload.path;
			var host=decodedToken.payload.aud;
			jwt_token=null;
			var pageName='Home.html';
			if(!eomPath.includes('.html'))
			{
				eomPath=eomPath+pageName;
			}
			var fullUrl= req.protocol + '://' + req.get('host');
			fullUrl=fullUrl.substring(0,fullUrl.length);
			res.redirect( fullUrl  + eomPath);
			res.end();
		}
		else if(decodedToken==null || decodedToken =='undefined')
		{
			jwt_token=null;
			res.redirect(awsUrl+'error.html');
			//res.sendFile("error.html", {"root": path.join(__dirname, 'public')});
		}
		
  }
  else 
  {
	    jwt_token=null;
		console.log('signed req IS NULL=' + signed_req);
		res.redirect(awsUrl+'error.html');
		
	};  
});

app.get('*', (req, res) => {
	console.log('222222222222222222222222222222');
    // Desk secret key	
	var shared = consumerSecret;
   // Grab signed request
	var signed_req;
    signed_req=req.body.signed_request;
	
	var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
	// set aws authentication header
	res.setHeader('authorization', auth);
	
	if(jwt_token==null && typeof jwt_token !== 'undefined')
	{
	   jwt_token=req.body.eom_token;
	   console.log("GET: JWT TOKEN= " + jwt_token);
	}

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
		 
		//res.sendFile("aptos_index.html", {"root": path.join(__dirname, 'public/views')});
		res.redirect(awsUrl);
		
	  } else {
		res.sendFile("error.html", {"root": path.join(__dirname, 'public')});
		
	  };
  }
  else if(jwt_token!=null && jwt_token!=='undefined') //EOM authentication
  {
	  var decodedToken=jwt.decode(jwt_token, {complete: true});

		if(decodedToken !=null &&  decodedToken!=='undefined')
		{
			var eomPath= decodedToken.payload.path;
			var host=decodedToken.payload.aud;
			jwt_token=null;
			var pageName='/Home.html';
			if(!eomPath.includes('.html'))
			{
				eomPath=eomPath+pageName;
			}
			var fullUrl= awsUrl;//req.protocol + '://' + req.get('host');
			fullUrl=fullUrl.substring(0,fullUrl.length-1);
			
			res.redirect( fullUrl  + eomPath);
			res.end();
		}
		else if(decodedToken==null || decodedToken =='undefined')
		{
			jwt_token=null;
			res.send("jwt get: authentication failed");
			
			res.sendFile("error.html", {"root": path.join(__dirname, 'public')});
		}
		
	
	  
  }
  else 
  {
	    jwt_token=null;

		res.sendFile("error.html", {"root": path.join(__dirname, 'public/views')});
		
	};  
});



app.post('*', function (req, res) {
	console.log('3333333333333333333333333' + __dirname);
	
	var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
	// set aws authentication header
	res.setHeader('authorization', auth);
	
	// Desk secret key	
	var shared = consumerSecret;
	// Grab signed request
	var signed_req = req.body.signed_request;
	signedRequest=signed_req;
  
  if(jwt_token==null || typeof jwt_token ==='undefined')
	{
	   jwt_token=req.body.eom_token;
	   console.log("POST: JWT TOKEN= " + jwt_token);
	}
	
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
		
		res.redirect(awsUrl);
		
	  } else {
		
		res.redirect(awsUrl+'error.html');
	  };
  }
  else if(jwt_token!=null && jwt_token!=='undefined') //EOM authentication
  {
	   
		var decodedToken=null;
		try{	     
 	 //decodedToken=jwt.decode(jwt_token,{complete:true});
		 var hostName=req.get('host');
		 var cert;
		 console.log('HOSTNAME = '+hostName);
		 if(hostName!='aptos-docs-production.herokuapp.com')
			 cert=fs.readFileSync('./aptosPK_DEV.pem', 'utf8');
		 else if (hostName=='aptos-docs-production.herokuapp.com')
			 cert=fs.readFileSync('./aptosPK_Prod.pem', 'utf8');
		 
		

		 jwt.verify(jwt_token,  cert , { algorithms: ['RS256'],ignoreNotBefore: true}, function(err, decoded) {
		 // verify JWT token
		
		  if(err)
		  {
		   console.log('ERROR in Verifying = '+err);
		   jwt_token=null;
		   decodedToken=null;
		  
		   //res.redirect(awsUrl+'error.html');
		   authenticateWithAWS();
		  }
		  else{
			  
				decodedToken=decoded;
				
				if(decodedToken !=null &&  decodedToken!=='undefined')
				{
					var eomPath= decodedToken.path;
					var host=decodedToken.aud;
					jwt_token=null;
					var pageName='/Home.html';
					if(!eomPath.includes('.html'))
					{
						eomPath=eomPath+pageName;
					}
					
					var fullUrl= awsUrl;//req.protocol + '://' + req.get('host');
					fullUrl=fullUrl.substring(0,fullUrl.length-1);
					
					res.setHeader('authorization', auth);
					console.log(' *** URL=' + fullUrl + eomPath);
					
					//res.redirect( fullUrl + '?path=' + eomPath);
					authenticateWithAWS();
					
					res.end();
					
				}
				else if(decodedToken==null || decodedToken =='undefined')
				{
					jwt_token=null;
					//res.redirect(awsUrl+'error.html');
					authenticateWithAWS();
				}
				else{
					jwt_token=null;
				}
		  }
		});
		
		}
		catch(e)
		{
			decodedToken=null;
			jwt_token=null;
			console.log(e);
			
			//res.redirect(awsUrl+'error.html');
			authenticateWithAWS();
			
		}

  }
  else {
		
		res.redirect(awsUrl+'error.html');
	  };  		
});


app.use(function(req, res, next) {
	    next();
});

function authenticateWithAWS()
{
	var options = {
   host: 'd3puwp3b6282u6.cloudfront.net',
   port: 443,
   path: '/' ,
   // authentication headers
   headers: {
      'authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
   }   
};

//this is the call
request = http.get(options, function(res){
   var body = "";
   res.on('data', function(data) {
      body += data;
	  
   });
   res.on('end', function() {
    //here we have the full response, html or json object
	res.send(body);
      console.log(body);
   })
   res.on('error', function(e) {
      console.log("Got error: " + e.message);
   });
	});

}
}


 
var port = process.env.PORT || 9000;
app.listen(port);
console.log('Listening on port ' + port);