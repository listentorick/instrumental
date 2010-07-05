require.paths.unshift('lib/express/lib');
require('express');
require('express/plugins'); 
var sys = require('sys');

var VisitorHelper = require('./visitorHelper').VisitorHelper;
var EventProvider = require('./eventProvider').EventProvider;
var EventLogger = require('./eventLogger').EventLogger;

Record = { 
  plugins: {}
}

function configurePlugin(env, callback) {
  if (env instanceof Function)
    callback = env, env = 'all'
  if (callback instanceof Function)
    return Record.httpRequestPlugins.push([env, callback])
}

exports.configurePlugin = configurePlugin;

function startRecord(rootDir, port, interface, databaseServer, databasePort) {

	var eventProvider = new EventProvider(databaseServer,databasePort);
	var eventLogger = new EventLogger(eventProvider);
	//Give the Record object a reference to our eventLogger
	Record.eventLogger = eventLogger;
	
	//Initialise the plugins
	//var numPlugins = Record.plugins.length;
	var plugin;
	var config = {eventLogger:eventLogger};
	for(var prop in Record.plugins){
		plugin = Record.plugins[prop];
		Object.merge(plugin,context);
	}
	
	//Configure express
	configure(function(){
		use(MethodOverride)
		use(ContentLength)
		use(Cookie)
		use(Cache, { lifetime: (5).minutes, reapInterval: (1).minute })
		use(Session, { lifetime: (15).minutes, reapInterval: (1).minute })
		use(Static)
		use(Logger)
		set('root', __dirname)
	})

	// Routes
	get('/', function() {
	  this.pass('/launcher');
	});
  
	function errorHandler(error){
		sys.p(error);
	}
	
	/*The initial script is grabbed here*/
	get('/launcher', function() {
		var config = {};
		config.path = set('root'); 		
		this.sendfile("public/javascript/record.js", config, staticFileServed);
	}); 
	
	function eventLoggedCallback(error){
	}
	
	function staticFileServed(error){
	}

	get('/record', function() {
		//sys.p("recorded");
		//sys.p(this.params);
		var receivedDateTime = new Date();
		
		var payload = this.params.get;
		var acc = payload.acc;
		var uvid = payload.uvid;
		var vid = payload.vid;
		
		var events = eval(payload.events);
		var numEvents = events.length;
		var event;
		var eventCategory;
		var eventCode;
		var eventData;
		var eventTimeStamp;
		
		//call plugins here (chain using callbacks to amend data if need be (i.e. resolve stuff with external sources such as twitter)
		
		for(var i=0; i<numEvents;i++){
			event = events[i]; 
			eventCategory = event.eventCategory;
			eventCode = event.eventCode;
			eventData = event.eventData;
			eventTimeStamp = event.eventTimeStamp
			//plugin = Record.plugins[eventCategory];
			//Here we would modify data if need be using plugins. Currently cant see the point
			Record.eventLogger.log(acc, uvid, vid, eventCategory, eventCode, eventData, eventTimeStamp, receivedDateTime, eventLoggedCallback);
		}
					
		this.sendfile("public/images/record.gif", config, staticFileServed);
	});

	run(port, interface);

}
  
exports.start = startRecord;

