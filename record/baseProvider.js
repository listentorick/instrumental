require.paths.unshift('../lib/node-mongodb-native/lib/');

var sys = require("sys");

var Db = require('mongodb/db').Db,
    ObjectID = require('mongodb/bson/bson').ObjectID,
    Server = require('mongodb/connection').Server;

var BaseProvider = new Class({

	getCollectionName: function() {
		throw "You must implement getCollectionName";
	},

	constructor: function (host, port){
	  this.db= new Db('node-mongo-record', new Server(host, port, {auto_reconnect: true}, {}));
	  this.db.open(function(){});
	},

	getCollection: function(callback) {
	  this.db.collection(this.getCollectionName(), function(error, collection) {
		if( error ) callback(error);
		else callback(null, collection);
	  });
	},

	count: function(query, callback) {
	  this.getCollection(this.getCollectionName(), function(error, collection) {
		  if( error ) callback(error)
		  else {
			  collection.count(query, function(error, count) {
			  if( error ) callback(error)
			  else {
				callback(null,count);
			  }
			});
		  }
		});
	},
	
	findBy: function(query, callback) {
	  this.getCollection(this.getCollectionName(), function(error, collection) {
		  if( error ) callback(error)
		  else {
			collection.find(query, function(error, cursor) {
			  if( error ) callback(error)
			  else {
				cursor.toArray(function(error, results) {
				  if( error ) callback(error)
				  else callback(null, results)
				});
			  }
			});
		  }
		});
	},

	findAll: function(callback) {
	  this.getCollection(this.getCollectionName(),function(error, collection) {
		  if( error ) callback(error)
		  else {
			collection.find(function(error, cursor) {
			  if( error ) callback(error)
			  else {
				cursor.toArray(function(error, results) {
				  if( error ) callback(error)
				  else callback(null, results)
				});
			  }
			});
		  }
		});
	},
	
	findOne: function(query, callback) {
	  this.getCollection(this.getCollectionName(),function(error, collection) {
		  if( error ) callback(error)
		  else {
			 collection.findOne(query, function(error, result) {
				if( error ) callback(error)
				else callback(null, result)
			});
		  }
		});
	},
	
	save: function(events, callback) {
  
		this.getCollection(this.getCollectionName(), function(error, collection) {
		  if( error ) callback(error)
		  else {
			if( typeof(events.length)=="undefined")
			  events = [events];
			for( var i =0;i< events.length;i++ ) {
			  events[i].created_at = new Date();
			}
			collection.insert(events, function() {
			  callback(null, events);
			});
		  }
		});
	}
});

exports.BaseProvider = BaseProvider;