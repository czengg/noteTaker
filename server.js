var path = require('path');
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express();
// var DOMParser = require('xmldom').DOMParser;

function init(){
    configureExpress(app);

    var User = initPassportUser();

    // mongoose.connect('mongodb://localhost/noteTaker');

    require('./loginRoutes')(app);

    http.createServer(app).listen(3000, function() {
        console.log("Express server listening on port %d", 3000);
    });
}

init();

var db = mongoose.createConnection("mongodb://localhost/noteTaker")
db.on("error", function(err) {
    	console.log("MongoDB connection error:", err);
});

db.once("open", function() {
});



// Config
// app.configure(function () {
//   app.use(express.bodyParser());
//   app.use(express.methodOverride());
//   app.use(allowCrossDomain);		// Our CORS mtitledleware
//   app.use(app.router);
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });

function configureExpress(app){
    app.configure(function(){
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        //app.use(allowCrossDomain);

        app.use(express.cookieParser('c0ffee'));
        app.use(express.session());

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(app.router);
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });
}

function initPassportUser(){
    var User = require('./User');

    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    return User;
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
mongoose.connect('mongodb://localhost/noteTaker');

// New mongoose schema to create our Note model
var Schema = mongoose.Schema;
var Note = new Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	lastEdit: { type: Date, required: true }
});
var NoteModel = db.model('Note', Note);

// =========== ROUTES ==========

// Get all notes
app.get('/notes', function (req, res) {
	return NoteModel.find(function(err, notes) {
		return res.send(notes);
	});
});

// Get a single note
app.get('/notes/:title', function (req, res) {
	// pattern matches /notes/*
	// given title is passed to req.params.title
	return NoteModel.findById(req.params.title, function(err, note) {
		res.send(note);
	});
});

// Add a note
app.post('/notes', function (req,res) {
	var note = new NoteModel({
		title: req.body.title,
		content: req.body.content,
		lastEdit: req.body.lastEdit
	});

	var preview = xmlToHtml(note.content);

	// useful so client gets server generated stuff like IDs
	return res.send(preview);
});

// Add a note
app.post('/preview', function (req,res) {
	var note = new NoteModel({
		desc: req.body.content
	});

	// save to mongodb
	note.save();

	// useful so client gets server generated stuff like IDs
	return res.send(note);
});

// Delete a note
app.delete('/notes/:title', function(req, res) {
	return NoteModel.findById(req.params.title, function(err, note){
		return note.remove(function(err) {
			return res.send('');
		});
	});
});

// Editing a note
app.put('/notes/:title', function(req, res) {
	return NoteModel.findById(req.params.title, function(err, note) {
		note.title = req.body.title;
		note.content = req.body.content;
		note.save();
		return res.send(note);
	});
});

function xmlToHtml(xmlString) {
	var doc = new DOMParser().parseFromString(xmlString);
	


}

// Launch server
app.listen(8080);
app.get("/index.html", function(request, response) {
                                response.sendfile("index.html");
});
app.get("/jquery.min.js", function(request, response) {
                                response.sendfile("jquery.min.js");
});
app.get("/jquery.mobile-1.2.0.min.js", function(request, response) {
                                response.sendfile("jquery.mobile-1.2.0.min.js");
});
app.get("/PreliminaryDraft.js", function(request, response) {
                                response.sendfile("PreliminaryDraft.js");
});
app.get("http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.css", function(request, response) {
                                response.sendfile("http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.css");
});
app.get("/PrelimaryDraft.css", function(request, response) {
                                response.sendfile("/PrelimaryDraft.css");
});
app.get("/reset.css", function(request, response) {
                                response.sendfile("/reset.css");
});
app.get("http://fonts.googleapis.com/css?family=Oswald", function(request, response) {
                                response.sendfile("http://fonts.googleapis.com/css?family=Oswald");
});
app.get("http://fonts.googleapis.com/css?family=BenchNine|Julius+Sans+One|Archivo+Narrow|Carrois+Gothic+SC", function(request, response) {
                                response.sendfile("http://fonts.googleapis.com/css?family=BenchNine|Julius+Sans+One|Archivo+Narrow|Carrois+Gothic+SC");
});
