var demoApplication = demoApplication || {};

demoApplication.personalizationProvider = (function(app) {
    var defaultBanner = {
        name: "default-banner",
        isPersonalizationBanner: true,
        imageUrl: "images/banners/project-management-banner.png",
        personalMessage: "DO YOU HAVE THE RIGHT STRATEGY FOR YOUR BUSINESS?",
        phoneNumber: false
    };
    
    var businessUserBanner = {
        name: "business-banner",
        isPersonalizationBanner: true,
        imageUrl: "images/banners/project-management-banner.png",
        personalMessage: "RELIABLE AND LIGHTWEIGHT - GRAVITON FOR YOUR BUSINESS NEEDS",
        phoneNumber: "+1 855 QUANTUM"
    };
    
     var gamerBanner = {
        name: "gamer-banner",
        isPersonalizationBanner: true,
        imageUrl: "images/banners/project-management-banner.png",
        personalMessage: "GAMERS LOVE MAGNON'S BIG 1080p-RESOLUTION SCREEN",
        phoneNumber: "+1 855 QUANTUM"
    };
    
    var getPersonalizationBanner = function() {
        var user = app.users.getLoggedInUser();
        
        if (!user.personas || !user.personas.length) {
            return defaultBanner;
        }
        
        var persona;
        for(var i = 0; i < user.personas.length; i++){
            if(user.personas[i].Score >= user.personas[i].Threshold){
                persona = user.personas[i];
                break;
            }
        }
        
        if (persona && persona.Id == 1) {
            return businessUserBanner;
        } else if (persona && persona.Id == 3) {
            return gamerBanner;  
        } else {
            return defaultBanner;
        }
    }
    
    return {
        getPersonalizationBanner: getPersonalizationBanner
    };
})(demoApplication)