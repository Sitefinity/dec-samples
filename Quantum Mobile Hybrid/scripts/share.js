var demoApplication = demoApplication || {};

demoApplication.share = (function(app) {
    var shareContent = null;
    var shown = false;
    
    function showMenu() {
        shown = true;   
        app.mobileApp.view().footer.find(".share-form").show();
        app.mobileApp.view().footer.find(".navigation-container-tabstrip").hide();
    };
    
    function hideMenu() {
        shown = false;
        app.mobileApp.view().footer.find(".share-form").hide();
        app.mobileApp.view().footer.find(".navigation-container-tabstrip").show();
    }
    
    function toggleMenuVisibility() {
        if (shown) {
            hideMenu();
        } else {
            showMenu();
        }
    }
    
    function cancel() {
        hideMenu(); 
        clearShareContent();
    };
    
    function setShareContent(content) {
        shareContent = content;
    };
    
    function clearShareContent() {
        shareContent = null;    
    };
    
    function mockedShareCall() {
        app.mobileApp.pane.loader.show();
            
        var timer = setInterval(function() {
            app.mobileApp.pane.loader.hide();
            clearInterval(timer);
                
            hideMenu();
            if (shareContent && shareContent.success) {
                shareContent.success(shareContent);
            }
        }, 1000);
    }
    
    return {
        toggleMenuVisibility: toggleMenuVisibility,
        cancel: cancel,
        setShareContent: setShareContent,
        clearShareContent: clearShareContent,
        shareToFacebook: mockedShareCall,
        tweet: mockedShareCall,
        copyShareUrl: mockedShareCall        
    };
})(demoApplication)