(function() {
    var app = {};
    window.demoApplication = app;
    
    var bootstrap = function() {
        $(function() {
            app.mobileApp = new kendo.mobile.Application(document.body, {
                                                             skin: 'flat',
                                                             initial: 'views/login/log-in.html',
                                                             statusBarStyle: 'black-translucent'
                                                         });
            
            RSVP.on('error', function(reason) {
                console.assert(false, reason);
                //alert(reason);
            });
        });
    };

    if (window.cordova) {
        document.addEventListener('deviceready', function() {
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            bootstrap();
        }, false);
        
        // http://www.telerik.com/blogs/phonegap-apache-cordova-lifecycle-events
        document.addEventListener("pause", function() {
            if(demoApplication.tracking){
                demoApplication.tracking.forceFlushData();
            }
        });
    } else {
        bootstrap();
    }

    app.isOnline = function() {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };
    
    app.navigationHelper = {
        goBack: function() {
            app.mobileApp.navigate("#:back");
        }
    };
    
    app.isEmulated = (window.navigator.simulator === true);
}());