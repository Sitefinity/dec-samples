var demoApplication = demoApplication || {};

demoApplication.devicePage = (function(app) {
    var initialzeUpdatesDataSource = function(deviceId) {
        var updatesDataSource = new kendo.data.DataSource({
            transport: {
                read: function(options) {
                    app.devices.getById(deviceId).then(function(device) {
                        options.success(device.updates);
                    });
                }
            }
        });
        
        return updatesDataSource;
    };

    var maintainDeviceUpdatesBadge = function() {
        return app.devices.getNewUpdatesCount().then(function(newUpdatesCount) {
            var tabstrip = app.mobileApp.view().footer.find(".navigation-container-tabstrip").data("kendoMobileTabStrip")
            if (newUpdatesCount !== 0) {
                tabstrip.badge("a:nth-child(2)", newUpdatesCount);
            } else {
                $(tabstrip.wrapper).find(".km-badge").hide()
                tabstrip.badge("a:nth-child(2)", 0);
            }
        });
    };
    
    var viewModel = kendo.observable({
                                         isUpdatesVisible: true,
                                         isDetailsVisible: false,
                                         showUpdates: function() {
                                             this.set("isUpdatesVisible", true);
                                             this.set("isDetailsVisible", false);
                                         },
                                         showDetails: function() {
                                             this.set("isUpdatesVisible", false);
                                             this.set("isDetailsVisible", true);
                                         }
                                     });
    
    var init = function(e) {
        kendo.bind(e.view.element, viewModel);
        
        var deviceId = e.view.params.deviceId;
        app.devices.getById(deviceId).then(function(device) {
            app.tracking.trackPageOpen(device.name + " updates");
            viewModel.set("device", device);
        });
        
        var updatesDataSource = initialzeUpdatesDataSource(deviceId);
        viewModel.set("allUpdates", updatesDataSource);
        viewModel.set("deviceId", deviceId);
        
        app.listDevices.refreshDeviceUpdates(deviceId, []);
    };
    
    var hide = function(e) {
        var deviceId = viewModel.get("deviceId");
        app.devices.markUpdatesSeen(deviceId).then(function() {
            app.devicePage.maintainDeviceUpdatesBadge();    
        });
    };
    
    return {
        init: init,
        hide: hide,
        maintainDeviceUpdatesBadge: maintainDeviceUpdatesBadge
    };
})(demoApplication)