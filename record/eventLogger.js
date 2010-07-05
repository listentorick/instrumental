
EventLogger = function(eventProvider){
	this._eventProvider = eventProvider;
};

EventLogger.prototype.log = function(acc, uvid, vid, eventCategory, eventCode, eventData, eventTimeStamp, receivedDateTime, callback) {
   
  var eventLog = {
	acc: acc,
	uvid: uvid,
	vid: vid,
	eventCategory: eventCategory,
	eventCode: eventCode, 
	eventData: eventData,
	eventTimeStamp: eventTimeStamp,
	receivedDateTime: receivedDateTime
  };
  
  
  this._eventProvider.save(eventLog, callback);
  
};



exports.EventLogger = EventLogger;