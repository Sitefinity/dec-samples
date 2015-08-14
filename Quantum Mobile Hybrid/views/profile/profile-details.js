var demoApplication = demoApplication || {};

demoApplication.profileDetails = (function(app) {
    var viewModel = kendo.observable({ 
                                         user: {}
                                     });
    
    var init = function(e) {
        app.tracking.trackPageOpen("user profile");
        kendo.bind(e.view.element, viewModel);
        
        var currentUser = app.users.getLoggedInUser();
        currentUser.fullName = currentUser.firstName + " " + currentUser.lastName;
        viewModel.set("user", currentUser);  
    };
    
    var logout = function() {
        app.users.logout().then(function() {
            app.listPosts.signalDataReloadNeeded();
            app.tracking.writeSentence(app.tracking.predicates.logout, "hybrid-demo-application");
            app.mobileApp.navigate("views/login/log-in.html");
        });
    };
    
    return {
        init: init,
        logout: logout
    };
})(demoApplication)