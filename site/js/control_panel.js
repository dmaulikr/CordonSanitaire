var settings = new Settings();

function Settings(){
    this.duration = 120;
    this.distance = 20;

    this.color_infectious_fill = '#ff5555';
    this.color_infectious_stroke = '#550000';
    this.color_healed_fill = '#ff7755'; //'#55ffb9';
    this.color_healed_stroke = '#550000'; //'#005533';
    this.color_active_fill = '#fff341';
    this.color_active_stroke = '#000000';
    this.color_passive_fill = '#ffffff';
    this.color_passive_stroke = '#000000';
    this.color_casualty_fill = '#ffa352';
    this.color_casualty_stroke = '#000000';

    this.color_border_not_contained_stroke = '#000000';
    this.color_border_not_contained_fill = '#000000';
    this.color_border_contained_stroke = '#006666';
    this.color_border_contained_fill = '#55ffb9';
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

var gui = new dat.GUI( { autoPlace: false } );
gui.domElement.id = 'gui';

var f0 = gui.addFolder('countdown');
f0.add(settings, 'start');
f0.add(settings, 'stop');
f0.add(settings, 'refresh');
f0.closed = true;

var f5 = gui.addFolder('advanced');
f5.add(settings, 'rollDice');
f5.add(settings, 'resetPlayers');

var f1 = gui.addFolder('settings');
var duration = f1.add(settings, 'duration', 0, 180).step(1);
f1.add(settings, 'distance', 0, 100).step(1);
f1.closed = true;

var f4 = gui.addFolder('border');
var color_border_not_contained_stroke_control = f4.addColor(settings, 'color_border_not_contained_stroke');
var color_border_not_contained_fill_control = f4.addColor(settings, 'color_border_not_contained_fill');
var color_border_contained_stroke_control = f4.addColor(settings, 'color_border_contained_stroke');
var color_border_contained_fill_control = f4.addColor(settings, 'color_border_contained_fill');
var color_border_opacity_control = f4.add(settings, 'color_border_opacity', 0, 1);
f4.closed = true;

var f2 = gui.addFolder('color');
var color_infectious_fill_control = f2.addColor(settings, 'color_infectious_fill');
var color_infectious_stroke_control = f2.addColor(settings, 'color_infectious_stroke');
var color_healed_fill_control = f2.addColor(settings, 'color_healed_fill');
var color_healed_stroke_control = f2.addColor(settings, 'color_healed_stroke');
var color_active_fill_control = f2.addColor(settings, 'color_active_fill');
var color_active_stroke_control = f2.addColor(settings, 'color_active_stroke');
var color_passive_fill_control = f2.addColor(settings, 'color_passive_fill');
var color_passive_stroke_control = f2.addColor(settings, 'color_passive_stroke');
var color_casualty_fill_control = f2.addColor(settings, 'color_casualty_fill');
var color_casualty_stroke_control = f2.addColor(settings, 'color_casualty_stroke');
f2.closed = true;

var f3 = gui.addFolder('features');
f3.add(settings, 'chat');
f3.add(settings, 'gmaps')
f3.closed = true;

gui.closed = true;

// change duration
duration.onChange(function(value) {
    //set the time when time changed
    updateDuration(settings.duration);
});


// border
color_border_not_contained_stroke_control.onChange(function(value) {
    updateGameBoard();
});

color_border_not_contained_fill_control.onChange(function(value) {
    updateGameBoard();
});

color_border_contained_stroke_control.onChange(function(value) {
    updateGameBoard();
});

color_border_contained_fill_control.onChange(function(value) {
    updateGameBoard();
});

color_border_opacity_control.onChange(function(value) {
    updateGameBoard();
});


// infectious
color_infectious_fill_control.onChange(function(value) {
    updateGameBoard();
});
color_infectious_stroke_control.onChange(function(value) {
    updateGameBoard();
});


// healed
color_healed_fill_control.onChange(function(value) {
    updateGameBoard();
});
color_healed_stroke_control.onChange(function(value) {
    updateGameBoard();
});


// active
color_active_fill_control.onChange(function(value) {
    updateGameBoard();
});
color_active_stroke_control.onChange(function(value) {
    updateGameBoard();
});


// passive
color_passive_fill_control.onChange(function(value) {
    updateGameBoard();
});
color_passive_stroke_control.onChange(function(value) {
    updateGameBoard();
});


// casualty
color_casualty_fill_control.onChange(function(value) {
    updateGameBoard();
});
color_casualty_stroke_control.onChange(function(value) {
    updateGameBoard();
});
