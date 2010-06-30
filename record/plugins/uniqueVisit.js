var VisitorHelper = require('./visitorHelper').VisitorHelper;
var RequestEvents = require('./requestEvents').RequestEvents;

function UniqueVisit() {
}

UniqueVisit.prototype = {
	
	process: function(request,eventDateTime, instrumentationId, visitorId) {
		if(VisitorHelper.isUniqueVisit(this)) {
		
			//Generate a unique Id for the visitor
			visitorId = 1;
			var uniqueVisitorData = {vid:1};
			Instrumental.eventLogger.log(RequestEvents.UNIQUE_VISIT, instrumentationId, uniqueVisitorData, eventDateTime, errorHandler);
		}
	}

};

exports.UniqueVisit = UniqueVisit;