
var Instrumental = (function () {

	var escapeWrapper = window.encodeURIComponent || escape;
	
	/*
	* decode or unescape
	* - decodeURIComponent added in IE5.5
	*/
	var unescapeWrapper = window.decodeURIComponent || unescape;

	function isDefined(property) {
		return typeof property !== 'undefined';
	}
	
	function addEventListener(event, listener) {
		if (document.addEventListener) {
			document.addEventListener(event, listener, false);
		} else {
			if (document.attachEvent) {
				document.attachEvent("on" + event, listener);
			}
		}
	}
	
	function getClientWidth() {
		return document.clientWidth !== undefined ? document.clientWidth : window.innerWidth;
	}
	
	function getClientHeight() {
		return document.clientHeight !== undefined ? document.clientHeight : window.innerHeight;
	}
	
	function getClientScrollX() {
		return window.pageXOffset === undefined ? document.scrollLeft : window.pageXOffset;
	}
	
	function getClientScrollY() {
		return window.pageYOffset === undefined ? document.scrollTop : window.pageYOffset;
	}
	
	/*
	* Set cookie value - note the cookie will only be accepted if the domain value is that of the owner
	*/
	function setCookie(cookieName, value, daysToExpire, path, domain, secure) {
		var expiryDate;

		if (daysToExpire) {
			// time is in milliseconds
			expiryDate = new Date();
			// there are 1000 * 60 * 60 * 24 milliseconds in a day (i.e., 86400000 or 8.64e7)
			expiryDate.setTime(expiryDate.getTime() + daysToExpire * 8.64e7);
		}

		document.cookie = cookieName + '=' + escapeWrapper(value) +
							  (daysToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
							  ';path=' + (path ? path : '/') +
							  (domain ? ';domain=' + domain : '') +
							  (secure ? ';secure' : '');
	}

	/*
	 * Get cookie value
	 */
	function getCookie(cookieName) {
		var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'),

			cookieMatch = cookiePattern.exec(document.cookie);

		return cookieMatch ? unescapeWrapper(cookieMatch[2]) : 0;
	}
	
	/*
	* stringify
	* - based on public domain JSON implementation at http://www.json.org/json2.js (2009-04-16)
	*/
	function stringify (value) {

		var escapable = new RegExp('[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]', 'g'),
			// table of character substitutions
			meta = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};

		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.
		function quote(string) {
			escapable.lastIndex = 0;
			return escapable.test(string) ?
				'"' + string.replace(escapable, function (a) {
					var c = meta[a];
					return typeof c === 'string' ? c :
						'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}) + '"' :
				'"' + string + '"';
		}

		function f(n) {
			return n < 10 ? '0' + n : n;
		}

		// Produce a string from holder[key].
		function str(key, holder) {
			var i,          // The loop counter.
				k,          // The member key.
				v,          // The member value.
				partial,
				value = holder[key];

			if (value === null) {
				return 'null';
			}

			// If the value has a toJSON method, call it to obtain a replacement value.
			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}

			// What happens next depends on the value's type.
			switch (typeof value) {
			case 'string':
				return quote(value);

			case 'number':
				// JSON numbers must be finite. Encode non-finite numbers as null.
				return isFinite(value) ? String(value) : 'null';

			case 'boolean':
			case 'null':
				// If the value is a boolean or null, convert it to a string. Note:
				// typeof null does not produce 'null'. The case is included here in
				// the remote chance that this gets fixed someday.
				return String(value);

			case 'object':
				// Make an array to hold the partial results of stringifying this object value.
				partial = [];

				// Is the value an array?
				// if (Object.prototype.toString.call(value)=="[object Array]") {	// call added in IE5.5
				if (value instanceof Array) {
					// The value is an array. Stringify every element. Use null as a placeholder
					// for non-JSON values.
					for (i = 0; i < value.length; i++) {
						partial[i] = str(i, value) || 'null';
					}

					// Join all of the elements together, separated with commas, and wrap them in
					// brackets.
					v = partial.length === 0 ? '[]' : '[' + partial.join(',') + ']';
					return v;
				}

				// if (Object.prototype.toString.call(value)=="[object Date]") {	// call added in IE5.5
				if (value instanceof Date) {
					return quote(value.getUTCFullYear()   + '-' +
							   f(value.getUTCMonth() + 1) + '-' +
							   f(value.getUTCDate())      + 'T' +
							   f(value.getUTCHours())     + ':' +
							   f(value.getUTCMinutes())   + ':' +
							   f(value.getUTCSeconds())   + 'Z');
				}

				// Otherwise, iterate through all of the keys in the object.
				for (k in value) {
					v = str(k, value);
					if (v) {
						// partial.push(quote(k) + ':' + v); // array.push added in IE5.5
						partial[partial.length] = quote(k) + ':' + v;
					}
				}

				// Join all of the member texts together, separated with commas,
				// and wrap them in braces.
				v = partial.length === 0 ? '{}' : '{' + partial.join(',') + '}';
				return v;
			}
		}

		return str('', {'': value});
	}
		
	function Recorder(siteId) {
	
		var configRecordUrl = "http://instrumental:10001/record";
		var configCustomUrl;
		var configTitle = document.title? document.title: "";
		
		var configCaptureTimeout = 500;
		var events = [];
		var EVENT_BUFFER = 500; //The size of the event buffer.
		var timeStamp = new Date().getTime(); //Time of initialisation
		var plugins = [];
		
		function getUrl() {
			return isDefined(configCustomUrl) ? configCustomUrl : document.location.href;
		}
		
		/*
		* Get page referrer
		*/
		function getReferrer() {
			var referrer = '';
			try {
				referrer = top.document.referrer;
			} catch (e) {
				if (parent) {
					try {
						referrer = parent.document.referrer;
					} catch (e2) {
						referrer = '';
					}
				}
			}
			if (referrer === '') {
				referrer = document.referrer;
			}

			return referrer;
		}
		
		/*
		* We use a GET to send our data to the server
		*/
		function capture(url, configCaptureTimeout) {
			var image = new Image(1, 1);
			image.onLoad = function () { };
			image.src = url;
		}
		
		function constructRequestUrl(request) {
			return configRecordUrl + '?' + request;
		}
	
		/*
		* Returns the URL to call piwik.php, 
		* with the standard parameters (plugins, resolution, url, referer, etc.)
		*/
		function getBaseRequest() {
			var i, now, request;
			now = new Date();
			request = 	'acc=' + siteId +
						'&uvid=' + escapeWrapper(uniqueVisitorId);

			request =  constructRequestUrl(request);
			return request;
		}
	
		/*
		* Log the page view / visit
		*/
		function recordPageView(customTitle) {
			
			var pageViewData = {
				action: isDefined(customTitle) ? customTitle : configTitle,
				urlref: escapeWrapper(pageReferrer),
				url: pageUrl,
				upv: uniquePageView //site wide unique visit - should this b
			};
			//can we tell about unique page visits on the client?
			//this is probably a bad idea....
			
			recordEvent("PageViewPlugin",0, pageViewData, true);
		}


		function flushEvents() {
		
		}
		
		var eventBuffer;
		
		/**
		* Record the event
		* @param {String} eventCategory This is the event category
		* @param {String} eventCode This is the event code
		* @param {String} eventData This is the event data
		* @param {String} immediateCapture If true send the event to the server immediately
		*/
		function recordEvent(eventCategory, eventCode, eventData, immediateCapture) {
			var event = {eventCategory: eventCategory, eventCode: eventCode, eventData: eventData, eventTimeStamp: timeStamp - new Date().getTime()};
			if(immediateCapture===true) {
				var request = getBaseRequest();
				//request += "&events=" + encodeURIComponent("[" + stringify(event) + "]");
				request += "&events=" + escapeWrapper("[" + stringify(event) + "]");
				
				
				capture(request);
			} else {
				//what do we do now?
			}
			
		}
		
		function addPlugin(plugin) {
		
			
			//copy helpers onto the plugin (or pass a helper?)
			plugin.prototype.getClientWidth = getClientWidth;
			plugin.prototype.getClientHeight = getClientHeight;
			plugin.prototype.getClientScrollX = getClientScrollX;
			plugin.prototype.getClientScrollY = getClientScrollY;
			
			plugin = plugins[plugins.length] = new plugin();
			
			plugin.init(this);
		}
		
		function getUniqueVisitorId() {
			var id = getCookie("UNIQUE_VISITOR_ID");
			return id;
		}
		
		/**
		* We add to the cookie each url visited... so that we can tell if the url
		* has been visited before
		*/
		function isUniquePageView() {
			return getCookie(pageUrl);
		}
		
		function generateAndStoreUniqueVisitorId() {
			//Investigate how to generate an id which we can reliably represent a unique visit
			//should include domain, time since 1970, current ip address and some random element...
			var id = Math.random()*1000; 
			setCookie("UNIQUE_VISITOR_ID", id);
			return id;
		}
		
				
		var pageReferrer = getReferrer();
		var pageUrl = getUrl();
		
		//This is a unique domain visit
		var uniqueVisitorId = getUniqueVisitorId();
		var isUniqueVisit = false;
		if(uniqueVisitorId===0) {
			vistorId = generateAndStoreUniqueVisitorId();
			isUniqueVisit = true;
		}
		
		//Is this a unique page view - should this be a plugin
		var uniquePageView = getCookie(pageUrl)===0;
		alert(uniquePageView);
		if(uniquePageView) {
			setCookie(pageUrl,true);
		}
		
				
		return {
			recordPageView: recordPageView,
			recordEvent: recordEvent,
			addPlugin: addPlugin
		};
	}
	
	function getRecorder(siteId) {
		return new Recorder(siteId);
	}

	return {
		addEventListener: addEventListener,
		getRecorder:getRecorder
	};

})();



var HeatMapPlugin = function() {
};

HeatMapPlugin.prototype = {

	init: function(recorder, domHelper) {
		var lastClickTime = 0;
		var currentClickTime = 0;
		var self = this;
		this._mouseDownListener = function(evt) {
			
			currentClickTime = new Date().getTime();
			if(currentClickTime-lastClickTime<1000) {return;}
			
			var button;
			var element;
			if (evt === undefined) {
				evt = window.event;
				button = evt.button;
				element = evt.srcElement;
			} else {
				button = evt.which;
				element = null;
			}
			
			if(button===0) {return;}
			
			var eventData = {
				x: evt.clientX,  
				y: evt.clientY,
				w: self.getClientWidth(),
				h: self.getClientHeight(),
				sx: self.getClientScrollX(),
				sy: self.getClientScrollY()
			};
				
			recorder.recordEvent("HeatMapPlugin", 0, eventData, true);

		};
		
		Instrumental.addEventListener("mousedown", this._mouseDownListener);
	},
	dispose: function() {
		Instrumental.removeEventListener("mousedown", this._mouseDownListener);
	}
};

