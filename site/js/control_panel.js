var settings = new Settings();

function Settings(){
    this.duration = 120;
    this.distance = 20;

    this.color_infectious = '#ff5555';
    this.color_healed = '#55ffb9';
    this.color_active = '#fff341';
    this.color_passive = '#ffffff';
    this.color_casualty = '#ffa352';

    this.color_border_stroke = '#000000';
    this.color_border_fill = '#000000';
    this.color_border_opacity = .2;

    this.chat = false;
    this.gmaps = false;

    this.rollDice = function(){
        //pick the patient zero
        pickPatientZero();
    };

    this.start = function(){
        //startTheClock();
        sendStartOfGame();
    };

    this.stop = function(){
        stopTheClock();
    };

    this.refresh = function(){
        resetTheClock();
    };

    this.resetPlayers = function(){
        setAllUsersNotPresent();
    };
};

var gui = new dat.GUI();

var f0 = gui.addFolder('countdown');
f0.add(settings, 'start');
f0.add(settings, 'stop');
f0.add(settings, 'refresh');
f0.closed = false;

var f5 = gui.addFolder('advanced');
f5.add(settings, 'rollDice');
f5.add(settings, 'resetPlayers');

var f1 = gui.addFolder('settings');
var duration = f1.add(settings, 'duration', 0, 180).step(1);
f1.add(settings, 'distance', 0, 100).step(1);
f1.closed = true;

var f4 = gui.addFolder('border');
var color_border_stroke_control = f4.addColor(settings, 'color_border_stroke');
var color_border_fill_control = f4.addColor(settings, 'color_border_fill');
var color_border_opacity_control = f4.add(settings, 'color_border_opacity', 0, 1);
f4.closed = true;

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

color_border_stroke_control.onChange(function(value) {
    createMap();
});

color_border_fill_control.onChange(function(value) {
    createMap();
});

color_border_opacity_control.onChange(function(value) {
    createMap();
});

color_infectious_control.onChange(function(value) {
    createMap();
});
color_healed_control.onChange(function(value) {
    createMap();
});

color_active_control.onChange(function(value) {
    createMap();
});

color_passive_control.onChange(function(value) {
    createMap();
});

color_casualty_control.onChange(function(value) {
    createMap();
});
