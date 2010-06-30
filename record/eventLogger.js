
EventLogger = function(eventProvider){
	this._eventProvider = eventProvider;
};

EventLogger.prototype.log = function(eventId, instrumentationId, date, data, callback) {
   
  var eventLog = {
	eventId: eventId,
	instrumentationId: instrumentationId,
	data: data
  };
  
  
  this._eventProvider.save(eventLog, callback);
  
};



exports.EventLogger = EventLogger;