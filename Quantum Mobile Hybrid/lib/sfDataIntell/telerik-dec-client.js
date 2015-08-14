var sfDataIntell = sfDataIntell || {};

sfDataIntell.constants = {
    endpoints: {
        apiServer: "https://api.dec.sitefinity.com"
    },
    headers: {
        authorization: "Authorization",
        datacenterkey: "x-dataintelligence-datacenterkey",
        subject: "x-dataintelligence-subject",
        ids: "x-dataintelligence-ids",
        datasource: "x-dataintelligence-datasource",
        contacts: "x-dataintelligence-contacts"
    }
};
var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.Client = function(options) {
        var that = this;
		options = options || {};

		if(!options.apiKey)	{
			throw new Error('You must provide the ApiKey for the Data Center.');
		}

		if(!options.source) {
			throw new Error('You must provide the source name of the client.');
		}

        this.isLocalStorageSupported = this.isLocalStorageSupported();
		var subjectCookieName = options.subjectCookieName || 'sf-data-intell-subject';
		var subjectKey = options.subjectKey || this.readCookie(subjectCookieName);
		if(subjectKey === null || subjectKey === "") {
			subjectKey = this.generateSubjectKey();
			this.setCookie(subjectCookieName, subjectKey, 365, options.trackingCookieDomain);

			if(window.detect) {
				var parsedUA = this.getParseUserAgent();
				var browserLanguage = this.getBrowserLanguage();
				this.subjectMetadataClient = new sf.SubjectMetadataClient(subjectKey, this.isLocalStorageSupported);
				var metadataArray = 
					[{
						'K': 'Browser',
						'V': parsedUA.browser.family
					},

					{
						'K': 'Browser version',
						'V': parsedUA.browser.version
					},

					{
						'K': 'Browser language',
						'V': browserLanguage
					},

					{
						'K': 'Device',
						'V': parsedUA.device.family
					},

					{
						'K': 'Device type',
						'V': parsedUA.device.type
					}];

				if(parsedUA.device.manufacturer !== null && parsedUA.device.manufacturer !== "")
				{
					metadataArray.push({
						'K': 'Device manufacturer',
						'V': parsedUA.device.manufacturer 
					});
				}

				this.subjectMetadataClient.writeSubjectMetadata(metadataArray);
			}
		}

        if (typeof options.autoTracking === 'boolean') {
            this.autoTracking = options.autoTracking;
        } else {
            this.autoTracking = true;
        }

		this.apiKey = options.apiKey;
		this.source = options.source;
		this.authToken = options.authToken;
		this.apiServerUrl = options.apiServerUrl || sfDataIntell.constants.endpoints.apiServer;
		this.sentenceClient = new sf.SentenceClient(subjectKey, this.isLocalStorageSupported);
		this.subjectMetadataClient = new sf.SubjectMetadataClient(subjectKey, this.isLocalStorageSupported);
        this.personalizationClient = new sf.PersonalizationClient(this.apiServerUrl, subjectKey, this.apiKey, this.source, this.authToken);
        this.mappingsClient = new sf.MappingsClient(this.apiServerUrl, subjectKey, this.apiKey, this.source);

		if(options.instrument){
			this.instrumenter = new sf.HtmlInstrumenter(this.sentenceClient);
			this.instrumenter.startTracking();
		}

		if(options.trackPageVisits){
			this.pageVisitsTracker = new sf.PageVisitsTracker(this.sentenceClient, options.trackPageVisits.predicate, options.trackPageVisits.obj, options.trackPageVisits.objMetadata);
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

		if(options.trackReferrer){
			this.referrerTracker = new sf.ReferrerTracker(this.sentenceClient, options.trackReferrer.predicate, options.trackReferrer.obj, options.trackReferrer.objMetadata);
			this.referrerTracker.startTracking();
		}

        if (this.autoTracking) {
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

		setCookie: function (cname, cvalue, exdays, cdomain) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			var expires = "expires=" + d.toGMTString();
			var cookie = cname + "=" + cvalue + ";path=/; " + expires;
			if(cdomain) {
			    cookie += ";domain=" + cdomain;
			}
			document.cookie = cookie;
		},

		readCookie: function(name) {
			var nameEQ = name + "=";
			var ca = window.document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i].trim();
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		},

		flushData: function(context){
	        var sentencesJsonData;
	        var subjectMetaJsonData;

	        if (context.isLocalStorageSupported) {
	            if (localStorage.sentences) {
	                sentencesJsonData = JSON.parse(localStorage.sentences);
	                context.flushSentences(context, sentencesJsonData);
	                localStorage.sentences = '';
	            }

	            if(localStorage.subjectMetadata){
	                subjectMetaJsonData = JSON.parse(localStorage.subjectMetadata);
	                context.flushSubjectMetadata(context, subjectMetaJsonData);
	                localStorage.subjectMetadata = '';
	            }
	        }
	        else {
	            if (window.tempStorage.sentences) {
	                sentencesJsonData = JSON.parse(window.tempStorage.sentences);
	                context.flushSentences(context, sentencesJsonData);
	                window.tempStorage.sentences = '';
	            }

	            if(window.tempStorage.subjectMetadata){
	                subjectMetaJsonData = JSON.parse(window.tempStorage.subjectMetadata);
	                context.flushSubjectMetadata(context, subjectMetaJsonData);
	                window.tempStorage.subjectMetadata = '';
	            }
	        }
		},

	    flushSentences: function(context, sentencesJsonData) {
	        if(sentencesJsonData.length == 1){
	            sentencesJsonData = sentencesJsonData[0];
	        }
	        $.ajax({
	            url: context.apiServerUrl + '/collect/v1/data-centers/' + context.apiKey +  '/sentences/datasource/' + context.source,
	            type: 'POST',
	            contentType: 'application/json',
	            dataType: 'json',
	            data: JSON.stringify(sentencesJsonData)
	        });
	    },

	    flushSubjectMetadata: function(context, subjectMetaJsonData) {
	        if(subjectMetaJsonData.length == 1){
	            subjectMetaJsonData = subjectMetaJsonData[0];
	        }
	        $.ajax({
	            url: context.apiServerUrl + '/collect/v1/data-centers/' + context.apiKey +  '/metadata/subjects/datasource/' + context.source,
	            type: 'POST',
	            contentType: 'application/json',
	            dataType: 'json',
	            data: JSON.stringify(subjectMetaJsonData)
	        });
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

(function(sf) {

	sf.decisionTreeClient = {

	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.HtmlInstrumenter = function(sentenceClient) {
		
		this.sentenceClient = sentenceClient;
				
	};

	sf.HtmlInstrumenter.prototype = {
		startTracking: function(){
			var that = this;
			$('[sfdi-trigger]').each(function(index){
				var $element = $(this),
				eventName = $element.attr('sfdi-trigger'),
				predicate = $element.attr('sfdi-predicate'),
				object = $element.attr('sfdi-object'),
				objectMetadata = $element.attr('sfdi-obj-metadata'),
				subjectMetadata = $element.attr('sfdi-sub-metadata');

				objectMetadata = that.buildMetadataArray(objectMetadata);
				subjectMetadata = that.buildMetadataArray(subjectMetadata);
				
				$element.on(eventName, function() {                    			
					that.sentenceClient.writeSentence({
						predicate: predicate,
						object: object,
						objectMetadata: objectMetadata,
						subjectMetadata: subjectMetadata
					});
				});
			});	
		},

		buildMetadataArray: function(metadata){
			if(metadata){
				metadata = JSON.parse(metadata.replace(new RegExp("\\\\","gm"),"").replace(new RegExp("\'","gm"),"\""));
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

            if (!sentence.predicate) {
                throw new Error('You must provide "sentence.predicate" argument when writing a sentence.');
            }

            if (!sentence.object) {
                throw new Error('You must provide "sentence.object" argument when writing a sentence.');
            }

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

            storedSentences.push({
                S: this.subjectKey,
                P: sentence.predicate,
                O: sentence.object,
                SM: sentence.subjectMetadata,
                OM: sentence.objectMetadata
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

	sf.subjectMappingClient = {

	};

})(sfDataIntell);

var sfDataIntell = sfDataIntell || {};

(function(sf) {

    sf.PageVisitsTracker = function(sentenceClient, predicate, obj, objMetadata) {
        this.sentenceClient = sentenceClient;
        this.predicate = predicate || "Visit";
        this.obj = obj || location.href;
        this.objMetadata = objMetadata || [
            {
                'K': 'PageTitle',
                'V': document.title
            }
        ];
    };

    sf.PageVisitsTracker.prototype = {
        startTracking: function(){
            var that = this;
            $(document).ready(function(){
                that.sentenceClient.writeSentence({
                    predicate: that.predicate,
                    object: that.obj,
                    objectMetadata: that.objMetadata
                });
            });
        }
    };

})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.SubjectMetadataClient = function(subjectKey, isLocalStorageSupported){
		this.subjectKey = subjectKey;
        this.isLocalStorageSupported = isLocalStorageSupported;
	};

	sf.SubjectMetadataClient.prototype = {

		writeSubjectMetadata: function(metadata) {

            if (!metadata) {
                throw new Error('You must provide "metadata" argument when writing subject metadata.');
            }

            var storedSubjectMetadata;
            if (this.isLocalStorageSupported) {
                if (!localStorage.subjectMetadata) {
                    storedSubjectMetadata = [];
                }
                else {
                    storedSubjectMetadata = JSON.parse(localStorage.subjectMetadata);
                }
            }
            else {
                if (!window.tempStorage.subjectMetadata) {
                    storedSubjectMetadata = [];
                }
                else {
                    storedSubjectMetadata = JSON.parse(window.tempStorage.subjectMetadata);
                }
            }

            storedSubjectMetadata.push({
                S: this.subjectKey,
                M: metadata
            });

            if (this.isLocalStorageSupported) {
                localStorage.subjectMetadata = JSON.stringify(storedSubjectMetadata);
            }
            else {
                window.tempStorage.subjectMetadata = JSON.stringify(storedSubjectMetadata);
            }
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
			var that = this;
			$(document).ready(function(){					
					that.handleUtmParamsTracking.call(that);
			});
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

	sf.ReferrerTracker = function(sentenceClient, predicate, obj, objMetadata) {
		this.sentenceClient = sentenceClient;
		this.predicate = predicate || "Come from site";
		this.obj = obj || document.referrer;
		this.objMetadata = objMetadata;
	};

	sf.ReferrerTracker.prototype = {
		startTracking: function(){
			var that = this;
			$(document).ready(function(){
				that.handleTracking.call(that, location.hostname);
			});
		},

		handleTracking: function(currentHostname){
			if(this.obj && this.parseURL(this.obj).hostname !== currentHostname)
			{
				this.sentenceClient.writeSentence({
					predicate: this.predicate,
					object: this.obj,
					objMetadata: this.objMetadata
				});
			}
		},

		parseURL: function(url) {
			var a =  document.createElement('a');
			a.href = url;
			return {
				source: url,
				hostname: a.hostname
			};
		}
	};

})(sfDataIntell);
var sfDataIntell = sfDataIntell || {};

(function(sf) {

	sf.PersonalizationClient = function(apiServerUrl, subjectKey, apiKey, datasource, authToken) {
        this.apiServerUrl = apiServerUrl;
		this.subjectKey = subjectKey;
        this.apiKey = apiKey;
        this.datasource = datasource;
        this.authToken = authToken;
	};

	sf.PersonalizationClient.prototype = {

        call: function(endpoint, headers, doneCallback, failCallback) {

            if (!this.authToken) {
                throw new Error('You must provide "authToken" when using the Personalization Client.');
            }

            var options = {
                url: this.apiServerUrl + endpoint,
                type: 'GET',
                headers: headers || {},
                contentType: 'application/json'
            };

            options.headers[sfDataIntell.constants.headers.authorization] = this.authToken;
            options.headers[sfDataIntell.constants.headers.datacenterkey] = this.apiKey;

            if (doneCallback) options.success = doneCallback;
            if (failCallback) options.error = failCallback;

            jQuery.ajax(options);
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

            if (!scoringIds) {
                throw new Error('You must provide "scoringIds" argument when using the "isInCampaigns" method.');
            }

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

	sf.MappingsClient = function(apiServerUrl, subject, apiKey, datasource) {
        this.apiServerUrl = apiServerUrl;
		this.subject = subject;
        this.apiKey = apiKey;
        this.datasource = datasource;
	};

	sf.MappingsClient.prototype = {

        call: function(endpoint, data, doneCallback, failCallback) {

            var options = {
                url: this.apiServerUrl + endpoint,
                type: 'POST',
                contentType: 'application/json'
            };

            if (data) {
                options.data = JSON.stringify(data);
                options.dataType = 'json';
            }

            if (doneCallback) options.success = doneCallback;
            if (failCallback) options.error = failCallback;

            jQuery.ajax(options);
        },

        newMappingWithCurrent : function(secondSubject, secondDataSource, doneCallback, failCallback) {

            if (!secondSubject) {
                throw new Error('You must provide "secondSubject" argument when using the "newMappingWithCurrent" method.');
            }

            if (!secondDataSource) {
                throw new Error('You must provide "secondDataSource" argument when using the "newMappingWithCurrent" method.');
            }

            var mappingJsonData = {
                "S1": this.subject,
                "D1": this.datasource,
                "S2": secondSubject,
                "D2": secondDataSource
            };
            var endpoint = '/collect/v1/data-centers/'+ this.apiKey + '/mappings';

            this.call(endpoint, mappingJsonData, doneCallback, failCallback);
        }
	};

})(sfDataIntell);
