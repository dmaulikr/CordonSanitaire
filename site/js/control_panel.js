var settings = new Settings();

function Settings(){
    this.duration = 120;
    this.distance = 20;
    this.color_infectious = '#ff5555';
    this.color_healed = '#55ffb9';
    this.color_active = '#fff341';
    this.color_passive = '#ffffff';
    this.color_casualty = '#ffa352';
    this.chat = false;
    this.gmaps = false;

    this.start = function(){
        startTheClock();
    };

    this.stop = function(){
        stopTheClock();
    };

    this.refresh = function(){
        resetTheClock();
    };
};

var gui = new dat.GUI();

var f0 = gui.addFolder('controls');
f0.add(settings, 'start');
f0.add(settings, 'stop');
f0.add(settings, 'refresh');
f0.closed = false;

var f1 = gui.addFolder('settings');
var duration = f1.add(settings, 'duration', 0, 180).step(1);
f1.add(settings, 'distance', 0, 100).step(1);
f1.closed = true;

var f2 = gui.addFolder('color');
var color_infectious_control = f2.addColor(settings, 'color_infectious');
var color_healed_control = f2.addColor(settings, 'color_healed');
var color_active_control = f2.addColor(settings, 'color_active');
var color_passive_control = f2.addColor(settings, 'color_passive');
var color_casualty_control = f2.addColor(settings, 'color_casualty');
f2.closed = true;

var f3 = gui.addFolder('features');
f3.add(settings, 'chat');
f3.add(settings, 'gmaps')
f3.closed = true;

gui.closed = true;

duration.onChange(function(value) {
    //set the time when time changed
    updateDuration(settings.duration);
});

color_infectious_control.onChange(function(value) {
    // Fires on every change, drag, keypress, etc.
    // for(var i=0; i<couples.length; i++){
    //   couples[i].red.fill = settings.color_1;
    // }
});

color_healed_control.onChange(function(value) {
    // Fires on every change, drag, keypress, etc.
    // for(var i=0; i<couples.length; i++){
    //   couples[i].blue.fill = settings.color_2;
    // }
});