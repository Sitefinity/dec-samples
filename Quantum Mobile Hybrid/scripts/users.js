var demoApplication = demoApplication || {};

demoApplication.users = (function(app) {
    var currentlyLoggedInUser = null;
    
    var knownUsers = [{
            id: 1,
            username: "joe@black.com",
            firstName: "Joe",
            lastName: "Black",
            email: "joe@black.com",
            phone: "8569-523-963",
            gender: "female",
            description: "UX Designer from London",
            imageUrl: "images/users/joeblack.png",
            subject: 533 // Business user
        }, {
            id: 2,
            username: "john@doe.com",
            firstName: "John",
            lastName: "Doe",
            email: "john@doe.com",
            phone: "5632-856-123",
            gender: "male",
            description: "no need of introduction",
            imageUrl: "images/users/anonymous.png",
            subject: 1320 // Gamer
        }
    ];    
    
    var getAllUsers = function() {
        var promise = new RSVP.Promise(function(resolve, reject) {
            resolve(knownUsers);
        });
        
        return promise;
    };
    
    var login = function(username) {
        var promise = new RSVP.Promise(function(resolve, reject) {
            var user;
            
            for (var i = 0; i < knownUsers.length; i++) {
                if (knownUsers[i].username === username) {
                    user = knownUsers[i];
                    break;
                }
            }
            
            if (user) {
                currentlyLoggedInUser = user;
                resolve(user);
            } else {
                var newUser = {
                    id: knownUsers.length,
                    username: username,
                    firstName: "Not specified",
                    lastName: "Not specified",
                    email: username,
                    phone: "Not specified",
                    description: "Not specified",
                    imageUrl: "images/users/anonymous.png"
                }
                
                currentlyLoggedInUser = newUser;
                knownUsers.push(newUser);
                resolve(newUser);
            }
        });
        
        return promise;
    };
    
    var logout = function() {
        var promise = new RSVP.Promise(function(resolve, reject) {
            currentlyLoggedInUser = null;
            resolve();
        });
        
        return promise;
    };
   
    return {
        getAll: getAllUsers,
        login: login,
        logout: logout,
        getLoggedInUser: function() {
            return currentlyLoggedInUser || knownUsers[0];
        }
    };
})(demoApplication)