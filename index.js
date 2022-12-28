'use strict';

var Service;
var Characteristic;
var udp = require('./udp');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-lanbon', 'LanbonSwitch', LanbonSwitch);
};

function LanbonSwitch(log, config) {
    this.log = log;

    this.name            = config.name || 'LanbonSwitch';
    this.switchType      = config.switch_type || 3;           
    this.multiSwitch     = config.multi_switch || Array.from({length: this.switchType}, (_, i) => i + 1);
    this.deviceId        = config.device_id;
    this.host            = config.host;
    this.port            = 8866;
    this.state           = 0;

    if (this.switchType < 1 || this.switchType > 3)
        throw new Error('Unknown homebridge-lanbon switch type');
}

LanbonSwitch.COMMAND_MAP = {
    1: {
        0: ["a9", "00"],
        1: ["aa", "01"],
    },
    2: {
        0: ["ad", "00"],
        1: ["ae", "01"],
        2: ["af", "02"],
        3: ["a0", "03"],
    },
    3: {
        0: ["b7", "00"],
        1: ["a8", "01"],
        2: ["a9", "02"],
        3: ["aa", "03"],
        4: ["ab", "04"],
        5: ["ac", "05"],
        6: ["ad", "06"],
        7: ["ae", "07"],
    }
}

LanbonSwitch.prototype = {

    udpRequest: function(host, port, payload, callback) {
        this.log.info('host: ' + host);
        this.log.info('port: ' + port);
        this.log.info('payload: ' + payload);

        udp(host, port, payload, function (err) {
            callback(err);
        });
    },

    setPowerState: function(targetService, powerState, callback, context) {
        var funcContext = 'fromSetPowerState';

        // Callback safety
        if (context == funcContext) {
            if (callback) {
                callback();
            }

            return;
        }

        this.services.forEach(function (switchService, idx) {
            if (idx === 0) {
                // Don't check the informationService which is at idx=0
                return;
            }

            if (targetService.subtype === switchService.subtype) {
                const onState = 1 << (idx - 1)
                if(powerState)
                    this.state |= onState;
                else
                    this.state &= (1<<this.switchType) - 1 - onState

            } else {
                const onValue = (this.state >> (idx - 1)) % 2 == 1 ? true : false
                switchService.getCharacteristic(Characteristic.On).setValue(onValue, undefined, funcContext);
            }
    }.bind(this));
        const header = "aa21a010";
        const extra = "0021a0100000000000000000000000000000000000";
        let command = LanbonSwitch.COMMAND_MAP[this.switchType][this.state]
        let payload = header + command[0] + this.deviceId + this.switchType + command[1] + extra
        this.udpRequest(this.host, this.port, payload, function(error) {
            if (error) {
                this.log.error('setPowerState failed: ' + error.message);
                this.log('response: ' + response + '\nbody: ' + responseBody);
            
                callback(error);
            } else {
                this.log.info('==> ' + (this.state));
            }
            callback();
        }.bind(this));
    },

    identify: function (callback) {
        this.log('Identify me Senpai!');
        callback();
    },

    getServices: function () {
        this.services = [];

        var informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, 'LanbonSwitch')
            .setCharacteristic(Characteristic.Model, 'LanbonSwitch');
        this.services.push(informationService);

        this.log('(multiswitch)');

        for (var i = 0; i < this.switchType; i++) {
            var switchName = this.name + " " + this.multiSwitch[i];

            switch(i) {
                case 0:
                    this.log.warn('---+--- ' + switchName); break;
                default:
                    this.log.warn('   |--- ' + switchName);
            }

            var switchService = new Service.Switch(switchName, switchName);

            // Bind a copy of the setPowerState function that sets 'this' to the accessory and the first parameter
            // to the particular service that it is being called for. 
            var boundSetPowerState = this.setPowerState.bind(this, switchService);
            switchService
                .getCharacteristic(Characteristic.On)
                .on('set', boundSetPowerState);

            this.services.push(switchService);
        }

        return this.services;
    }
};
