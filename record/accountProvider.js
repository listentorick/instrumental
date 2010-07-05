var BaseProvider = require("./baseProvider").BaseProvider;

var sys = require("sys");

var AccountProvider = BaseProvider.extend({

	getCollectionName: function() {
		return "accounts";
	},
	
	findAccount: function(accountId, callback) {
		this.findOne({acc:accountId}, callback);
	},
	
	findPlugginConfigurationForAccount: function(accountId, callback) {
		var result = [{processInterval:1000,pluginName: "VistSummary"}];
		callback(null,result);
	}
});

exports.AccountProvider = AccountProvider;