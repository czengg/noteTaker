var path = require('path');
var express = require('express');
var http = require('http');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var util = require('util');
var fs = require('fs');
var querystring = require('querystring');
var url = require('url');
var pdf = require('pdfcrowd');
var app = express();
var port = process.env.PORT || 8080;
var DomJS = require("dom-js").DomJS;

var css = '@import url("http://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic");.section{display:block;margin:5px}.section{min-height:20px;padding:19px;margin-bottom:20px;background-color:#f5f5f5;border:1px solid #e3e3e3;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 1px 1px rgba(0,0,0,0.05);box-shadow:inset 0 1px 1px rgba(0,0,0,0.05)}html{font-size:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}sub,sup{position:relative;font-size:75%;line-height:0;vertical-align:baseline}sup{top:-0.5em}sub{bottom:-0.25em}img{max-width:100%;width:auto\9;height:auto;vertical-align:middle;border:0;-ms-interpolation-mode:bicubic}button{margin:0;font-size:100%;vertical-align:middle}button,input{*overflow:visible;line-height:normal}body{margin:0;font-family:"Lora",Georgia,"Times New Roman",Times,serif;font-size:18px;line-height:26px;color:#333;background-color:#f6f6f6}a{color:#9c0001;text-decoration:none}.section{margin-right:auto;margin-left:auto;*zoom:1}.section:before,.section:after{display:table;content:"";line-height:0}.section:after{clear:both}p{margin:0 0 13px}strong{font-weight:bold}em{font-style:italic}h1,h2,h3,h4,h5,h6{margin:13px 0;font-family:inherit;font-weight:bold;line-height:26px;color:inherit;text-rendering:optimizelegibility}h1,h2,h3{line-height:52px}h1{font-size:49.5px}h2{font-size:40.5px}h3{font-size:31.5px}h4{font-size:22.5px}h5{font-size:18px}h6{font-size:15.299999999999999px}.page-header{padding-bottom:12px;margin:26px 0 39px;border-bottom:1px solid #eee}ul,ol{padding:0;margin:0 0 13px 25px}ul ul,ul ol,ol ol,ol ul{margin-bottom:0}li{line-height:26px}dl{margin-bottom:26px}dt,dd{line-height:26px}dt{font-weight:bold}dd{margin-left:13px}code{padding:0 3px 2px;font-family:Monaco,Menlo,Consolas,"Courier New",monospace;font-size:16px;color:#333;margin-top:10px;margin-bottom:10px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px}code{padding:2px 4px;color:#d14;background-color:#f7f7f9;border:1px solid #e1e1e8}code .buggy{padding:2px 4px;border:3px solid red}legend{display:block;width:100%;padding:0;margin-bottom:26px;font-size:27px;line-height:52px;color:#333;border:0;border-bottom:1px solid #e5e5e5}button{font-size:18px;font-weight:normal;line-height:26px}button{font-family:"Lora",Georgia,"Times New Roman",Times,serif}table{max-width:100%;background-color:transparent;border-collapse:collapse;border-spacing:0}.table{width:100%;margin-bottom:26px}.table th,.table td{padding:8px;line-height:26px;text-align:left;vertical-align:top;border-top:1px solid #ddd}.table th{font-weight:bold}.table thead th{vertical-align:bottom}.table thead:first-child tr:first-child th,.table thead:first-child tr:first-child td{border-top:0}.table tbody+tbody{border-top:2px solid #ddd}.buggy{border-style:solid;border-width:3px;border-color:red}.btn{border-color:#c5c5c5;border-color:rgba(0,0,0,0.15) rgba(0,0,0,0.15) rgba(0,0,0,0.25)}.btn-primary{color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.25);background-color:#ab0001;background-image:-moz-linear-gradient(top,#b60001,#9c0001);background-image:-webkit-gradient(linear,0 0,0 100%,from(#b60001),to(#9c0001));background-image:-webkit-linear-gradient(top,#b60001,#9c0001);background-image:-o-linear-gradient(top,#b60001,#9c0001);background-image:linear-gradient(to bottom,#b60001,#9c0001);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffb60001",endColorstr="#ff9c0001",GradientType=0);border-color:#9c0001 #9c0001 #500001;border-color:rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);*background-color:#9c0001;filter:progid:DXImageTransform.Microsoft.gradient(enabled = false)}.btn-warning{color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.25);background-color:#f99a14;background-image:-moz-linear-gradient(top,#fa9f1e,#f89406);background-image:-webkit-gradient(linear,0 0,0 100%,from(#fa9f1e),to(#f89406));background-image:-webkit-linear-gradient(top,#fa9f1e,#f89406);background-image:-o-linear-gradient(top,#fa9f1e,#f89406);background-image:linear-gradient(to bottom,#fa9f1e,#f89406);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#fffa9f1e",endColorstr="#fff89406",GradientType=0);border-color:#f89406 #f89406 #ad6704;border-color:rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);*background-color:#f89406;filter:progid:DXImageTransform.Microsoft.gradient(enabled = false)}.btn-autolab{color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.25);background-color:#ab0001;background-image:-moz-linear-gradient(top,#b60001,#9c0001);background-image:-webkit-gradient(linear,0 0,0 100%,from(#b60001),to(#9c0001));background-image:-webkit-linear-gradient(top,#b60001,#9c0001);background-image:-o-linear-gradient(top,#b60001,#9c0001);background-image:linear-gradient(to bottom,#b60001,#9c0001);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffb60001",endColorstr="#ff9c0001",GradientType=0);border-color:#9c0001 #9c0001 #500001;border-color:rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);*background-color:#9c0001;filter:progid:DXImageTransform.Microsoft.gradient(enabled = false)}.btn-success{color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.25);background-color:#1ea84d;background-image:-moz-linear-gradient(top,#20b151,#1c9b47);background-image:-webkit-gradient(linear,0 0,0 100%,from(#20b151),to(#1c9b47));background-image:-webkit-linear-gradient(top,#20b151,#1c9b47);background-image:-o-linear-gradient(top,#20b151,#1c9b47);background-image:linear-gradient(to bottom,#20b151,#1c9b47);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ff20b151",endColorstr="#ff1c9b47",GradientType=0);border-color:#1c9b47 #1c9b47 #105a29;border-color:rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);*background-color:#1c9b47;filter:progid:DXImageTransform.Microsoft.gradient(enabled = false)}.btn-piazza{color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.25);background-color:#006cbb;background-image:-moz-linear-gradient(top,#0072c6,#0063ac);background-image:-webkit-gradient(linear,0 0,0 100%,from(#0072c6),to(#0063ac));background-image:-webkit-linear-gradient(top,#0072c6,#0063ac);background-image:-o-linear-gradient(top,#0072c6,#0063ac);background-image:linear-gradient(to bottom,#0072c6,#0063ac);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ff0072c6",endColorstr="#ff0063ac",GradientType=0);border-color:#0063ac #0063ac #003760;border-color:rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);*background-color:#0063ac;filter:progid:DXImageTransform.Microsoft.gradient(enabled = false)}.btn-download{color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,0.25);background-color:#3b3b3b;background-image:-moz-linear-gradient(top,#404040,#333);background-image:-webkit-gradient(linear,0 0,0 100%,from(#404040),to(#333));background-image:-webkit-linear-gradient(top,#404040,#333);background-image:-o-linear-gradient(top,#404040,#333);background-image:linear-gradient(to bottom,#404040,#333);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ff404040",endColorstr="#ff333333",GradientType=0);border-color:#333 #333 #0d0d0d;border-color:rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);*background-color:#333;filter:progid:DXImageTransform.Microsoft.gradient(enabled = false)}.toc{padding:60px;margin-bottom:30px;font-size:18px;font-weight:200;line-height:39px;color:inherit;background-color:#eee;-webkit-border-radius:6px;-moz-border-radius:6px;border-radius:6px}.toc h1{margin-bottom:0;font-size:60px;line-height:1;color:inherit;letter-spacing:-1px}.toc li{line-height:39px};.pln{color:#000}@media screen{.str{color:#080}.kwd{color:#008}.com{color:#800}.typ{color:#606}.lit{color:#066}.pun,.opn,.clo{color:#660}.tag{color:#008}.atn{color:#606}.atv{color:#080}.dec,.var{color:#606}.fun{color:red}}@media print,projection{.str{color:#060}.kwd{color:#006;font-weight:bold}.com{color:#600;font-style:italic}.typ{color:#404;font-weight:bold}.lit{color:#044}.pun,.opn,.clo{color:#440}.tag{color:#006;font-weight:bold}.atn{color:#404}.atv{color:#060}}pre.prettyprint{padding:2px;border:1px solid #888}ol.linenums{margin-top:0;margin-bottom:0}li.L0,li.L1,li.L2,li.L3,li.L5,li.L6,li.L7,li.L8{list-style-type:none}li.L1,li.L3,li.L5,li.L7,li.L9{background:#eee}';


function init(){
    configureExpress(app);
}

init();

var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/data'; 

var db = mongoose.createConnection(mongoUri)
db.on("error", function(err) {
    	console.log("MongoDB connection error:", err);
});

db.once("open", function() {
	console.log("MongoDB connected");
});

var client = new pdf.Pdfcrowd("mrmeku","d6bbd7a788b1763cf98f46faaaf7a2b3");

function configureExpress(app){
    app.configure(function(){

    	app.use(express.logger());
    	app.use(express.cookieParser());
    	app.use(express.bodyParser());
    	app.use(express.methodOverride());
    	app.use(express.session({secret:"keyboard cat"}));
    	app.use(express.static(path.join(__dirname, 'public')));

        app.use(app.router);
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });
}

// CORS Mtitledleware that sends HTTP headers with every request
// Allows connections from http://localhost:8081
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://rocky-earth-8065.herokuapp.com/');
    res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');

    next();
}

// New mongoose schema to create our Note model
var Schema = mongoose.Schema;
var Collection = mongoose.Collection;

var Note = new Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	user: { type: String, required: true}
});
var NoteModel = db.model('Note', Note);


// Get all files associated with a user
app.get('/getFiles', function (req, res) {
	var query = url.parse(req.url);
	var args = querystring.parse(query.query);
	return NoteModel.find( {user: args.user}, {title: 1}, function(err, notes) {
		res.send(notes);
	});
});

// Get a single note's contents
app.post('/getContent', function (req, res) {
	NoteModel.findOne( {_id: req.body.id}, {content: 1}, function(err, content) {
		res.send(content);
	});
});

// Add a note
app.get('/add', function (req,res) {
	var query = url.parse(req.url);
	var args = querystring.parse(query.query);
	var note = new NoteModel({
		title: args.title,
		content: args.content,
		user: args.user
	});

	note.save(function(err) {
		if(err) {
			res.send(err);
		}
		else
		{
			res.send(note);
		}
	})

});

//view html preview of lecture note
app.post('/preview', function (req,res) {

	foundError = false;

	xmlToHtml(req.body.content, res);

});

// Delete a note
app.get('/delete', function(req, res) {
	var query = url.parse(req.url);
	var args = querystring.parse(query.query);

	NoteModel.findOne( { _id: args.id} , 
		function(err, note)
		{
			note.remove(function(err) {
				if(err) {
					res.send(err);
				}
				else
				{
					res.send(note);
				}
			})
		}
		
	);
});

// Edit a note's title
app.post('/editContent', function(req, res) {
	NoteModel.findOne( { _id: req.body.id} , 
		function(err, note)
		{
			note.content = req.body.content;
			note.save(function(err) {
				if(err) {
					res.send(err);
				}
				else
				{
					res.send(note);
				}
			})
		}
		
	);
});

app.post('/createPDF', function(req, res) {
	client.convertHtml(req.body.html, pdf.saveToFile(req.body.id+".pdf"),convertToBinary(req.body.id+".pdf",res));
});

function convertToBinary(path,response) {
	setTimeout(function() {
		fs.readFile(path, function(err, data) {
			if(err) {
				throw err;
			}
			var binaryString = data.toString('binary');
			response.send(binaryString);
		})
	},3000);		
}

function xmlToHtml(xmlString, res) {
	var parser = new DomJS();
	parser.strict = false;
	var doc = parser.parse(xmlString, function(err,doc) {
		changeNames(doc);
		if (foundError) 
		{
			return res.send();
		}
		var body = doc.toXml();
		var html = '<!DOCTYPE html><html><head><meta content="initial-scale=1, minimum-scale=1, width=device-width" name="viewport"><style type="text/css">' + css + '</style><script type="text/javascript" src="prettify.js"></script></head>' + body + "</html>";
		return res.send(html);
	});
}

tagMapping = {};

function populateTagMapping() {
	tagMapping['TOC'] = convertTOC;
	tagMapping['REVIEW'] = convertREVIEW;
	tagMapping['PIAZZA'] = convertPIAZZA;
	tagMapping['AUTOLAB'] = convertAUTOLAB;
	tagMapping['DOWNLOAD'] = convertDOWNLOAD;
	tagMapping['A'] = empty;
	tagMapping['IMG'] = empty;
	tagMapping['BR'] = empty;
	tagMapping['PBR'] = convertPBR;
	tagMapping['SECTION'] = convertSECTION;
	tagMapping['OL'] = empty;
	tagMapping['UL'] = empty;
	tagMapping['DL'] = empty;
	tagMapping['LI'] = empty;
	tagMapping['CODE'] = convertCODE;
	tagMapping['H1'] = empty;
	tagMapping['H2'] = empty;
	tagMapping['H3'] = empty;
	tagMapping['H4'] = empty;
	tagMapping['H5'] = empty;
	tagMapping['P'] = empty;
	tagMapping['B'] = empty;
	tagMapping['I'] = empty;
	tagMapping['SUP'] = empty;
	tagMapping['SUB'] = empty;
	tagMapping['MARK'] = convertMARK;
	tagMapping['NOTE'] = convertNOTE;
}

populateTagMapping();

function changeNames(obj) {

	if(obj.name === undefined || foundError) {
		return;
	}
	if(!(obj.name in tagMapping)) {
		foundError = true;
		return;
	}

	for(var child in obj.children) {
		changeNames(obj.children[child]);
	}

	tagMapping[obj.name](obj);
}

function convertTOC(obj) {
	obj.name = 'DIV';
	obj.attributes.class = 'toc';
}

function convertREVIEW(obj) {
	obj.name = 'DIV';
	obj.attributes.class = 'review';
}

function convertPIAZZA(obj) {
	obj.name = 'BUTTON';
	obj.attributes.class = 'btn-piazza';
}

function convertAUTOLAB(obj) {
	obj.name = 'BUTTON';
	obj.attributes.class = 'btn-autolab';
}

function convertDOWNLOAD(obj) {
	obj.name = 'BUTTON';
	obj.attributes.class = 'btn-download';
}

function convertPBR(obj) {
	obj.name = 'DIV';
	obj.attributes.style = 'page-break-before: always;';
}

function convertCODE(obj) {
	obj.name = 'PRE';
	obj.attributes.class = 'prettyprint';
}

function convertMARK(obj) {
	obj.name = 'SPAN';
	obj.attributes.style = 'color:'+obj.attributes.color+';';
}

function convertNOTE(obj) {
	obj.name = 'BODY';
	obj.attributes.onload = 'prettyPrint()';
}

function convertSECTION(obj) {
	obj.name = 'DIV';
	obj.attributes.class = 'section';
}

function empty(obj) {
	return;
}

// Launch server
app.listen(port);

