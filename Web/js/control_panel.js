var settings = new Settings();
var listener = null;
//Set all values and colors
function Settings(){
    this.duration = 120;
    this.distance = 20;

    this.color_infectious_fill = '#ff5555';
    this.color_infectious_stroke = '#550000';
    this.color_healed_fill = '#ff7755'; //'#55ffb9';
    this.color_healed_stroke = '#550000'; //'#005533';
    this.color_active_fill = '#fff341';
    this.color_active_stroke = '#000000';
    this.color_passive_fill = '#55ffb9';
    this.color_passive_stroke = '#000000';
    this.color_casualty_fill = '#ffaa55';
    this.color_casualty_stroke = '#000000';

    this.color_border_not_contained_stroke = '#000000';
    this.color_border_not_contained_fill = '#ff2222';
    this.color_border_casualty_stroke = '#000000';
    this.color_border_casualty_fill = '#ffe100';
    this.color_border_contained_stroke = '#006666';
    this.color_border_contained_fill = '#55ffb9';
    this.color_border_opacity = .4;

    this.chat = false;
    this.gmaps = false;

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
        Parse.Cloud.run('setAllUsersNotPresent', {}, {
            success: function(result){
                sendResetPlayersMessage();
                console.log("users have been reset");
            },
            error: function(error){
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    };

    this.addNPC = function(){
        var npc = new NPC(
            Math.random(0,1),
            Math.random(0,1),
            "citizen",
            TypeEnum.PASSIVE,
            false
        );

        npc.pushToDatabase();
    };

    //adds a patient zero to map, removing previous ones/ensuring p0 is quarantinable
    this.addPatientZero = function(){
        // checks if there's already a patient zero, if there is, remove it locally and from the database
        if (patient_zero != undefined){
            console.log("there's already a patient zero");
            // erase patient zero's marker if there's one.
            if (patient_zero.marker != null){
                patient_zero.marker.setMap(null);
                listener = null
            }
            patient_zero.removeFromDatabase();
        }

        // then picks 3 random users and place p0 in the middle of them
        var rnd_users = [];
        var loc;
        if (people.length <= 3){
            loc = getCenter(people);
        }
        else{
            // pick 3 random users
            for (var i = 0; i < 3; i++){
                var rnd = Math.floor(Math.random()*people.length);
                rnd_users.push(people[rnd]);
            }
            // find the center of these users
            loc = getCenter(rnd_users);
        }

        patient_zero = new NPC(
            loc.x,
            loc.y,
            "citizen",
            TypeEnum.INFECTIOUS,
            true);

        patient_zero.pushToDatabase(function() {
            patient_zero.id = this.id
        });
    }

    this.revealPatientZero = function(){
	    revealPatientZero();
    }

    this.changePosition = function(){
        var patient_zero_coords = getLatLngCoords(patient_zero.x, patient_zero.y);
        if (patient_zero.marker == null) {
            var marker_obj = new google.maps.Marker({
                position: patient_zero_coords,
                draggable: true,
                icon: getMarkerIcon(patient_zero.type), // depends on the type of the npc
                map: map,
            });

            patient_zero.marker = marker_obj;
        } else {
            patient_zero.marker.setDraggable(true);
        }

        if (listener == null){
            console.log("set listener")
            listener = google.maps.event.addListener(patient_zero.marker, "dragend", function() {
                var pos = getPositionFromGoogleCoords(patient_zero.marker.getPosition());
                patient_zero.updatePosition(pos, function(){
                    sendSetPatientZeroPositionMessage(pos);
                });
            });
        }
    }
};

/* Only shows the control panel for the admin user, otherwise hide the panel */

if (Parse.User.current().get('admin')){
    /* visible control panel */
    var gui = new dat.GUI();
    
    // close the intro screen
	document.getElementById("overlay").style.visibility = 'hidden';
}
else{
    /* invisible control panel */

    var gui = new dat.GUI( { autoPlace: false } );
    gui.domElement.id = 'gui';
}

/* -------------------------------------------------------------------------------- */


var f0 = gui.addFolder('countdown');
f0.add(settings, 'start');
f0.add(settings, 'stop');
f0.add(settings, 'refresh');
f0.closed = true;

var f5 = gui.addFolder('advanced');
f5.add(settings, 'resetPlayers');
f5.add(settings, 'changePosition');

var f1 = gui.addFolder('settings');
var duration = f1.add(settings, 'duration', 0, 180).step(1);
f1.add(settings, 'distance', 0, 100).step(1);
f1.closed = true;

var f4 = gui.addFolder('border');
var color_border_not_contained_stroke_control = f4.addColor(settings, 'color_border_not_contained_stroke');
var color_border_not_contained_fill_control = f4.addColor(settings, 'color_border_not_contained_fill');
var color_border_casualty_stroke_control = f4.addColor(settings, 'color_border_casualty_stroke');
var color_border_casualty_fill_control = f4.addColor(settings, 'color_border_casualty_fill');
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

var f6 = gui.addFolder('NPCs');
f6.add(settings, 'addNPC');
f6.add(settings, 'addPatientZero');
f6.add(settings, 'revealPatientZero');
f6.closed = true;

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

color_border_casualty_stroke_control.onChange(function(value) {
    updateGameBoard();
});

color_border_casualty_fill_control.onChange(function(value) {
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
