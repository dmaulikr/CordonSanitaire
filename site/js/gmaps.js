// This example uses SVG path notation to add a vector-based symbol
// as the icon for a marker. The resulting icon is a star-shaped symbol
// with a pale yellow fill and a thick yellow border.

var map = null;
var quarantine = new google.maps.Polygon();
var markers = [];

var myMarker;
var patientZeroMarker;

var isAnimatingPatientZero = false;

var myType = 'passive';
var myPrevType = 'passive';

var my_animation_interval;
var trapped_interval;

var shout_intervals = {};

// for notifications
var _prevNumTrapped = 0;
var _numTrapped = 0;

var _prevPatientZeroContained = false;
var _patientZeroContained = false;

var _prevNumActive = 0;
var _numActive = 0;

var _myPrevType = 'passive';

function drawMap() {
    var centerMap = new google.maps.LatLng(40.776779, -73.969699);

    // center the map on user
    if ($(window).width() < 480)
        centerMap = getLatLngCoords(myUser.x, myUser.y);

    var mapOptions = {
        zoom: 12,
        center: centerMap,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        panControl: false,
        streetViewControl: false
    };

    if (map == null) {
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    }
}

function setGameBoard() {

    console.log("setting up game board");

    center = getCenter(getActivePopulation());

    sortPeople(); // sort the people into the order to hold the rope
    setQuarantine();

    drawMap();
    updatePopulation();

    // draw quarantine
    drawQuarantine();

    // draw population
    drawPopulation();
    startAnimations();

    // draw npcs
    drawNPCs();

    // simply pulse the trapped once to draw attention to them
    // animateTrapped(); // don't do this if people have the ability to shout

    // update checkbox
    updateButtonAvailable();

    // update scoreboard
    updateScoreboard();

    // update notifications
    updateNotifications();

    //show missed game message after updating gameboard if need be
    if (bShouldShowMissedGameMessage)
        showMissedGameMessage();

    console.log("board set up");
}

function updateGameBoard() {


    if (!hasReceivedJoinedMessage) return;

    console.log("updating population")

    center = getCenter(getActivePopulation());

    sortPeople(); // sort the people into the order to hold the rope
    drawMap();

    updateQuarantine();
    updatePopulation();

    // draw quarantine
    drawQuarantine();

    // draw population
    drawPopulation();

    // draw npcs
    drawNPCs();

    // simply pulse the trapped once to draw attention to them
    // animateTrapped(); // don't do this if people have the ability to shout

    // update checkbox
    updateButtonAvailable();

    // update scoreboard
    updateScoreboard();

    // update notifications
    updateNotifications();

    //show missed game message after updating gameboard if need be
    if (bShouldShowMissedGameMessage)
        showMissedGameMessage();

    console.log("board updated");
}

function setQuarantine(){
    var q_stroke, q_fill;

    quarantine = new google.maps.Polygon({
        paths: getActivePopulationAsGoogleCoords(),
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillOpacity: settings.color_border_opacity
    });

    // wait until quaratine path is set to check if patient zero is contained and set the proper colors
    if (isPatientZeroContained()) {
        console.log("heeere2")
        q_stroke = settings.color_border_contained_stroke;
        q_fill = settings.color_border_contained_fill;
    } else {
        q_stroke = settings.color_border_not_contained_stroke;
        q_fill = settings.color_border_not_contained_fill;
    }

    quarantine.setOptions({
        strokeColor: q_stroke,
        fillColor: q_fill
    });
}

function updateQuarantine() {
    var q_stroke, q_fill;

    quarantine.setPaths(getActivePopulationAsGoogleCoords());

    if (isPatientZeroContained()) {
        q_stroke = settings.color_border_contained_stroke;
        q_fill = settings.color_border_contained_fill;
    } else {
        q_stroke = settings.color_border_not_contained_stroke;
        q_fill = settings.color_border_not_contained_fill;
    }


    quarantine.setOptions({
        strokeColor: q_stroke,
        fillColor: q_fill
    });
}

function drawQuarantine() {
    quarantine.setMap(map);
}


function isInsideQuarantine(x, y) {
    var coords = getLatLngCoords(x, y);
    return (google.maps.geometry.poly.containsLocation(coords, quarantine) && !google.maps.geometry.poly.isLocationOnEdge(coords, quarantine, 0));
}

function updatePopulation() {
    for (var i = 0; i < people.length; i++) {
        people[i].type = getType(people[i]);
    }
}

var getTrappedPopulationMarkers = function() {
    var trapped = [];

    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        if (getType(person) == TypeEnum.TRAPPED && !person.isUserMe())
            trapped.push(person);
    }

    return trapped;
}

function getTrappedNPCMarkers() {
    var trapped = [];

    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];
        if (getType(npc) == TypeEnum.TRAPPED)
            trapped.push(npc);
    }

    return trapped;
}

var updateNPCs = function() {
    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];
        npc.updateType(getType(npc));
    }
}

var drawNPCs = function() {
    // update before start drawing
    updateNPCs();

    // draw npcs one by one
    for (var i = 0; i < npcs.length; i++) {
        // hides patient zero
        if (!npcs[i].isPatientZero)
            npcs[i].draw();
    }
}


var drawPopulation = function() {
    for (var i = 0; i < people.length; i++) {
        // hide patient zero
        if (!people[i].isPatientZero) {
            people[i].draw();
        }
        if (people[i].isUserMe()) {
            myUser.marker = people[i].marker;
        }
    }
    // label wiht you are here
    myUser.labelWithYouAreHere();
    // start the recurring animations
}

function startAnimations() {
    console.log("starting animations");
    var count = 0;
    var period = 150;

    my_animation_interval = window.setInterval(function() {

        count = (count + 1) % period;

        var icon;
        // animate my icon so I know who I am
        if (myUser.marker == null)
            throw "My marker is null"
        icon = myUser.marker.icon;
        icon.scale = 12 + 4 * Math.sin(2 * Math.PI * count / period);
        myUser.marker.setIcon(icon);
    }, 20);
}

// animate the person who is shouting
function animateShout(id) {
    var shoutPerson = User.getPersonById(id);
    var shoutMarker = shoutPerson.marker;
    var shoutMarkerIcon = shoutMarker.icon;

    var count = 0;
    var dur = 50;

    if (shoutPerson.isUserMe(shoutPerson))
        window.clearInterval(my_animation_interval);

    window.clearInterval(shout_intervals[id]);

    shout_intervals[id] = window.setInterval(function() {

        count = (count + 1);

        if (count > dur) {
            window.clearInterval(shout_intervals[id]);
        }

        shoutMarkerIcon.scale = 8 + 16 * Math.pow(.9, count);
        shoutMarker.setIcon(shoutMarkerIcon);

    }, 20);
}

// pulse the trapped icons once all together. A sort of cry for help.
function animateTrapped() {
    // var trapped = getTrappedPopulationMarkers();
    var trapped = getTrappedNPCMarkers();
    console.log(trapped);
    var count = 0;
    var period = 20;

    trapped_interval = window.setInterval(function() {

        count = (count + 1);

        if (count > period) {
            window.clearInterval(trapped_interval);
        }

        var icon;
        var marker;

        for (var i = 0; i < trapped.length; i++) {
            if (trapped[i].isUserMe()) continue; // skip my already animating icon
            marker = trapped[i].marker;
            icon = marker.icon;
            icon.scale = 8 + 2 * Math.sin(Math.PI * (count / period));
            marker.setIcon(icon);
        }
    }, 20);

}


// animate Patient Zero
var animatePatientZero = function(icon) {
    var count = 0;
    window.setInterval(function() {
        count = (count + 1) % 200;
        /*
     icons[0].offset = (count / 2) + '%';
      line.set('icons', icons);

*/
    }, 20);
}


//
var updateScoreboard = function() {
    //check status of patient zero
    if (_patientZeroContained)
        document.getElementById('patient_status').innerHTML = 'contained';
    else
        document.getElementById('patient_status').innerHTML = 'not contained';

    // update count of casualties
    document.getElementById('casualty_count').innerHTML = countCasualties();

    // calculate the sq mi of quarantine...
    document.getElementById('area_quarantined').innerHTML = getAreaQuarantined();

    // update count of people quarantining
    document.getElementById('num_active').innerHTML = countActivePeople();

    // update score

}

var updateButtonAvailable = function() {
    //console.log("updating join functionality");
    if (getType(myUser) == TypeEnum.TRAPPED) {
        document.getElementById('buttons').style.visibility = 'hidden';
        document.getElementById('shoutButton').style.visibility = 'visible';
    } else {
        document.getElementById('shoutButton').style.visibility = 'hidden';
        document.getElementById('buttons').style.visibility = 'visible';
    }
}

var updateNotifications = function() {

    // IN ORDER OF PRIORITY
    // Only a single message each action

    // if p0 is contained && prev state !contained
    //PATIENT ZERO IS QUARANTINED
    if (_patientZeroContained && !_prevPatientZeroContained) {
        ohSnap('PATIENT ZERO IS QUARANTINED', 'green');
    }

    // if p0 is not contained && prev state is contained
    //PATIENT ZERO IS ON THE LOOSE
    else if (!_patientZeroContained) { //{&& _prevPatientZeroContained) {
        ohSnap('PATIENT ZERO IS ON THE LOOSE', 'red');
    }

    // if active count < 3 && prev active count >=3
    //QUARANTINE FORMED
    if (_numActive >= 3 && _prevNumActive < 3) {
        ohSnap('QUARANTINE FORMED!', 'yellow');
        _prevNumActive = _numActive;
    }

    // if active count >= && prev active count < 3
    //QUARANTINE BROKEN!
    else if (_numActive < 3 && _prevNumActive >= 3) {
        ohSnap('QUARANTINE BROKEN!', 'red');
        _prevNumActive = _numActive;
    }

    // if numTrapped == 1 &&  prev numTrapped == 0
    //HEALTHY PEOPLE ARE INSIDE THE QUARANTINE
    else if (_numTrapped == 1 && _prevNumTrapped == 0) {
        ohSnap('HEALTHY PEOPLE ARE INSIDE THE QUARANTINE', 'orange');
        _prevNumTrapped = _numTrapped;
    }

    // else if numTrapped != prev numTrapped
    //ANOTHER HEALTHY PERSON GOT TRAPPED!
    else if (_numTrapped > _prevNumTrapped) {
        ohSnap('ANOTHER HEALTHY PERSON GOT TRAPPED!', 'orange');
        _prevNumTrapped = _numTrapped;
    }


    // if active count is > prev active count
    //ADDITIONAL PLAYER ON THE QUARANTINE LINE
    else if (_numActive > _prevNumActive) {
        ohSnap('ADDITIONAL PLAYER ON THE QUARANTINE LINE', 'yellow');
        _prevNumActive = _numActive;
    }

    // if active count < prev active count
    //LOST A PLAYER FROM THE QUARANTINE LINE
    else if (_numActive < _prevNumActive) {
        ohSnap('LOST A PLAYER FROM THE QUARANTINE LINE', 'yellow');
        _prevNumActive = _numActive;
    }

    // update status of previous values
    _prevPatientZeroContained = _patientZeroContained;


    // sends additional notifications about being trapped/free from a quarantine
    if (myType == 'casualty' && _myPrevType != 'casualty') {
        ohSnap('YOU ARE TRAPPED INSIDE THE QUARANTINE', 'red');
        _myPrevType = myType;
    } else if (myType != 'casualty' && _myPrevType == 'casualty') {
        ohSnap('YOU ARE OUT OF THE QUARANTINE', 'green');
        _myPrevType = myType;
    }
}

function isPatientZeroContained() {

    if (quarantine == null || quarantine.length < 3) { // can't do it with less than 3
        console.log("heere");
        _patientZeroContained = false;
        return false;
    }

    // searches por patient zero among players
    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.isPatientZero) {
            if (isInsideQuarantine(person.x, person.y)) {
                _patientZeroContained = true;
                return true;
            } else {
                _patientZeroContained = false;
                return false;
            }
        }
    }

    // searches for patient zero among npcs
    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];
        if (npc.isPatientZero) {
            if (isInsideQuarantine(npc.x, npc.y)) {
                _patientZeroContained = true;
                return true;
            } else {
                _patientZeroContained = false;
                return false;
            }
        }
    }
}


var countCasualties = function() {
    var count = 0;

    // count players casualities
    for (var i = 0; i < people.length; i++) {
        if (!people[i].isPatientZero) {
            if (getType(people[i]) == TypeEnum.TRAPPED)
                count++;
        }
    }

    // count npcs casualities
    for (var i = 0; i < npcs.length; i++) {
        if (!npcs[i].isPatientZero) {
            if (getType(npcs[i]) == TypeEnum.TRAPPED)
                count++;
        }
    }

    _numTrapped = count;

    return count;
}


var countActivePeople = function() {
    var count = 0;

    for (var i = 0; i < people.length; i++) {
        if (people[i].isActive())
            count++;
    }

    return count;
}


// calculate the total area quarantined
var getAreaQuarantined = function() {
    if (quarantine.getPath()) { // only compute quarantine area if a path exists (even of one point :)
        var area = google.maps.geometry.spherical.computeArea(quarantine.getPath());
        // convert from sq meters to sq miles
        area = area * (0.000621371) * (0.000621371);
        return area.toFixed(2);
    } else {
        var defaultArea = 0;
        return defaultArea.toFixed(2);
    }
}

var revealPatientZero = function() {
    console.log("revealing patient zero");
    var index = NPC.getPatientZeroIndex();
    var npc = npcs[index];
    var npc_coords = getLatLngCoords(npc.x, npc.y);

    // creates a new marker for the npc if there isnt already one
    if (npc.marker == null) {
        var marker_obj = new google.maps.Marker({
            position: npc_coords,
            icon: getMarkerIcon(npc.type), // depends on the type of the npc
            map: map,
        });

        // sets patient zeros's marker in the local array to the created marker
        npcs[index].marker = marker_obj;
    }


    // pan to show the patient zero centered in the screen
    map.panTo(npc_coords);
}