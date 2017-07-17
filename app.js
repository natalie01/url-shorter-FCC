var cors = require('cors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var shortUrl = require('./models/shortUrl')
var app = express();

var port =  process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(cors());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls');

app.get('/new/*',function(req,res,next){
	var url = req.params[0];
	//regex for url 
	console.log(url);

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

});


app.get('/:url',function(req,res,next){
    var shorterUrl = req.params.url;
	console.log(shorterUrl);

	shortUrl.findOne({'shortUrl':shorterUrl},function(err,data){
		if(err) return res.send('Error reading database');

		var re = new RegExp("^(http|https)://", "i");
		var strToCheck =data.originalUrl;
		if(re.test(strToCheck)){
			res.redirect(301,data.originalUrl);
		}else{
			res.redirect(301,'http://'+data.originalUrl);
		}
	
	});

})

app.listen(port,function(){
console.log('app is working on port '+port);
});