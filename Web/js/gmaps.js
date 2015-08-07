// This example uses SVG path notation to add a vector-based symbol
// as the icon for a marker. The resulting icon is a star-shaped symbol
// with a pale yellow fill and a thick yellow border.

var map;
var quarantine = new google.maps.Polygon();
var markers = [];

var markerSize = 8;	// default size for markers

var isAnimatingPatientZero = false;

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

//Get google map based on preset coordinates and zoom appropriately
function drawMap() {
    var centerMap = new google.maps.LatLng(40.776779, -73.969699);

    // center the map on user
    if ($(window).width() < 480)
        centerMap = getLatLngCoords(myUser.x, myUser.y);

    var layer = "toner-background";

    var mapOptions = {
        zoom: 12,
        center: centerMap,
        //mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeId: layer,
        mapTypeControlOptions: {
            mapTypeIds: [layer]
        },
        disableDefaultUI: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        panControl: false,
        streetViewControl: false
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // set the map layer to show toner
    map.mapTypes.set(layer, new google.maps.StamenMapType(layer));

    // Listen for map zoom events and resize the markers as needed
    google.maps.event.addListener(map, 'zoom_changed', function () {

        //update the marker size based on the map zoom
        var zoom = map.getZoom();
        if (zoom >= 12) markerSize = 8;
        else if (zoom < 12 && zoom >= 8) markerSize = 4;
        else if (zoom < 8) markerSize = 2;

        updateGameBoard();
    });
}

//Setup game: get center of active population, sort people, draw map, update everything once.
function setGameBoard() {

    console.log("setting up game board");

    center = getCenter(getActivePopulation());

    sortPeople(); // sort the people into the order to hold the rope

    drawMap(); // only draw the map once
    setQuarantine();
    updateNPCs();
    updatePopulation();
    updatePatientZero();

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

    console.log("updating population");

    center = getCenter(getActivePopulation());

    sortPeople(); // sort the people into the order to hold the rope

    updateQuarantine();
    updateNPCs();
    updatePopulation();
    updatePatientZero();

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

//Create quarantine polygon based on active quarantiners
function setQuarantine() {
    var q_stroke, q_fill;

    quarantine = new google.maps.Polygon({
        paths: getActivePopulationAsGoogleCoords(),
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillOpacity: settings.color_border_opacity
    });

}

function updateQuarantine() {
    quarantine.setPaths(getActivePopulationAsGoogleCoords());
}

function drawQuarantine() {
    var q_stroke, q_fill;

    if (isPatientZeroContained()) {

        // check to see if other people are trapped inside
        if (countCasualties() > 0) {
            q_stroke = settings.color_border_casualty_stroke;
            q_fill = settings.color_border_casualty_fill;
        }
        else {
            q_stroke = settings.color_border_contained_stroke;
            q_fill = settings.color_border_contained_fill;
        }
    }
    else {
        q_stroke = settings.color_border_not_contained_stroke;
        q_fill = settings.color_border_not_contained_fill;
    }


    quarantine.setOptions({
        strokeColor: q_stroke,
        fillColor: q_fill
    });
    quarantine.setMap(map);
}

//boolean, if x and y coordinates are inside the quarantine.
function isInsideQuarantine(x, y) {
    var coords = getLatLngCoords(x, y);
    return (google.maps.geometry.poly.containsLocation(coords, quarantine) && !google.maps.geometry.poly.isLocationOnEdge(coords, quarantine, 0));
}

//checks the type of everybody in people list 
function updatePopulation() {
    for (var i = 0; i < people.length; i++) {
        people[i].type = getType(people[i]);
        if (people[i].isUserMe()) {
            myUser.type = people[i].type
        }
    }
}

//creates a list of trapped people
function getTrappedPopulationMarkers() {
    var trapped = [];

    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        if (getType(person) == TypeEnum.TRAPPED && !person.isUserMe())
            trapped.push(person);
    }

    return trapped;
}

//creates a list of trapped npcs
function getTrappedNPCMarkers() {
    var trapped = [];

    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];
        if (getType(npc) == TypeEnum.TRAPPED)
            trapped.push(npc);
    }

    return trapped;
}

function updatePatientZero() {
    patient_zero.type = getType(patient_zero);
}

function updateNPCs() {
    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];
        npc.type = getType(npc);
    }
}

function drawNPCs() {
    // draw npcs one by one
    for (var i = 0; i < npcs.length; i++) {
        // hides patient zero
        if (!npcs[i].isPatientZero)
            npcs[i].draw();
    }
}


function drawPopulation() {
    for (var i = 0; i < people.length; i++) {
        // hide patient zero
        if (!people[i].isPatientZero) {
            people[i].draw();
        }
        if (people[i].isUserMe()) {
            myUser.marker = people[i].marker;
        }
    }
    // label with you are here
    myUser.labelWithYouAreHere();
    // start the recurring animations
}

function startAnimations() {
    console.log("starting animations");
    var count = 0;
    var period = 150;

    my_animation_interval = window.setInterval(function () {

        count = (count + 1) % period;

        var icon;
        // animate my icon so I know who I am
        if (myUser.marker == null)
            throw "My marker is null";
        icon = myUser.marker.icon;
        icon.scale = markerSize + (1 + Math.sin(2 * Math.PI * count / period)) * markerSize / 2;
        myUser.marker.setIcon(icon);
    }, 20);
}

// animate the person who is shouting
function animateShout(id) {
    var shoutPerson = User.getPersonById(id);
    var shoutMarker = shoutPerson.marker;

    var count = 0;
    var dur = 50;

    if (shoutPerson.isUserMe(shoutPerson))
        window.clearInterval(my_animation_interval);

    window.clearInterval(shout_intervals[id]);

    shout_intervals[id] = window.setInterval(function () {

        count = (count + 1);

        if (count > dur) {
            window.clearInterval(shout_intervals[id]);
            // once shouting is over go back to animate myself.
            if (shoutPerson.isUserMe(shoutPerson))
                startAnimations();
        }

        shoutMarkerIcon.scale = markerSize + 2 * markerSize * Math.pow(.9, count);
        shoutMarker.setIcon(shoutMarker.icon);

    }, 20);
}

// pulse the trapped icons once all together. A sort of cry for help.
function animateTrapped() {
    // var trapped = getTrappedPopulationMarkers();
    var trapped = getTrappedNPCMarkers();
    console.log(trapped);
    var count = 0;
    var period = 20;

    trapped_interval = window.setInterval(function () {

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
            icon.scale = markerSize + markerSize / 4 * Math.sin(Math.PI * (count / period));
            marker.setIcon(icon);
        }
    }, 20);

}


// animate Patient Zero
function animatePatientZero(icon) {
    var count = 0;
    window.setInterval(function () {
        count = (count + 1) % 200;
        /*
         icons[0].offset = (count / 2) + '%';
         line.set('icons', icons);

         */
    }, 20);
}


//Get all parameters necessary to update score
function updateScoreboard() {
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

//Toggles buttons showing based on user's type
function updateButtonAvailable() {
    if (myUser.type == TypeEnum.TRAPPED) {
        document.getElementById('buttons').style.visibility = 'hidden';
        document.getElementById('shoutButton').style.visibility = 'visible';
    } else {
        document.getElementById('shoutButton').style.visibility = 'hidden';
        document.getElementById('buttons').style.visibility = 'visible';
    }

    if (myUser.type == TypeEnum.ACTIVE) {
        document.getElementById('myonoffswitch').checked = true;
    }
    else if (myUser.type == TypeEnum.PASSIVE) {
        document.getElementById('myonoffswitch').checked = false;
    }
}

function updateNotifications() {

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

    // sends additional notifications about being trapped/free from a quarantine
    if (myUser.type == TypeEnum.TRAPPED && _myPrevType != TypeEnum.TRAPPED) {
        ohSnap('YOU ARE TRAPPED INSIDE THE QUARANTINE', 'red');
    } else if (myUser.type != TypeEnum.TRAPPED && _myPrevType == TypeEnum.TRAPPED) {
        ohSnap('YOU ARE OUT OF THE QUARANTINE', 'green');
    }

    // update status of previous values
    _prevPatientZeroContained = _patientZeroContained;
    _myPrevType = myUser.type;
}
//boolean value checking status of patient zero
function isPatientZeroContained() {

    if (patient_zero == null)
        return true;

    if (quarantine == null || quarantine.length < 3) { // can't do it with less than 3
        console.log("heere");
        _patientZeroContained = false;
        return false;
    }

    _patientZeroContained = (patient_zero.type == TypeEnum.HEALED);

    return _patientZeroContained
}


function countCasualties() {
    var count = 0;

    // count players casualties
    for (var i = 0; i < people.length; i++) {
        if (!people[i].isPatientZero) {
            if (getType(people[i]) == TypeEnum.TRAPPED)
                count++;
        }
    }

    // count npcs casualities
    for (var b = 0; b < npcs.length; b++) {
        if (!npcs[b].isPatientZero) {
            if (getType(npcs[b]) == TypeEnum.TRAPPED)
                count++;
        }
    }

    _numTrapped = count;

    return count;
}


function countActivePeople() {
    var count = 0;

    for (var i = 0; i < people.length; i++) {
        if (people[i].isActive())
            count++;
    }

    return count;
}


// calculate the total area quarantined
function getAreaQuarantined() {
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

function revealPatientZero() {
    console.log("revealing patient zero");
    var patient_zero_coords = getLatLngCoords(patient_zero.x, patient_zero.y);

    // creates a new marker for the npc if there isnt already one
    if (patient_zero.marker == null) {
        console.log("create a new marker");
        var marker_obj = new google.maps.Marker({
            position: patient_zero_coords,
            icon: getMarkerIcon(patient_zero.type), // depends on the type of the npc
            map: map
        });
        patient_zero.marker = marker_obj;
    }

    // pan to show the patient zero centered in the screen
    map.panTo(patient_zero_coords);
}

// update the bounds of the map to show all players
function updateBounds() {
    console.log("updating bounds for new player added");

    var bounds = getBounds(people);

    map.fitBounds(bounds);

    console.log("finished fitting bounds");
}