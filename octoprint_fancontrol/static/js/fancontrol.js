$(function() {
    function fanControlViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0]
        self.loginState = parameters[1];
        self.settings = undefined;
        self.hasGPIO = ko.observable(undefined);
        self.isfanOn = ko.observable(undefined);
        self.fan_indicator = $("#fancontrol_indicator");

        self.onBeforeBinding = function() {
            self.settings = self.settingsViewModel.settings;
        };

        self.onStartup = function () {
            self.isfanOn.subscribe(function() {
                if (self.isfanOn()) {
                    self.fan_indicator.removeClass("off").addClass("on");
                } else {
                    self.fan_indicator.removeClass("on").addClass("off");
                }   
            });
            
            $.ajax({
                url: API_BASEURL + "plugin/fancontrol",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "getfanState"
                }),
                contentType: "application/json; charset=UTF-8"
            }).done(function(data) {
                self.isfanOn(data.isfanOn);
            });
        }

        self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != "fancontrol") {
                return;
            }

            self.hasGPIO(data.hasGPIO);
            self.isfanOn(data.isfanOn);
        };

        self.togglefan = function() {
            if (self.isfanOn()) {
                if (self.settings.plugins.fancontrol.enablePowerOffWarningDialog()) {
                    showConfirmationDialog({
                        message: "You are about to turn off the fan.",
                        onproceed: function() {
                            self.turnfanOff();
                        }
                    });
                } else {
                    self.turnfanOff();
                }
            } else {
                self.turnfanOn();
            }
        };

        self.turnfanOn = function() {
            $.ajax({
                url: API_BASEURL + "plugin/fancontrol",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "turnfanOn"
                }),
                contentType: "application/json; charset=UTF-8"
            })
        };

    	self.turnfanOff = function() {
            $.ajax({
                url: API_BASEURL + "plugin/fancontrol",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "turnfanOff"
                }),
                contentType: "application/json; charset=UTF-8"
            })
        };   
    }

    ADDITIONAL_VIEWMODELS.push([
        fanControlViewModel,
        ["settingsViewModel", "loginStateViewModel"],
        ["#navbar_plugin_fancontrol", "#settings_plugin_fancontrol"]
    ]);
});
