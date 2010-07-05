
var VisitsSummary = function() {
};

VisitsSummary.prototype = {

	process: function(accountId, context, callback) {
		//knows what data it needs to play with
		
		//need to know the account.
		//
		
		//tchFork.EventProvider.count({acc:acc,'eventData.upv':true}, function(error, uniquePageVisits) {
			//store this result somewhere
			//callback(error);
		//
		
	},
	
	
	getInformation: function() {
		return {name: "ConcurrentUsers"};
	}

};

exports.VisitsSummary = VisitsSummary;



