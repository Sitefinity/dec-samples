var demoApplication = demoApplication || {};

demoApplication.listDevices = (function(app) {
    var viewModel = kendo.observable({});
    
    var devicesDataSource = new kendo.data.DataSource({
        transport: {
            read: function(options) {
                app.devices.getAll().then(function(deviceList) {
                    options.success(deviceList);
                });
            }
        }
    });
    
    var init = function(e) {
        app.tracking.trackPageOpen("all devices");
        kendo.bind(e.view.element, viewModel);
    };
    
    var refreshDeviceUpdates = function(deviceId, updates){
        var allDevices = devicesDataSource.data();
        
        for (var i = 0; i < allDevices.length; i++) {
            if (allDevices[i].id == deviceId) {
                allDevices[i].set("updates", updates);
            }
        }
    };
    
    return {
        init: init,
        allDevices: devicesDataSource,
        refreshDeviceUpdates: refreshDeviceUpdates
    };
})(demoApplication)