var VisitorHelper = {

	/**
	* Returns the visitors id. 
	* If the visitor is new, an id is generated.
	*/
	getVisitorId: function(Request) {
		var vistorId = null;
		
		if(VisitorHelper.isUniqueVisit(Request)) {
			vistorId = Request.cookies.ivid;
		}
		return vistorId;
	},
	
	isUniqueVisit: function(Request) {
		return Request.cookies && Request.cookies.ivid;
	}
	
	
};

exports.VisitorHelper = VisitorHelper;