var BaseProvider = require("./baseProvider").BaseProvider;

var sys = require("sys");
	
var EventProvider = BaseProvider.extend({

	getCollectionName: function() {
		return "events";
	}
});

exports.EventProvider = EventProvider;