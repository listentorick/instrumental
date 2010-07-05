var VisitorHelper = require('./visitorHelper').VisitorHelper;
var RequestEvents = require('./requestEvents').RequestEvents;

function PageView() {
}

PageView.prototype = {
	
	process: function(acc, uvid, vid, eventCode, eventData, eventTimeStamp, receivedDateTime) {
		
		//Instrumental.eventLogger.log(RequestEvents.UNIQUE_VISIT, instrumentationId, uniqueVisitorData, eventDateTime, errorHandler);
	}

};

exports.PageView = PageView;