require.paths.unshift('../lib/express/lib');
require('express');
require('express/plugins'); 
var fs = require('fs');
var sys = require('sys');

var EventProvider = require('../record/eventProvider').EventProvider;
var AccountProvider = require('../record/accountProvider').AccountProvider;

	PitchFork = { 
	  plugins: {},
	  pluginConfigurations: {},
	  activeConnections: []
	}


	function loadPlugins() {
	
		var path;
		var plugin;
		var pluginClassName;
		fs.readdir(__dirname + "/plugins", function (err, files) {
			if (err) throw err;

			var num = files.length;
			for(var i=0; i<num;i++){
				path = "./plugins/" + files[i] + "/" + files[i];
				pluginClassName = capitaliseFirstLetter(files[i]);
				plugin = require(path)[pluginClassName];
				PitchFork.plugins[pluginClassName] = constructPlugin(plugin);
				sys.debug("Loaded plugin ..." + pluginClassName);
			}
		   
         }); 
	}
	
	function capitaliseFirstLetter(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	
	function constructPlugin(plugin){
		return new plugin();
	}
	
	
	/** 
	* Grabs the plugin configuration for a particular account
	*/
	function fetchAccountsPluginConfiguration(accountId, callback) {
	
		PitchFork.pluginConfigurations[accountId] = [];
		//this will actually load the from account provider
		accountProvider.findPlugginConfigurationForAccount(accountId, function(error, result) {
			if(error) {
				callback(error,null);
			} else {
				PitchFork.pluginConfigurations[accountId] = result;
				callback(null,configuration);
			}
		});
	
	}
	
	/**
	* Called when an active session for the account begins
	* This loads everything we need to begin proccessing data for the account
	*/
	function configureAccountForProccessing(accountId, callback){
	
		accountProvider.findAccount(accountId, function(error, result){
			
			if(error) {
				callback(error, null);
			} else {
				fetchAccountsPluginConfiguration(accountId, function(error, configuration) {
					if(error) {
						callback(error,null);
					} 
				});
			}
				
		});
	}
	

	/*
	function flush_queues() {
	  if( outstanding_flushes <= 0 ) {
		for (var id in connections) {
		  var connection = connections[id];
		  if (connection.state != CONNECTED) {
			continue;
		  }
		  ;(function(conn) {
			outstanding_flushes++;
			  process.nextTick(
				function() {
				  try {
					conn.flush_queue();
				  }catch(e) {
					sys.debug(e);
				  }
				  finally {
					outstanding_flushes--;
				  }
				});
		   })(connection)
		}
	  }
}
	*/
	
	function startProcessing() {
		setInterval(processData, 100); 
	}
	
	/**
	* Asks each plugin for each account to process its data so that we can push the changes to the client
	*/
	function processData() {
		var numActiveConnections = PitchFork.activeConnections.length;
		var connectionMetaData;
		var connection;
		var accountId;

		for(var i=0; i<numActiveConnections;i++){
			
			connectionMetaData = activeConnections[i];
			accountId = connectionMetaData.accountId;
			connection = connectionMetaData.connection;
			
			if (connection.state != CONNECTED) {
				continue;
			}
			(function(conn, accId) {
				process.nextTick(function(){
					processPluginDataForAccount(accId, function(error, result) {
						//we have some data back
						if(error) {
						
						} else {
							//write the data to the connection and perform a flush
						}
					});
				});
			})(connection, accountId);
			
			
		}
	
	}
	
	/**
	* Called once we have an active websocket connection to the client has been made
	* Called by processData
	*/
	function processPluginDataForAccount(accountId, callback) {
	
		//Grab our plugin configuration
		var config = PitchFork.pluginConfigurations[accountId];
		var configLength = config.length;
		var interval;
		var lastUpdated;
		var pluginName;
		var plugin;
		var now;
		for(var i=0;i<configLength;i++){

			(function(conf, accId, ctxt){
				pluginName = conf.pluginName;
				lastUpdated = conf.lastUpdated; //millisecs 
				interval = conf.interval; //millis
				plugin = PitchFork.plugins[pluginName];
				now = new Date().getTime();
				
				//pseudo code
				if((conf.lastUpdated + interval > now) && conf.isUpdating==false) {
					conf.isUpdating=true;
					plugin.process(accId, ctxt, function(error, result) {
						conf.lastUpdated = new Date().getTime();
						conf.isUpdating = false;
						callback(error,result);
					});
				}
			})(config[i], accountId,context);
		}

	}
	

	function startPitchFork(rootDir, port, interface, databaseServer, databasePort) {

		
		//initialise any plugins in the plugin folder...
		loadPlugins();
		
		//create an account provider instance
		var accountProvider = new AccountProvider(databaseServer,databasePort);
		
		//create an event provider instance
		var eventProvider = new EventProvider(databaseServer,databasePort);
		
		PitchFork.accountProvider = accountProvider;
		
		PitchFork.eventProvider = eventProvider;
		
		configure(function(){
			use(MethodOverride)
			use(ContentLength)
			use(Cookie)
			use(Cache, { lifetime: (5).minutes, reapInterval: (1).minute })
			use(Session, { lifetime: (15).minutes, reapInterval: (1).minute })
			use(Static)
			use(Logger)
			set('root', __dirname)
		});

		// Routes
		get('/', function() {
		  this.pass('/home');
		});
	  
		//A temporary route which will represent a fake login to an account
		//this configuration will be loaded when a session for the account is created..
		get('/bootstrap', function(){
		});
	  
		/*The initial script is grabbed here*/
		get('/home', function() {
			//var config = {};
			//config.path = set('root'); 		
			//this.sendfile("public/javascript/record.js", config, staticFileServed);
		}); 
		
		run(port, interface);
		
		startProcessing();

	}
  
exports.start = startPitchFork;

