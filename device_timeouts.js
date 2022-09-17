
// simple plug-n-play script to enable timeout-aware relay channels feature

var vdev = 'auto_appliances';

var appliance_map = {
	bathroom_drier: {  // change to any name you like
		device: 'wb-mr6_12/K2', // change to your actual switch path
		timeout: 3 * 3600 // change to your own value
	},
	bathroom_vent: {
		device: 'wb-mr6_23/K4',
		timeout: 3600
	},
	toilet_vent: {
		device: 'wb-mr6_45/K6',
		timeout: 3600
	},

}

// actual code

defineVirtualDevice(vdev, {title: 'Appliance Automations', cells: {}});
var vd = getDevice(vdev);

Object.keys(appliance_map).forEach(function(device) {

// create vdev controls
vd.addControl(device, { type: "switch", value: false });
vd.addControl(device + '_countdown', { type: "value", value: 0 });

	// rule for arming countdown
	defineRule({
		whenChanged: appliance_map[device].device,
		then: function (newValue, devName, cellName) {
			if (newValue === true) {
				dev[vdev][device] = true;
				dev[vdev][device + '_countdown'] = appliance_map[device].timeout;
			} else {
				dev[vdev][device] = false;
				dev[vdev][device + '_countdown'] = 0;
			}
		}
	});

	// rule for timeout processing
	defineRule({
		whenChanged: vdev + '/' + device + '_countdown',
		then: function (newValue, devName, cellName) {
			if (newValue === 0) {
				dev[appliance_map[device].device] = false;
			}
		}
	});

});

// countdown-related routines

function endsWith(str, suffix) {
	return str.slice(-suffix.length) === suffix
}

function _run_countdown_loop() {
	Object.keys(appliance_map).forEach(function(device) {
		value = dev[vdev][device + '_countdown'];
		if (value > 0) {
			dev[vdev][device + '_countdown'] = value - 1;
		}
	});
	setTimeout(function () {
		_run_countdown_loop()
	}, 1000);
}

setTimeout(function () {
	_run_countdown_loop();
}, 1000);
