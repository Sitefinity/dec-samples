var demoApplication = demoApplication || {};

demoApplication.tracking = (function(app) {
    var client = null;
    
    var initialize = function(subjectKey) {
        var promise = new RSVP.Promise(function(resolve, reject) {
            var options = {
                apiServerUrl: "https://api.dec.sitefinity.com",
                source: "QuantumDecDemo",
                subjectKey: subjectKey,
                authToken: "appauth <please paste the apiKey of you datacenter here>",
                apiKey: "<please paste the apiKey of you datacenter here>",
                autoTracking: true
            };
            client = new sfDataIntell.Client(options);
            
            resolve(client);
        });
        
        return promise;
    };
    
    var getClient = function() {
        return client;
    }
    
    var predicates = {
        logIn: "Login",
        logout: "Logout",
        open: "Open",        
        call: "Call",
        share: "Share",
        commentOn: "Comment on", 
        viewComments: "View comments",
        like: "Like",
        doNotLike: "Do not like",
        search: "Search"
    }
    
    var writeSentence = function(predicate, object, objectMetadata, subjectMetadata){
        if(!client){
            throw new Error("Tracking not initialzed");
        }
        
         var sentence = {
            predicate: predicate,
            object: object,
        };
        
        if(objectMetadata){
            sentence.objectMetadata = objectMetadata;
        }
        
        if(subjectMetadata){
            sentence.subjectMetadata = subjectMetadata;
        }
        
        client.sentenceClient.writeSentence(sentence); 
    }
    
    var trackPageOpen = function(pageName, pageMetadata) {
        if (client) {
            var visitSentene = {
                predicate: predicates.open,
                object: pageName,
            };
            
            if (pageMetadata) {
                visitSentene.objectMetadata = pageMetadata;
            }
            
            client.sentenceClient.writeSentence(visitSentene);
        }
    };
    
    var trackLogin = function(loggedInUser) {
        if(!client){
            throw new Error("Tracking not initialzed");
        }
        
        var loginSentnece = {
            predicate: predicates.logIn,
            object: "hybrid-demo-application",
            subjectMetadata: [{
                        "K": "Email", 
                        "V": loggedInUser.email
                    },{
                        "K": "FirstName", 
                        "V": loggedInUser.firstName
                    }, {
                        "K": "LastName",
                        "V": loggedInUser.lastName
                    }, {
                        "K": "Phone",
                        "V": loggedInUser.phone
                    }, {
                        "K": "Gender", 
                        "V": loggedInUser.gender
                    }
            ]
        };
            
        client.sentenceClient.writeSentence(loginSentnece);
    }
    
    var forceFlushData = function(){
        if(client){
            client.flushData(client);
        }
    };
    
    return {
        initialize: initialize,
        trackPageOpen: trackPageOpen,
        getClient: getClient,
        trackLogin: trackLogin,
        forceFlushData: forceFlushData,
        writeSentence: writeSentence,
        predicates: predicates            
        
    };
})(demoApplication)