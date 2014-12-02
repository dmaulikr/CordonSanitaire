var settings = new Settings();

function Settings(){
    this.timer = 120;
    this.distance = 20;
    this.color_patient = '#f02075';
    this.color_active = '#1368e1';
    this.color_passive = '#1368e1';
    this.color_casualty = '#333333';
    this.chat = false;
};

var gui = new dat.GUI();

var f1 = gui.addFolder('game');
f1.add(settings, 'timer', 0, 180).step(1);
f1.add(settings, 'distance', 0, 100).step(1);
f1.closed = false;

var f2 = gui.addFolder('color');
var color_patient_control = f2.addColor(settings, 'color_patient');
var color_active_control = f2.addColor(settings, 'color_active');
var color_passive_control = f2.addColor(settings, 'color_passive');
var color_casualty_control = f2.addColor(settings, 'color_casualty');
f2.closed = false;

var f3 = gui.addFolder('features');
f3.add(settings, 'chat');
f3.closed = true;

color_1_control.onChange(function(value) {
    // Fires on every change, drag, keypress, etc.
    for(var i=0; i<couples.length; i++){
      couples[i].red.fill = settings.color_1;
    }
});

color_2_control.onChange(function(value) {
    // Fires on every change, drag, keypress, etc.
    for(var i=0; i<couples.length; i++){
      couples[i].blue.fill = settings.color_2;
    }
});