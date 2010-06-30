require.paths.unshift('lib/express/lib');
require('express');
require('express/plugins'); 
var sys = require('sys');

var VisitorHelper = require('./visitorHelper').VisitorHelper;
var EventProvider = require('./eventProvider').EventProvider;
var EventLogger = require('./eventLogger').EventLogger;

Record = { 
  httpRequestPlugins: []
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
	var numPlugins = Record.httpRequestPlugins.length;
	var plugin;
	var config = {eventLogger:eventLogger};
	for(var i=0;i<numPlugins;i++){
		plugin = Record.httpRequestPlugins[i];
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

		//iterate over all our plugins 
		//var eventDateTime = new Date();
		//var instrumentationId = 1;  //The id of the stats this data belonsg to.
		//var vistorId;
		//if(VisitorHelper.isUniqueVisit(this)) {
	   //		visitorId = 1;
		//} else {
		//	visitorId = VisitorHelper.getVisitorId(this);
		//}
		//var numPlugins = Record.httpRequestPlugins.length;
		//var plugin;
		//var context;
		//for(var i=0; i<numPlugins;i++) {
		//	plugin = Record.httpRequestPlugins[i];
		//	plugin.process(this,eventDateTime, instrumentationId, visitorId);
		//}

		this.render('record.html.ejs', {
			layout:false,
			locals: {}
		})

	}); 
	
	get('/record', function() {
	
	});

	run(port, interface);

}
  
exports.start = startRecord;

