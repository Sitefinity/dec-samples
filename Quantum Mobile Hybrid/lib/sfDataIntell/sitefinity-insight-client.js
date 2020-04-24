var sfDataIntell = sfDataIntell || {};

sfDataIntell.constants = {
	sdkVersion: "js-3.0.11",
	cookieName: "sf-data-intell-subject",
	endpoints: {
		apiServer: "https://api.dec.sitefinity.com"
	},
	headers: {
		authorization: "Authorization",
		datacenterkey: "x-dataintelligence-datacenterkey",
		subject: "x-dataintelligence-subject",
		ids: "x-dataintelligence-ids",
		datasource: "x-dataintelligence-datasource",
		contacts: "x-dataintelligence-contacts",
		sdkVersion: "x-dataintelligence-sdk-version"
	}
};
var sfDataIntell = sfDataIntell || {};

sfDataIntell.utils = {

	visitPredicate: "Visit",

	getEndpointUrl: function getEndpointUrl(apiServer, apiKey, source) {
		//url: context.apiServerUrl + '/collect/v1/data-centers/' + context.apiKey +  '/sentences/datasource/' + context.source,
		return apiServer + '/collect/v2/data-centers/' + apiKey + '/datasources/' + source + '/interactions';
	},

	getSentencesRequestOptions: function getSentencesRequestOptions(parameters, data, headers){
		if(data.length == 1){
			data = data[0];
		}

		var url = sfDataIntell.utils.getEndpointUrl(parameters.apiServerUrl, parameters.apiKey, parameters.source);
		var requestOptions = sfDataIntell.utils.getRequestOptions(data, 'POST', url, headers);
		return requestOptions;
	},

	getRequestOptions: function (data, httpMethod, url, headers){

		var requestOptions = {
			method: httpMethod,
			url: url,
			contentType: 'application/json',
			headers: headers || {},
			data: data
		};

		requestOptions.headers[sfDataIntell.constants.headers.sdkVersion] = sfDataIntell.constants.sdkVersion;
		return requestOptions;
	},

	translateOldToNewFormat: function translateOldToNewMetadata(metadata){
		var newFormat = {};

		if (metadata instanceof Array){
			for (i = 0; i < metadata.length; i++){
				var obj = metadata[i];
				if (obj.K && obj.V)
					newFormat[obj.K] = obj.V;
			}
		} else {
			newFormat = metadata;
		}

		return newFormat;
	},

	addReferrer: function addReferrer(objectMetadata){
		if (window && window.decMetadata && window.decMetadata.contentMetadata){
			if (window.decMetadata.contentMetadata.PageId) {
				objectMetadata.PageId = window.decMetadata.contentMetadata.PageId;
			}

			if (window.decMetadata.contentMetadata.Language) {
				objectMetadata.Language = window.decMetadata.contentMetadata.Language;
			}

			if (window.decMetadata.contentMetadata.SiteName) {
				objectMetadata.SiteName = window.decMetadata.contentMetadata.SiteName;
			}

			if (window.decMetadata.contentMetadata.Id) {
				objectMetadata.ReferrerId = window.decMetadata.contentMetadata.Id;
			}

			if (window.decMetadata.contentMetadata.ContentType) {
				objectMetadata.ReferrerType = window.decMetadata.contentMetadata.ContentType;
			}

			if (window.decMetadata.contentMetadata.SFDataProviderName) {
				objectMetadata.ReferrerProvider = window.decMetadata.contentMetadata.SFDataProviderName;
			}
		}
	}
};
var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.Client = function(options) {
		var that = this;
		options = options || {};

		if(!options.apiKey)	{
			throw new Error('You must provide the "apiKey" for the Data Center.');
		}

		if(!options.source) {
			throw new Error('You must provide the "source" name for the data center in which data will be reported.');
		}

		var enableTracking = options.enableTracking;
		if (options.enableTracking === null || options.enableTracking === undefined){
			console.warn('The "enableTracking" option is set to True by default. To disable tracking, change the value to False.');
			enableTracking = true;
		}

		this.apiKey = options.apiKey;
		this.source = options.source;
		this.authToken = options.authToken;
		this.apiServerUrl = options.apiServerUrl || sfDataIntell.constants.endpoints.apiServer;
		this.pageInfoProvider = options.pageInfoProvider || new sf.PageInfoProvider();

		this.isLocalStorageSupported = this.isLocalStorageSupported();
		var subjectKey = this.readCookie();

		var requester = sf.DecRequesterFactory.getRequester(enableTracking);

		this.decRequester = requester;

		var writeSubjectMetadata = false;

		if((subjectKey === null || subjectKey === "") && enableTracking === true) {
			subjectKey = this.generateSubjectKey();
			this.setCookie(subjectKey, 365, options.trackingCookieDomain);
			writeSubjectMetadata = true;
		}

		this.sentenceClient = new sf.SentenceClient(subjectKey, this.isLocalStorageSupported);

		if (enableTracking === false){
			this.sentenceClient.writeSentence = function(){};
		}

		if(options.trackBrowserInformation ) {

			if(writeSubjectMetadata && window.detect) {

				var parsedUA = this.getParseUserAgent();
				var browserLanguage = this.getBrowserLanguage();
				var subjectMetadata = {
					'Browser': parsedUA.browser.family,
					'Browser version':parsedUA.browser.version,
					'Browser language': browserLanguage,
					'Device': parsedUA.device.family,
					'Device type': parsedUA.device.type
				};

				if(parsedUA.device.manufacturer !== null && parsedUA.device.manufacturer !== "")
				{
					subjectMetadata['Device manufacturer'] = parsedUA.device.manufacturer;
				}

				this.sentenceClient.writeSentence({
					subjectMetadata: subjectMetadata
				});
			}
		}

		if (typeof options.autoTracking === 'boolean') {
			this.autoTracking = options.autoTracking;
		} else {
			this.autoTracking = true;
		}

		this.subjectMetadataClient = new sf.SubjectMetadataClient(this.sentenceClient);
		this.personalizationClient = new sf.PersonalizationClient(this.apiServerUrl, subjectKey, this.apiKey, this.source, this.authToken, requester);

		this.v2 = {};
		this.v2.personalizationClient = new sf.PersonalizationClientV2(this.apiServerUrl, subjectKey, this.apiKey, this.source, this.authToken, requester);

		this.mappingsClient = new sf.MappingsClient({apiServerUrl: this.apiServerUrl, subject: subjectKey, apiKey: this.apiKey, datasource: this.source}, this.sentenceClient);

		if(options.instrument){
			this.instrumenter = new sf.HtmlInstrumenter(this.sentenceClient);
			this.instrumenter.startTracking();
		}

		if(options.trackPageVisits){
			this.pageVisitsTracker = new sf.PageVisitsTracker(this.sentenceClient,{
				predicate: options.trackPageVisits.predicate,
				obj: options.trackPageVisits.obj,
				objMetadata: options.trackPageVisits.objMetadata
			}, this.pageInfoProvider);
			this.pageVisitsTracker.startTracking();
		}

		if(options.trackUtmParameters){
			this.utmParametersTracker = new sf.UtmParametersTracker(this.sentenceClient,
				options.trackUtmParameters.predicate,
				options.trackUtmParameters.obj,
				options.trackUtmParameters.objMetadata,
				options.trackUtmParameters.subMetadata);
			this.utmParametersTracker.startTracking();
		}

		if (enableTracking === true && this.autoTracking) {
			setInterval(function () {
				that.flushData(that);
			}, 5000);
		}
	};

	sf.Client.prototype = {

		generateSubjectKey: function () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		},

		setCookie: function (cvalue, exdays, cdomain) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			var expires = "expires=" + d.toGMTString();
			var cookie = sf.constants.cookieName + "=" + cvalue + ";path=/; " + expires;
			if(cdomain) {
				cookie += ";domain=" + cdomain;
			}
			cookie += ";SameSite=Lax";
			document.cookie = cookie;
		},

		deleteCookie: function (domain) {
			var date = new Date();
			date.setTime(date.getTime() - 9000);
			var expires = "; expires=" + date.toGMTString();
			var domainPart = "";
			if (domain) {
				domainPart = "; domain=" + domain;
			}

			document.cookie = sf.constants.cookieName + "=" + expires + "; path=/" + domainPart;
		},

		readCookie: function() {
			var nameEQ = sf.constants.cookieName + "=";
			var ca = window.document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i].trim();
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		},

		flushData: function(context){
			var sentencesJsonData;

			if (context.isLocalStorageSupported) {
				if (localStorage.sentences) {
					sentencesJsonData = JSON.parse(localStorage.sentences);
					context.flushSentences(context, sentencesJsonData);
					localStorage.sentences = '';
				}
			}
			else {
				if (window.tempStorage.sentences) {
					sentencesJsonData = JSON.parse(window.tempStorage.sentences);
					context.flushSentences(context, sentencesJsonData);
					window.tempStorage.sentences = '';
				}
			}
		},

		flushSentences: function(context, sentencesJsonData) {
			var requestOptions = sfDataIntell.utils.getSentencesRequestOptions(context, sentencesJsonData);

			this.decRequester.ajaxCall(requestOptions);
		},

		getParseUserAgent: function() {
			var	ua = detect.parse(navigator.userAgent);
			return ua;
		},

		getBrowserLanguage: function(){
			var browserLanguage = navigator.language || navigator.userLanguage;
			return browserLanguage;
		},

		isLocalStorageSupported: function() {
			var testKey = 'test';
			try {
				localStorage.setItem(testKey, '1');
				localStorage.removeItem(testKey);
				return true;
			} catch (error) {
				window.tempStorage = {};
				return false;
			}
		}
	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function decRequester(sf) {
	'use strict';

	var DecRequesterFactory = {
		getRequester: function(enableTracking){
			if (enableTracking)
				return new sf.DecRequester();
			else
				return new sf.DecRequesterMock();
		}
	};

	sf.DecRequesterFactory = DecRequesterFactory;
})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function decRequester(sf) {
	'use strict';

	sf.DecRequester = function() {
	};

	var applyHeaders = function (xhr, headers) {
		for (var i in headers) {
			xhr.setRequestHeader(i, headers[i]);
		}
	};

	var handleCallback = function (xhr, options, callback){
		if (callback) {
			if (options.contentType && xhr.response && options.contentType === 'application/json'){
				try {
					var parsed = JSON.parse(xhr.response);
					callback(parsed);
				}
				catch(e) {
					callback(xhr.response);
				}
			} else {
				callback(xhr.response);
			}
		}
	};

	sf.DecRequester.prototype = {
		ajaxCall: function (options, successCallback, errorCallback) {
			if (!options) throw new Error("options is required.");
			if (!options.method) throw new Error("options.method is required.");
			if (!options.url) throw new Error("options.url is required.");

			var method = options.method;
			var url = options.url;
			var data = options.data ? JSON.stringify(options.data) : null;

			var xhr = new XMLHttpRequest();
			xhr.open(method, url, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
						handleCallback(xhr, options, successCallback);
					} else {
						handleCallback(xhr, options, errorCallback);
					}
				}
			};

			var headers = options.headers || {};
			if (options.contentType) {
				headers["Content-Type"] = options.contentType;
			}
			applyHeaders(xhr, headers);

			xhr.send(data);
		}
	};
})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function decRequester(sf) {
	'use strict';

	sf.DecRequesterMock = function() {
	};

	sf.DecRequesterMock.prototype = {
		ajaxCall: function (options, successCallback, errorCallback) {
			if (successCallback)
				successCallback({});
		}
	};
})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function (sf) {

	sf.HtmlInstrumenter = function (sentenceClient) {

		this.sentenceClient = sentenceClient;

	};

	sf.HtmlInstrumenter.prototype = {
		startTracking: function () {
			var that = this;

			var decInstumentedElements = window.document.querySelectorAll('[sfdi-trigger]');

			for (var i = 0; i < decInstumentedElements.length; i++) {
				var instrumentedElement = decInstumentedElements[i],
					eventName = instrumentedElement.getAttribute('sfdi-trigger');

				/* jshint ignore:start */
				instrumentedElement.addEventListener(eventName, function (event) {
					var eventTarget = event.currentTarget;

					var predicate = eventTarget.getAttribute('sfdi-predicate'),
						object = eventTarget.getAttribute('sfdi-object'),
						objectMetadataOld = eventTarget.getAttribute('sfdi-obj-metadata'),
						subjectMetadataOld = eventTarget.getAttribute('sfdi-sub-metadata');

					objectMetadataOld = that.buildMetadataArray(objectMetadataOld);
					subjectMetadataOld = that.buildMetadataArray(subjectMetadataOld);

					/*
                        If the predicate or object atributes are not provided, we need to set their respective variables to undefined,
                        so that they won't get parsed and sent to the DEC API Server
                    */
					if (predicate == null) predicate = undefined;
					if (object == null) object = undefined;

					var sentence = {
						predicate: predicate,
						object: object
					};

					if (objectMetadataOld) {
						sentence.objectMetadata = sfDataIntell.utils.translateOldToNewFormat(objectMetadataOld);

						sentence.objectMetadata.ReferrerUrl = location.href;
					} else {
						sentence.objectMetadata = {ReferrerUrl: location.href};
					}

					sfDataIntell.utils.addReferrer(sentence.objectMetadata);

					if (subjectMetadataOld) {
						sentence.subjectMetadata = sfDataIntell.utils.translateOldToNewFormat(subjectMetadataOld);
					}

					that.sentenceClient.writeSentence(sentence);
				});
				/* jshint ignore:end */
			}
		},

		buildMetadataArray: function (metadata) {
			if (metadata) {
				metadata = JSON.parse(metadata.replace(new RegExp("\\\\", "gm"), "").replace(new RegExp("\'", "gm"), "\""));
				return metadata;
			}
			return null;
		}
	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.SentenceClient = function(subjectKey, isLocalStorageSupported){
		this.subjectKey = subjectKey;
		this.isLocalStorageSupported = isLocalStorageSupported;
	};

	sf.SentenceClient.prototype = {

		writeSentence: function(sentence) {

			if (!sentence) {
				throw new Error('You must provide "sentence" argument when writing a sentence.');
			}

			// if (!sentence.predicate) {
			//     throw new Error('You must provide "sentence.predicate" argument when writing a sentence.');
			// }
			//
			// if (!sentence.object) {
			//     throw new Error('You must provide "sentence.object" argument when writing a sentence.');
			// }

			var storedSentences;
			if (this.isLocalStorageSupported) {
				if (!localStorage.sentences) {
					storedSentences = [];
				}
				else {
					storedSentences = JSON.parse(localStorage.sentences);
				}
			}
			else {
				if (!window.tempStorage.sentences) {
					storedSentences = [];
				}
				else {
					storedSentences = JSON.parse(window.tempStorage.sentences);
				}
			}

			if (sentence.subjectMetadata) {
				sentence.subjectMetadata = sfDataIntell.utils.translateOldToNewFormat(sentence.subjectMetadata);
			}

			if (sentence.objectMetadata) {
				sentence.objectMetadata = sfDataIntell.utils.translateOldToNewFormat(sentence.objectMetadata);
			}

			if (sentence.predicate && sentence.object && sentence.predicate !== sfDataIntell.utils.visitPredicate)
			{
				sentence.objectMetadata = sentence.objectMetadata || {};

				sfDataIntell.utils.addReferrer(sentence.objectMetadata);
			}

			storedSentences.push({
				S: this.subjectKey,
				P: sentence.predicate,
				O: sentence.object,
				SM: sentence.subjectMetadata,
				OM: sentence.objectMetadata,
				MappedTo: sentence.mappedTo
			});

			if (this.isLocalStorageSupported) {
				localStorage.sentences = JSON.stringify(storedSentences);
			}
			else {
				window.tempStorage.sentences = JSON.stringify(storedSentences);
			}
		}
	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.SubjectMetadataClient = function(sentenceClient){
		this.sentenceClient = sentenceClient;
	};

	sf.SubjectMetadataClient.prototype = {

		writeSubjectMetadata: function(metadata) {

			if (!metadata) {
				throw new Error('You must provide "metadata" argument when writing subject metadata.');
			}

			var newMetadata = sfDataIntell.utils.translateOldToNewFormat(metadata);

			this.sentenceClient.writeSentence({
				subjectMetadata: newMetadata
			});
		}
	};

})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.PageVisitsTracker = function(sentenceClient, trackPageVisit, pageInfoProvider) {
		this.pageInfoProvider = pageInfoProvider;
		this.pageMetadataStorage = new sf.PageMetadataStore();
		this.sentenceClient = sentenceClient;
		this.predicate = trackPageVisit.predicate || sfDataIntell.utils.visitPredicate;
		this.obj = trackPageVisit.obj || this.pageInfoProvider.getCurrentPageUrl();
		this.objMetadata = trackPageVisit.objMetadata || {};

		if (window.decMetadata && window.decMetadata.contentMetadata){
			this.objMetadata = window.decMetadata.contentMetadata;
		}
	};

	sf.PageVisitsTracker.prototype = {

		startTracking: function(){
			this.storeMetadataForCurrentPage(this.obj, this.objMetadata);
			//get referrer page metadata
			var referrerUrl = this.pageInfoProvider.getCurrentPageReferrer();

			this.attachPreviousPageMetadata(this.objMetadata, referrerUrl);
			this.attachReferrerMetadata(this.objMetadata, referrerUrl);

			this.sentenceClient.writeSentence({
				predicate: this.predicate,
				object: this.obj,
				objectMetadata: this.objMetadata
			});
		},

		storeMetadataForCurrentPage: function(currentUrl, currentOM){
			var pageMetadata = {
				PageId: currentOM.PageId,
				Language: currentOM.Language
			};

			if(currentOM.ABTest && currentOM.ABTest.Id && currentOM.ABTest.VariantId){
				pageMetadata.ABTestId = currentOM.ABTest.Id;
			}

			this.pageMetadataStorage.addMetadata(currentUrl, pageMetadata);
		},

		attachPreviousPageMetadata: function(OM, referrerUrl){

			var previousPageMetadata = this.pageMetadataStorage.getMetadata(referrerUrl);

			if(previousPageMetadata){
				OM.PreviousPageId = previousPageMetadata.PageId;
				OM.PreviousPageLanguage = previousPageMetadata.Language;
				OM.PreviousPageABTestId = previousPageMetadata.ABTestId || previousPageMetadata.PreviousPageABTestId;
			}
		},

		attachReferrerMetadata: function(OM, referrerUrl){
			if(!referrerUrl)
				return;

			OM.PreviousPageUrl = referrerUrl;

			var referrerHostName = this.getHostName(referrerUrl);
			if(referrerHostName && referrerHostName !== location.hostname)
				OM.ReferrerUrl = referrerHostName;
		},

		getHostName: function(referrerUrl) {
			if (referrerUrl) {
				var a =  document.createElement('a');
				a.href = referrerUrl;
				return a.hostname;
			}
			return undefined;
		}
	};
})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.UtmParametersTracker = function(sentenceClient, predicate, obj, objMetadata, subMetadata) {
		this.sentenceClient = sentenceClient;
		this.predicate = predicate || "Participate in campaign";
		this.obj = obj || location.search;
		this.objMetadata = objMetadata;
		this.subMetadata = subMetadata;
	};

	sf.UtmParametersTracker.prototype = {
		startTracking: function(){
			this.handleUtmParamsTracking();
		},

		handleUtmParamsTracking: function(){
			var utmParamsObj = this.buildUtmParamsObject(this.obj);
			if(utmParamsObj !== null){
				this.sentenceClient.writeSentence({
					predicate: this.predicate,
					object: utmParamsObj,
					objectMetadata: this.objMetadata,
					subjectMetadata: this.subMetadata
				});
			}
		},

		buildUtmParamsObject: function(rawObj){
			if(rawObj.indexOf("utm_source") > -1 ||
				rawObj.indexOf("utm_medium") > -1 ||
				rawObj.indexOf("utm_term") > -1 ||
				rawObj.indexOf("utm_content") > -1 ||
				rawObj.indexOf("utm_campaign") > -1)
			{
				var qsParams = rawObj.slice(1).split('&');
				var utmParams = qsParams.filter(function(element){
					return element.indexOf("utm_source") > -1 ||
						element.indexOf("utm_medium") > -1 ||
						element.indexOf("utm_term") > -1 ||
						element.indexOf("utm_content") > -1 ||
						element.indexOf("utm_campaign") > -1;
				});

				var utmParamsObj = "?" + utmParams.join("&");
				return utmParamsObj;
			}
			return null;
		}
	};

})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.PersonalizationClient = function(apiServerUrl, subjectKey, apiKey, datasource, authToken, requester) {
		this.apiServerUrl = apiServerUrl;
		this.subjectKey = subjectKey;
		this.apiKey = apiKey;
		this.datasource = datasource;
		this.authToken = authToken;
		this.requester = requester;
	};

	sf.PersonalizationClient.prototype = {

		call: function(endpoint, headers, doneCallback, failCallback) {
			if (!this.authToken) {
				throw new Error('You must provide "authToken" when using the Personalization Client.');
			}
			if (!this.requester) {
				throw new Error('decRequester was not initialized.');
			}

			var url = this.apiServerUrl + endpoint;
			var options = sfDataIntell.utils.getRequestOptions(null, 'GET', url, headers);
			options.headers[sfDataIntell.constants.headers.authorization] = this.authToken;
			options.headers[sfDataIntell.constants.headers.datacenterkey] = this.apiKey;

			this.requester.ajaxCall(options, doneCallback, failCallback);
		},

		isInCampaigns: function(campaignIds, doneCallback, failCallback) {

			if (!campaignIds) {
				throw new Error('You must provide "campaignIds" argument when using the "isInCampaigns" method.');
			}

			var headers = {};
			headers[sfDataIntell.constants.headers.subject] = this.subjectKey;
			headers[sfDataIntell.constants.headers.ids] = campaignIds;
			headers[sfDataIntell.constants.headers.datasource] = this.datasource;

			this.call('/analytics/v1/campaigns/isin', headers, doneCallback, failCallback);
		},

		//TODO: this is obsolete since it was replaced within the V2 client
		isInLeads: function(scoringIds, contactsDetails, doneCallback, failCallback) {

			if (!scoringIds) {
				throw new Error('You must provide "scoringIds" argument when using the "isInLeads" method.');
			}

			if (!contactsDetails) {
				throw new Error('You must provide "contactsDetails" argument when using the "isInLeads" method.');
			}

			var headers = {};
			headers[sfDataIntell.constants.headers.contacts] = contactsDetails;
			headers[sfDataIntell.constants.headers.ids] = scoringIds;

			this.call('/analytics/v1/scorings/leads/in', headers, doneCallback, failCallback);
		},

		isInPersonas: function(scoringIds, doneCallback, failCallback, subjectKey) {

			subjectKey = subjectKey || this.subjectKey;

			var headers = {};
			headers[sfDataIntell.constants.headers.datasource] = this.datasource;
			headers[sfDataIntell.constants.headers.subject] = subjectKey;
			headers[sfDataIntell.constants.headers.ids] = scoringIds;

			this.call('/analytics/v1/scorings/personas/in', headers, doneCallback, failCallback);
		}
	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.PersonalizationClientV2 = function(apiServerUrl, subjectKey, apiKey, datasource, authToken, requester) {
		this.apiServerUrl = apiServerUrl;
		this.subjectKey = subjectKey;
		this.apiKey = apiKey;
		this.datasource = datasource;
		this.authToken = authToken;
		this.requester = requester;
	};

	sf.PersonalizationClientV2.prototype = {

		call: function(endpoint, headers, doneCallback, failCallback) {
			if (!this.authToken) {
				throw new Error('You must provide "authToken" when using the Personalization Client.');
			}
			if (!this.requester) {
				throw new Error('decRequester was not initialized.');
			}

			var url = this.apiServerUrl + endpoint;
			var options = sfDataIntell.utils.getRequestOptions(null, 'GET', url, headers);
			options.headers[sfDataIntell.constants.headers.authorization] = this.authToken;
			options.headers[sfDataIntell.constants.headers.datacenterkey] = this.apiKey;

			this.requester.ajaxCall(options, doneCallback, failCallback);
		},

		isInLeads: function(scoringIds, doneCallback, failCallback, subjectKey) {

			subjectKey = subjectKey || this.subjectKey;

			var headers = {};
			headers[sfDataIntell.constants.headers.datasource] = this.datasource;
			headers[sfDataIntell.constants.headers.subject] = subjectKey;
			headers[sfDataIntell.constants.headers.ids] = scoringIds;

			this.call('/analytics/v2/scorings/leads/in', headers, doneCallback, failCallback);
		}
	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.MappingsClient = function(context, sentenceClient) {
		this.apiServerUrl = context.apiServerUrl;
		this.subject = context.subject;
		this.apiKey = context.apiKey;
		this.datasource = context.datasource;

		this.sentenceClient = sentenceClient;
	};

	sf.MappingsClient.prototype = {

		addMapping: function(secondSubject, secondDataSource) {
			this.sentenceClient.writeSentence({
				mappedTo: [{
					"S": secondSubject,
					"DS": secondDataSource
				}]
			});
		}
	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.PageMetadataStore = function(){
		this.sizeLimiter = 1000;
		this.localStorageKey = "DecPageMetadata";
		this.indexer = [];
		this.valueContainer = [];
	};

	sf.PageMetadataStore.prototype = {

		addMetadata: function(pageUrl, metadata)
		{
			this.loadFromLocalStorage();

			if(this.indexer.length >= this.sizeLimiter)
			{
				this.indexer.shift();
				this.valueContainer.shift();
				this.saveToLocalStorage();
			}

			if(this.metadataForPageExists(pageUrl))
			{
				this.removeMetadata(pageUrl);
			}

			this.indexer.push(pageUrl);
			this.valueContainer.push(metadata);
			this.saveToLocalStorage();
		},

		getMetadata: function(pageUrl)
		{
			this.loadFromLocalStorage();
			var metadataIndex = this.indexer.indexOf(pageUrl);
			var metadata = this.valueContainer[metadataIndex];
			return metadata;
		},

		removeMetadata: function(pageUrl)
		{
			this.loadFromLocalStorage();
			var metadataIndex = this.indexer.indexOf(pageUrl);
			this.indexer.splice(metadataIndex, 1);
			this.valueContainer.splice(metadataIndex, 1);
			this.saveToLocalStorage();
		},

		metadataForPageExists: function(pageUrl)
		{
			this.loadFromLocalStorage();
			var index = this.indexer.indexOf(pageUrl);
			var exists = index>=0;
			return exists;
		},

		loadFromLocalStorage: function(){
			if (typeof(Storage) !== "undefined") {
				var pageMetadataContainersAsString = localStorage.getItem(this.localStorageKey);
				var pageMetadataContainers = JSON.parse(pageMetadataContainersAsString);
				if(pageMetadataContainers){
					this.indexer = pageMetadataContainers.indexer || [];
					this.valueContainer = pageMetadataContainers.valueContainer || [];
				} else {
					this.indexer = [];
					this.valueContainer = [];
				}
			} else {
				//do nothing
			}
		},

		saveToLocalStorage: function(){
			if (typeof(Storage) !== "undefined") {
				var pageMetadataContainers = {};
				pageMetadataContainers.indexer = this.indexer;
				pageMetadataContainers.valueContainer = this.valueContainer;

				localStorage.setItem(this.localStorageKey, JSON.stringify(pageMetadataContainers));
			} else {
				//do nothing
			}
		}
	};
})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.PageInfoProvider = function(){
	};

	sf.PageInfoProvider.prototype = {

		getCurrentPageUrl: function(){
			return location.href;
		},

		getCurrentPageReferrer: function(){
			return document.referrer;
		}
	};
})(sfDataIntell);