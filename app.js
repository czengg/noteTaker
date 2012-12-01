var App = {};

App.Router = Backbone.Router.extend({
	routes : {
		'notes' : 'noteTakerLaunch'
	},

	noteTakerLaunch: function() {

		var populateList = new App.noteTakerFileListView({
			"container": $("#notesList"),
			"collection": App.notes
		});

		App.noteTaker.deferred.done(function() {
			populateList();
		})
	}
})

// Data models

App.noteTaker = Backbone.Model.extend({
	url: "http://localhost:8080/noteTaker",

	defaults: {
		title: new String(),
		content: new String(),
		lastEditTime: new Date()
	},

	populateEditor: function(attribs) {
		$("#note-text").val(attribs.content);
	}
});

// collection of noteTaker items
App.noteTakerCollection = Backbone.Collection.extend({
	model: App.noteTaker,
	localStorage: new Store("notes-backbone"),
	url: "http://localhost:8080/noteTaker",
	initialize: function() {
		// fetch from server when initialized
		this.fetch({
			success: this.fetchSuccess,
			error: this.fetchError
		})

		// Setup $.Deferred callbacks
		this.deferred = new $.Deferred();
	},
	deferred: Function.constructor.prototype,
	fetchSuccess: function(collection, response) {
		// resolve the $.Deferred callback
		collection.deferred.resolve();
	},
	fetchError: function(collection, response) {
		throw new Error("Unable to fetch note from API")
	}
})

App.notes = new App.noteTakerCollection();

// VIEWS

// View for a single item
App.noteTakerFileView = Backbone.View.extend({
	tagName: "li",

	template: _.template($("#fileList-template").html()),

	events: {
		"click a": "loadEditor"
	},

	initialize: function() {
		this.model.on("change", this.render, this);
		this.model.on("destroy", this.remove, this);
	},

	render: function() {
		var html = Mustache.to_html(this.template, this.model.toJSON());
		this.$el.html(html).attr("id", this.model.get("_id"));
		return this;
	}

	loadEditor: function() {
		this.model.populateEditor();
	}
});

App.noteTakerFileListView = Backbone.View.extend({
	tagName: "div",
	initialize: function() {
		this.options.collection.on("add", this.renderItem, this);
	},
	render: function() {

		for(var i=0; i<this.options.collection.length; i++) {
			this.renderItem(this.options.collection.models[i]);
		};

		$(this.options.container).empty();

		this.$el.appendTo(this.options.container);

		return this;
	}
	renderItem: function(model) {
		var item = new App.noteTakerFileView({"model":model});
		item.render().$el.appendTo(this.$el);
	}
});

new App.Router();

Backbone.history.start();
