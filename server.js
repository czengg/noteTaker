var path = require('path');
var express = require('express');
var http = require('http');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var util = require('util');
var app = express();
var port = process.env.PORT || 3000;
// var DOMParser = require('xmldom').DOMParser;

function init(){

    configureExpress(app);

    var User = initUser();

    // mongoose.connect('mongodb://localhost/noteTaker');
}

init();

var db = mongoose.createConnection("mongodb://localhost/data")
db.on("error", function(err) {
    	console.log("MongoDB connection error:", err);
});

db.once("open", function() {
	console.log("MongoDB connected");
});

// var mongoUri = process.env.MONGOLAB_URI || 
//   process.env.MONGOHQ_URL || 
//   'mongodb://localhost/data'; 

// mongo.Db.connect(mongoUri, function (err, db) {
//   db.collection('db', function(er, collection) {
//     collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
//     });
//   });
// });

function configureExpress(app){
    app.configure(function(){

    	app.use(express.logger());
    	app.use(express.cookieParser());
    	app.use(express.bodyParser());
    	app.use(express.methodOverride());
    	app.use(express.session({secret:"keyboard cat"}));
    	app.use(express.static(path.join(__dirname, 'public')));

        //app.use(allowCrossDomain);

        app.use(app.router);
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });
}

function initUser() {
	var User = new mongoose.Schema({
		files: Array,
		lastLoginTimestamp: Date,
	});

	User.add
}

// CORS Mtitledleware that sends HTTP headers with every request
// Allows connections from http://localhost:8081
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');

    next();
}

// Database
// mongodb://host/dbname
mongoose.connect('mongodb://localhost/data');

// New mongoose schema to create our Note model
var Schema = mongoose.Schema;
var Note = new Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	lastEdit: { type: Date, required: true }
});
var NoteModel = db.model('Note', Note);

// =========== ROUTES ==========

app.get('/userid', function (req, res) {
	console.log(req);
})

app.get('/', function (req, res) {
	return res.send();
})

// Get all notes
app.get('/notes', function (req, res) {
	return NoteModel.find(function(err, notes) {
		return res.send(notes);
	});
});

// Get a single note
app.get('/notes/:title', function (req, res) {
	var id = req.user.id;
	var title = req.params.title;
	var noteTitle = id + "." + title;
	// pattern matches /notes/*
	// given title is passed to req.params.title
	return NoteModel.findById(noteTitle, function(err, note) {
		res.send(note);
	});
});

// Add a note
app.post('/notes', function (req,res) {
	var note = new NoteModel({
		title: req.user.id + "." + req.body.title,
		content: req.body.content,
		lastEdit: req.body.lastEdit
	});

	var preview = xmlToHtml(note.content);

	// useful so client gets server generated stuff like IDs
	return res.send(preview);
});

//view html preview of lecture note
app.post('/preview', function (req,res) {
	var note = new NoteModel({
		desc: req.body.content
	});

	var preview = xmlToHtml(note.content);

	res.setHeader('Content-Type', 'text/html');

	// useful so client gets server generated stuff like IDs
	return res.send(preview);
});

// Delete a note
app.delete('/notes/:title', function(req, res) {
	var id = req.user.id;
	var title = req.params.title;
	var noteTitle = id + "." + title;
	return NoteModel.findById(noteTitle, function(err, note){
		return note.remove(function(err) {
			return res.send('');
		});
	});
});

// Editing a note
app.put('/notes/:title', function(req, res) {
	return NoteModel.findById(req.params.title, function(err, note) {
		note.title = req.user.id + "." + req.body.title;
		note.content = req.body.content;
		note.save();
		return res.send(note);
	});
});

function xmlToHtml(xmlString) {
	var doc = new DOMParser().parseFromString(xmlString);
	var html = doc.createElement("html");
	var head = doc.createElement("head");
	var body = doc.createElement("body");
	var css = doc.createElement("link");
	var codeHighlighterCss = doc.createElement("link");
	var codeHighlighterJs = doc.createElement("script");
	
	css.setAttribute("rel", "stylesheet");
	css.setAttribute("href", "lectureNotes.css");
	
	codeHighlighterCss.setAttribute("rel", "stylesheet");
	codeHighlighterCss.setAttribute("href", "http://yandex.st/highlightjs/7.3/styles/default.min.css");
	
	codeHighlighterJs.setAttribute("href", "http://yandex.st/highlightjs/7.3/highlight.min.js");
	
	
	var notes = doc.getElementsByTagName('note');
	var body = notes[0];
	body.tagName = "body";
	
	head.appendChild(css);
	head.appendChild(codeHighlighterCss);
	head.appendChild(codeHighlighterJs);
	html.appendChild(head);
	html.appendChild(body);
	
	var marks = doc.getElementsByTagName('mark');
	insertHighlights(marks);
	
	var pageBreaks = doc.getElementsByTagName('pbr');
	breakPages(pageBreaks);

	var titles = doc.getElementsByTagName('title');
	insertTitles(titles);
	
	var sections = doc.getElementsByTagName('section');
	insertSections(sections);
	
	var codeSnippets = doc.getElementsByTagName('code');
	insertCode(code);
	
	var downloads = doc.getElementsByTagName('download');
	insertDownloads(code);
	
	var reviews = doc.getElementsByTagName('review');
	insertDownloads(code);

	var autolabs = doc.getElementsByTagName('autolab');
	insertAutolabs(autolabs);
	
	var piazzas = doc.getElementsByTagName('piazza');
	insertPiazzas(piazzas);
}

function insertHighlights(marks) {
    for (var i=0; i<marks.length; i++) {
		var color = marks[i].getAttribute('color');
		marks[i].tagName = marks[i].parentNode.tagName;
		marks[i].setAttribute("style", "color:" + color + ";");
	}
}

function breakPages(pageBreaks)
{
	for (var i=0; i<pageBreaks.length; i++) {
		var color = pageBreaks[i].color;
		pageBreaks[i].tagName = "div";
		pageBreaks[i].setAttribute("style", "page-break-before: always;");
	}
}

function insertTitles(titles) {
	for (var i=0; i<titles.length; i++) {
		var title = titles[i].color;
		titles[i].tagName = "h1";
		titles[i].setAttribute("class", "title");
	}
}

function insertSections(sections) {
	for (var i=0; i<sections.length; i++) {
		sections[i].tagName = "div";
		titles[i].setAttribute("class", "section");
	}
}

function insertCode(codes) {
	for (var i=0; i<codes.length; i++) {
			var type = titles[i].getAttribute('type');
			titles[i].setAttribute("class", type);
		}
}

function insertDownloads(downloads) {
	for (var i=0; i<codes.length; i++) {
		var downloadButton = piazzas[i];
		downloadButton.tagName = "button";
		downloadButton.setAttribute("class", "download");
		downloadButton.nodeValue = "Download";
	}
}

function insertAutolabs(autolabs) {
	for (var i=0; i<codes.length; i++) {
		var autolabButton = piazzas[i];
		autolabButton.tagName = "button";
		autolabButton.setAttribute("class", "autolab");
		autolabButton.nodeValue = "Autolab";
	}
}

function insertPiazzas(piazzas) {
	for (var i=0; i<piazzas.length; i++) {
		var piazzaButton = piazzas[i];
		piazzaButton.tagName = "button";
		piazzaButton.setAttribute("class", "piazza");
		piazzaButton.nodeValue = "Piazza";
	}
}

// Launch server
app.listen(port);

app.get("http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.css", function(request, response) {
                                response.sendfile("http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.css");
});
app.get("http://fonts.googleapis.com/css?family=Oswald", function(request, response) {
                                response.sendfile("http://fonts.googleapis.com/css?family=Oswald");
});
app.get("http://fonts.googleapis.com/css?family=BenchNine|Julius+Sans+One|Archivo+Narrow|Carrois+Gothic+SC", function(request, response) {
                                response.sendfile("http://fonts.googleapis.com/css?family=BenchNine|Julius+Sans+One|Archivo+Narrow|Carrois+Gothic+SC");
});
