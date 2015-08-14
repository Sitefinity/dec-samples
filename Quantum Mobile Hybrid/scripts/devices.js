var demoApplication = demoApplication || {};

demoApplication.devices = (function(app) {
    var devices = [{
            id: 1,
            name: "Axion",
            deviceId: "2483-3233-6902-3422",
            imageUrl : "images/devices/axion.png",
            details: {},
            updates: [{
                        title: "Quantum brings the power of touch to businesses with the new tablet 'Axion'",
                        seen: false
                    }]        
        },{
            id: 2,
            name: "Graviton",
            deviceId: "2483-3233-6902-3422",
            imageUrl : "images/devices/graviton.png",
            details: {},
            updates: [{
                        title: "Quantum launches new business notebook 'Gluon'",
                        seen: false
                    }]
        }
    ];

    var getAllDevices = function() {
        var promise = new RSVP.Promise(function(resolve, reject) {
            resolve(devices);
        });
        
        return promise;
    };
    
    var getDeviceById = function(deviceId) {
        var device;
        
        var promise = new RSVP.Promise(function(resolve, reject) {
            for (var i = 0; i < devices.length; i++) {
                if (devices[i].id == deviceId) {
                    device = devices[i];
                    break;
                }
            }
            
            if (device) {
                resolve(device);
            } else {
                reject({error: "No such device"});
            }
        });
        
        return promise;
    };
    
    var countDevicesUpdates = function() {
        var promise = new RSVP.Promise(function(resolve, reject) {
            var newUpdatesCount = 0;
            for (var i = 0; i < devices.length; i++) {
                for (var j = 0; j < devices[i].updates.length; j++) {
                    if (devices[i].updates[j].seen === false) {
                        newUpdatesCount++;
                    }
                }
            }
            
            resolve(newUpdatesCount);
        });
        
        return promise;
    };
    
    var markUpdatesSeen = function(deviceId) {
        return getDeviceById(deviceId).then(function(device) {
            for (var i = 0; i < device.updates.length; i++) {
                device.updates[i].seen = true;
            }
        });
    };
    
    return {
        getAll: getAllDevices,
        getById: getDeviceById,
        getNewUpdatesCount: countDevicesUpdates,
        markUpdatesSeen: markUpdatesSeen
    };
})(demoApplication)