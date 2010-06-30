require.paths.unshift('lib/node-mongodb-native/lib/');

var Db = require('mongodb/db').Db,
    ObjectID = require('mongodb/bson/bson').ObjectID,
    Server = require('mongodb/connection').Server;


var EventProvider = function(host, port){
  this.db= new Db('node-mongo-record', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

EventProvider.prototype.getCollection= function(callback) {
  this.db.collection('events', function(error, event_collection) {
    if( error ) callback(error);
    else callback(null, event_collection);
  });
};


EventProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        event_collection.find(function(error, cursor) {
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

};

/*

ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

*/

EventProvider.prototype.save = function(events, callback) {
  
this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        if( typeof(events.length)=="undefined")
          events = [events];
        for( var i =0;i< events.length;i++ ) {
          events[i].created_at = new Date();
        }

        event_collection.insert(events, function() {
          callback(null, events);
        });
      }
    });

};

exports.EventProvider = EventProvider;