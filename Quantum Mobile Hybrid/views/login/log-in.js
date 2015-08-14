var demoApplication = demoApplication || {};

demoApplication.login = (function(app) {
    var viewModel = kendo.observable({
                                         user: {}
                                     });
    
    var init = function(e) {
        kendo.bind(e.view.element, viewModel);
        
        app.users.getAll().then(function(userList) {
            var defaultUser = userList[0];
            defaultUser.password = "****";
            viewModel.set("user", defaultUser);  
        });
        
    };
    
    return {
        init: init,
        submit: function() {
            app.mobileApp.pane.loader.show();
            var username = viewModel.user.username;
            
            var loggedInUser;
            app.users.login(username).then(function(user) {
                loggedInUser = user;
                return app.tracking.initialize(loggedInUser.subject);
            })
            .then(function() {
                return new RSVP.Promise(function(resolve, reject) {
                    app.tracking.getClient().personalizationClient.isInPersonas([1,2,3,4], 
                                                                         function(personaResponse) {
                                                                             loggedInUser.personas = personaResponse.items;
                                                                             resolve();
                                                                         }, function(reason) {
                                                                             if(reason.status === 401){
                                                                                 alert("This application is not property authenticated. Are your apiKey and authToken tokens set correctly? You could find those tokens in the scripts/tracking.js file. Please close the emulator and resolve the issue.");                                                                                 
                                                                                 reject();
                                                                             }
                        													else{
                                                                                alert("Persona was not successfully resolved. This means that no personalization will happen. Please try again later.");
                                                                                resolve();
                                                                            }
                                                                         });
                });
            })
            .then(function() {
                return app.tracking.trackLogin(loggedInUser);
            })
            .then(function() {
                app.mobileApp.navigate("views/posts/list-posts.html");
                app.mobileApp.pane.loader.hide();
            });
        }
    };
})(demoApplication)
