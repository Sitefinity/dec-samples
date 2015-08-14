spec(function(){
    
    var configuration = {
        ios_url: "Quantum_Mobile_Hybrid",
        androidPackage: "com.telerik.QuantumMobileHybrid"
    };
    
    var queries = {      
        submitBtn: {id: "login-btn"},
        personalizationBanner: {className: "dec-banner"},
        usernameInput: {id: "username-input"}
    };

    var stepRepository = {
        "launch application": {
           'android': [
                android.launch(configuration.androidPackage),
               	android.wait(8000)
            ]
        },
                
        "tap log-in button": {
            'default': [
                web.tap(queries.submitBtn),
                web.wait(8000)
            ]
        },
        
        "use random credentials": {
             'default': [
                web.setValue(queries.usernameInput, "some.guy"),
            ]
        },
        
        "Then the BUSINESS USER personalization banner must appear": {
            'default': [
                web.getHtml(queries.personalizationBanner, function(result){
                    assert(result.trim()).contains('<h3>MANAGE YOUR PROJECTS FROM BEGINNING TO END</h3>');
                })
            ]
        },
        
        "Then the DEFAULT personalization banner must appear": {
            'default': [
                web.getHtml(queries.personalizationBanner, function(result){
                    assert(result.trim()).contains('<h3>DO YOU HAVE THE RIGHT STRATEGY FOR YOUR BUSINESS?</h3>');
                })
            ]
        }
    };

    describe("Correct personalization banner is displayed afer a user has logged in (assuring perosnalization is working)", function(){
        test("Launch, Log in with the default prepopulated user and check business user banner is displayed", function(){
            step("launch application");
            step("tap log-in button");
            
            step("Then the BUSINESS USER personalization banner must appear");
        });
        
        test("Launch, Log in as random user and check that the default banner is displayed", function(){
             step("launch application");
             step("use random credentials");
             step("tap log-in button");
            
             step("Then the DEFAULT personalization banner must appear");
        }); 
    }, stepRepository);
});