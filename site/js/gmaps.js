// This example uses SVG path notation to add a vector-based symbol
// as the icon for a marker. The resulting icon is a star-shaped symbol
// with a pale yellow fill and a thick yellow border.

var map = null;
var quarantine = null;
var markers = [];

var myPerson;
var myMarker;
var myIcon;
var patientZeroMarker;

var isAnimatingMyIcon = false;
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

 
// center map on user
//var usersCoords = getUserAsGoogleCoords();

var drawMap = function() {
    
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(40.776779, -73.969699),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    panControl: false,
    streetViewControl: false
  };

  if(map == null) {
      
      map = new google.maps.Map(document.getElementById('map-canvas'),
       mapOptions);
   }
}


var updateGameBoard = function() {
    
    findCenter();
    
    sortPeople();       // sort the people into the order to hold the rope
    
    // temporarily recall create map
    // in the future, only redraw the board, only load map once
    drawMap();
        
    // draw quarantine
    drawQuarantine();

    // draw population
    drawPopulation();

    // draw npcs
    drawNPCs();

    // simply pulse the trapped once to draw attention to them
    //animateTrapped(); // don't do this if people have the ability to shout
    
    // update checkbox
    updateButtonAvailable();

    // update scoreboard
    updateScoreboard();
    
    // update notifications
    updateNotifications();
    
    //show missed game message after updating gameboard if need be
    if(bShouldShowMissedGameMessage)
        showMissedGameMessage();
}


var drawQuarantine = function() {
    
    var q_stroke, q_fill;
    
    if(isPatientZeroContained()) {
        q_stroke = settings.color_border_contained_stroke;
        q_fill = settings.color_border_contained_fill;
    }
    else {
        q_stroke = settings.color_border_not_contained_stroke;      
        q_fill = settings.color_border_not_contained_fill;      
    }

    if(quarantine == null)
        quarantine = new google.maps.Polygon({
            paths: getActivePopulationAsGoogleCoords(),
            strokeColor: q_stroke,
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: q_fill,
            fillOpacity: settings.color_border_opacity
        });
    else {
        quarantine.setOptions({strokeColor: q_stroke, fillColor: q_fill});
        quarantine.setPaths(getActivePopulationAsGoogleCoords());
    }
    quarantine.setMap(map);
}

var getTrappedPopulationMarkers = function() {
    var trapped = [];
    
    for(var i=0; i<people.length; i++) { 
        var person = people[i];
        if(getPersonType(person) == 'casualty' && !isPersonMe(person))
            trapped.push(person);
    }

  return trapped;
}

var getActivePopulationAsNormalCoords = function() {
  var coords = [];

  for(var i=0; i<people.length; i++) { 
    if(people[i].active && !people[i].isPatientZero)
      coords.push(people[i]);
  }

  return coords;
}


var getActivePopulationAsGoogleCoords = function() {
  var coords = [];

  for(var i=0; i<people.length; i++) { 
    if(people[i].active && !people[i].isPatientZero)
      coords.push(getLatLngCoords(people[i].x, people[i].y));
  }

  _numActive = coords.length;   //update for notifications 
  
  return coords;
}


var getPopulationAsGoogleCoords = function() {
  var coords = [];

  for(var i=0; i<people.length; i++) { 
      coords.push(getLatLngCoords(people[i].x, people[i].y));
  }

  return coords;
}


var getUserAsGoogleCoords = function() {
    
    for(var i=0; i<people.length; i++) { 
        if(isPersonMe(people[i])) {
            return getLatLngCoords(people[i].x, people[i].y);
        }
    }

}


var getLatLngCoords = function(x,y) {
  
  var begLat = 40.704204;
  var endLat = 40.829535;
  var begLng = -74.096729;
  var endLng = -73.834258;
  var diffLat = endLat - begLat;
  var diffLng = endLng - begLng;

  var latlng = new google.maps.LatLng(begLat + diffLat*x, begLng + diffLng*y);

  return latlng;
}

var drawNPCs = function() {
    console.log("drawing NPCs");
    for(var i=0; i<npcs.length; i++) {

        var npc = npcs[i];
        var npc_coords = getLatLngCoords(npc.x, npc.y);

        // hides patient zero
        if(npc.isPatientZero)
            continue;

        if(npc.marker == null) {

            // creates a new marker for the npc and adds it to the map
            var marker_obj = new google.maps.Marker({
              position: npc_coords,
              icon: getMarkerIconForPerson(npc), // depends on the type of the npc
              map: map,
            });

            // sets the npc marker to the created marker
            npc.marker = marker_obj;
                    
        }
        else {
            // correctly sets the icon of the marker
            npc.marker.setIcon(getMarkerIconForPerson(npc));

        } 
    }  
}


var drawPopulation = function() {

  var people_coords = getPopulationAsGoogleCoords();
  
  for(var i=0; i<people.length; i++) {

    var person = people[i];
    
    if(person.isPatientZero)
    	continue;
    
    if(!doesPersonHaveAMarkerYet(person)) {
        
        if(isPersonMe(person)) {
            labelMeWithYouAreHere(people_coords[i]);
        }

        var marker_obj = new google.maps.Marker({
          position: people_coords[i],
          icon: getMarkerIconForPerson(person),
          map: map,
        });
    
        if(isPersonMe(person)) {
            myMarker = marker_obj;
            myPerson = person;
            myIcon = marker_obj.icon;
        }
                
        markers.push({marker: marker_obj,
                        id: person.id});
    }
    else {
        var marker_obj = getMarkerForPerson(person)
        marker_obj.setIcon(getMarkerIconForPerson(person));
        
        if(isPersonMe(person)) {    // update my status
            myMarker = marker_obj;
            myPerson = person;
            myIcon = marker_obj.icon;
        }

    }       
  }
  
  // start the recurring animations
  startAnimations();
}


var labelMeWithYouAreHere = function(coords) {
        
    var labelText = "YOU ARE HERE";

    var myOptions = {
         content: labelText
        ,boxStyle: {
           textAlign: "center"
          ,fontSize: "8pt"
          ,fontWeight: "bold"
          ,backgroundColor: "white"
          ,border: "4px solid rgba(0,0,0,.8)"
          ,borderRadius: "10px"
          ,padding: "5px 0 5px 0"
          ,width: "100px"
         }
        ,disableAutoPan: true
        ,pixelOffset: new google.maps.Size(-55, 20)
        ,position: coords
        ,closeBoxURL: ""
        ,isHidden: false
        ,pane: "mapPane"
        ,enableEventPropagation: true
    };

    var ibLabel = new InfoBox(myOptions);
    ibLabel.open(map);

}


var doesPersonHaveAMarkerYet = function(person) {
    
    for(var i=0; i<markers.length; i++) {
        if(markers[i].id == person.id)
            return true;
    }
    
    return false;
}

var getPersonForUUID = function(uuid) {
	
	for(var i=0; i<people.length; i++) {
		if(people[i].id == uuid)
			return people[i];
	}
	
	console.log("DID NOT FIND PERSON FOR UUID");
}

var getMarkerForPerson = function(person) {
    
    for(var i=0; i<markers.length; i++) {
        if(markers[i].id == person.id)
            return markers[i].marker;
    }
    
    console.log("DID NOT FIND MARKER FOR PERSON");
}


var getPersonType = function(person) {
  
  var type;
  
  if(person.active)
    type = 'active';
  else
    type = 'passive';

  var poly = getActivePopulationAsNormalCoords();

  // check for casualty
  if(type == 'passive' && isPointInPoly(poly, person.x, person.y))
    type = 'casualty';

  // check for patient zero
  if(person.isPatientZero) {
    if(isPointInPoly(poly, person.x, person.y))
      type = 'healed';
    else
      type = 'infectious';
  }
  
  // set if updated for self
  if(isPersonMe(person))
    myType = type;

  return type;
}


var getMarkerIconForPerson = function(person) {

  // common options for icons
  var _icon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#FFFFFF',
    fillOpacity: 1.0,
    scale: 8,
    strokeColor: settings.color_border_stroke,
    strokeOpacity: 0.8,
    strokeWeight: 4
  };

  var type = getPersonType(person);

  // set the colors now that we know what type we are
  switch(type){
    
    case 'infectious': 
            _icon.scale = 16;
            _icon.fillColor = settings.color_infectious_fill;
            _icon.strokeColor = settings.color_infectious_stroke;
      break;
    
    case 'healed': 
            _icon.scale = 16;
            _icon.fillColor = settings.color_healed_fill;       // don't change the color of patient zero
            _icon.strokeColor = settings.color_healed_stroke;   // instead change the color of the quarantine
      break;
    
    case 'active': 
           _icon.fillColor = settings.color_active_fill;
           _icon.strokeColor = settings.color_active_stroke;
      break;
    
    case 'passive': 
            _icon.fillColor = settings.color_passive_fill;
            _icon.strokeColor = settings.color_passive_stroke;
      break;
    
    case 'casualty': 
            _icon.fillColor = settings.color_casualty_fill;
            _icon.strokeColor = settings.color_casualty_stroke;             
      break;
  }
  
  // make the person stand out so they know who they are
  // Now handled in the animation 

  return _icon;
}

var isMyTypeDifferent = function() {
    if( myType != myPrevType ) {
        myPrevType = myType;
        return true;
    }   
    else {
        return false;
    }
}

// 
var startAnimations = function() {
    
    if(isAnimatingMyIcon) return;
    
    var count = 0;
    var period = 150;
    
    my_animation_interval = window.setInterval(function() {

        count = (count + 1) % period;
        
        var icon;
        // animate my icon so I know who I am
        if(isMyTypeDifferent())
            icon = getMarkerIconForPerson(myPerson);
        else
            icon = myIcon;
        icon.scale = 12 + 4 * Math.sin(2 * Math.PI * count/period);
        myMarker.setIcon(icon);
    }, 20);
    
    isAnimatingMyIcon = true;
}

// animate the person who is shouting
var animateShout = function(uuid) {
	var shoutPerson = getPersonForUUID(uuid)
	var shoutMarker = getMarkerForPerson(shoutPerson);
	var shoutMarkerIcon = getMarkerIconForPerson(shoutPerson);
		
	var count = 0;
	var dur = 50;
    
	if(isPersonMe(shoutPerson))
		window.clearInterval(my_animation_interval);
    
    window.clearInterval(shout_intervals[uuid]);
    
    shout_intervals[uuid] = window.setInterval(function() {
		
    	count = (count + 1);
		
		if( count > dur ) {
			window.clearInterval(shout_intervals[uuid]);
		}		
		
		shoutMarkerIcon.scale = 8 + 16 * Math.pow(.9, count);
		shoutMarker.setIcon(shoutMarkerIcon);
		
    }, 20);	
}

// pulse the trapped icons once all together. A sort of cry for help.
var animateTrapped = function() {
    var trapped = getTrappedPopulationMarkers();
    console.log(trapped);
    var count = 0;
    var period = 20;
    
    trapped_interval = window.setInterval(function() {
        
        count = (count + 1);
        
        if( count > period ) {
            window.clearInterval(trapped_interval);
        }
        
        var icon;
        var marker;
        
        for( var i=0; i<trapped.length; i++ ) {
            if(isPersonMe(trapped[i])) continue;    // skip my already animating icon
            marker = getMarkerForPerson(trapped[i]);
            icon = getMarkerIconForPerson(trapped[i]);
            icon.scale = 8 + 2 * Math.sin( Math.PI * (count/period));
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
 
*/ }, 20);
}


//
var updateScoreboard = function() {
  //check status of patient zero
  if(_patientZeroContained)
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

var updateButtonAvailable = function(){
    console.log("updating join functionality");
    if(getPersonType(myPerson) == 'casualty') {
        document.getElementById('buttons').style.visibility = 'hidden';
        document.getElementById('shoutButton').style.visibility = 'visible';
    }
    else {
        document.getElementById('shoutButton').style.visibility = 'hidden';
        document.getElementById('buttons').style.visibility = 'visible';
    }
}

var updateNotifications = function() {
    
    // IN ORDER OF PRIORITY
    // Only a single message each action
    
    // if p0 is contained && prev state !contained
    //PATIENT ZERO IS QUARANTINED
    if(_patientZeroContained && !_prevPatientZeroContained) {
        ohSnap('PATIENT ZERO IS QUARANTINED','green');
    }
    
    // if p0 is not contained && prev state is contained
    //PATIENT ZERO IS ON THE LOOSE
    else if(!_patientZeroContained ) { //{&& _prevPatientZeroContained) {
        ohSnap('PATIENT ZERO IS ON THE LOOSE','red');
    }
    
    // if active count < 3 && prev active count >=3
    //QUARANTINE FORMED
    if(_numActive >= 3 && _prevNumActive < 3) {
        ohSnap('QUARANTINE FORMED!','yellow');
        _prevNumActive = _numActive;
    }   
    
    // if active count >= && prev active count < 3
    //QUARANTINE BROKEN!
    else if(_numActive < 3 && _prevNumActive >= 3) {
        ohSnap('QUARANTINE BROKEN!','red');
        _prevNumActive = _numActive;
    }
    
    // if numTrapped == 1 &&  prev numTrapped == 0
    //HEALTHY PEOPLE ARE INSIDE THE QUARANTINE 
    else if(_numTrapped == 1 && _prevNumTrapped == 0) {
        ohSnap('HEALTHY PEOPLE ARE INSIDE THE QUARANTINE', 'orange');
        _prevNumTrapped = _numTrapped;  
    }
    
    // else if numTrapped != prev numTrapped
    //ANOTHER HEALTHY PERSON GOT TRAPPED! 
    else if(_numTrapped > _prevNumTrapped) {
        ohSnap('ANOTHER HEALTHY PERSON GOT TRAPPED!', 'orange');
        _prevNumTrapped = _numTrapped;  
    }

    
    // if active count is > prev active count
    //ADDITIONAL PLAYER ON THE QUARANTINE LINE
    else if(_numActive > _prevNumActive) {
        ohSnap('ADDITIONAL PLAYER ON THE QUARANTINE LINE','yellow');
        _prevNumActive = _numActive;
    }
    
    // if active count < prev active count
    //LOST A PLAYER FROM THE QUARANTINE LINE
    else if(_numActive < _prevNumActive) {
        ohSnap('LOST A PLAYER FROM THE QUARANTINE LINE','yellow');
        _prevNumActive = _numActive;
    }
    
    // update status of previous values 
    _prevPatientZeroContained = _patientZeroContained;


    // sends additional notifications about being trapped/free from a quarantine
    if(myType == 'casualty' && _myPrevType != 'casualty'){
        ohSnap('YOU ARE TRAPPED INSIDE THE QUARANTINE', 'red');
        _myPrevType = myType;
    }

    else if (myType != 'casualty' && _myPrevType == 'casualty'){
        ohSnap('YOU ARE OUT OF THE QUARANTINE', 'green');
        _myPrevType = myType;
    }
}


var isPersonMe = function(person) {
    return person.id == _uuid;
}


var isPatientZeroContained = function() {

    var poly = getActivePopulationAsNormalCoords();
    
    if( poly.length < 3 ) { // can't do it with less than 3
        _patientZeroContained = false;
        return false;
    }

    for(var i=0; i<people.length; i++) {
        var person = people[i];
        if(person.isPatientZero){
            if(isPointInPoly(poly, person.x, person.y)) {
                _patientZeroContained = true;
                return true;
            }
            else {
                _patientZeroContained = false;
                return false;
            }
        } 
    }
}


var countCasualties = function() {
  var count = 0;

  // count players casualities
  for(var i=0; i<people.length; i++) {
    if(!people[i].isPatientZero){
      if(getPersonType(people[i]) == 'casualty')
        count++;
    } 
  }

  // count npcs casualities
  for(var i=0; i<npcs.length; i++) {
    if(!npcs[i].isPatientZero){
      if(getPersonType(npcs[i]) == 'casualty')
        count++;
    } 
  }
  
  _numTrapped = count;
  
  return count;
}


var countActivePeople = function() {
  return getActivePopulationAsNormalCoords().length;
}


// calculate the total area quarantined
var getAreaQuarantined = function() {
    if(quarantine.getPath()) {  // only compute quarantine area if a path exists (even of one point :)
        var area = google.maps.geometry.spherical.computeArea(quarantine.getPath());
        // convert from sq meters to sq miles
        area = area * (0.000621371) * (0.000621371);
        return area.toFixed(2); 
    }
    else {
        var defaultArea = 0;    
        return defaultArea.toFixed(2);  
    }
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]

function isPointInPoly(poly, x, y){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y))
        && (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}