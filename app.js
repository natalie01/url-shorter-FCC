var cors = require('cors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = module.exports = express();
var port = process.env.PORT || 3000;
var router = express.Router();
var mongodb = require('mongodb');
var shortUrl = require('./models/shortUrl');

var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
var mongoose = require('mongoose');

console.log(process.env.DB_PORT);
console.log(MONGODB_URI);
app.use(bodyParser.json());

app.use(cors());

app.use(express.static(path.join(__dirname, 'views')));

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + './views/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;

mongoose.connect(MONGODB_URI,{ useMongoClient: true});

app.get('/*',function(req,res,next){
	var url = req.params[0];
	//regex for url 
	console.log(url);

	if(/^\d+$/.test(url) === false){
	var regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
		if(regex.test(url)===true){
			var short = Math.floor(Math.random()*1000).toString();
	
			var data = new shortUrl(
			{
			originalUrl : url,
			shortUrl : short
			}
			);

			data.save(function(err){
			 if(err){
			 	return res.send('Error saving to database');
			 }

		 	return res.json({originalUrl : data.originalUrl , shortUrl : data.shortUrl});
			});
		}else{
		res.json({"short_url": 'failed'});
		}
	}else{
	shortUrl.findOne({'shortUrl':url},function(err,data){
		if(err) return res.send('Error reading database');

		var re = new RegExp("^(http|https)://", "i");
		var strToCheck =data.originalUrl;
		if(re.test(strToCheck)){
			res.redirect(301,data.originalUrl);
		}else{
			res.redirect(301,'http://'+data.originalUrl);
		}
	
	  });
	}

});

  app.listen(port,function(){
console.log('app is working on port '+port);
})
