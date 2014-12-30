// This example uses SVG path notation to add a vector-based symbol
// as the icon for a marker. The resulting icon is a star-shaped symbol
// with a pale yellow fill and a thick yellow border.

var map = null;
var quarantine = null;
var markers = [];
var infoWindow;

// center map on user
//var usersCoords = getUserAsGoogleCoords();

var drawMap = function() {
    
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(40.776779, -73.969699),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true
  };

  if(map == null) {
	  
	  map = new google.maps.Map(document.getElementById('map-canvas'),
   	   mapOptions);
   }
}


var updateGameBoard = function() {
	
	findCenter();
    
    sortPeople();		// sort the people into the order to hold the rope
	
	// temporarily recall create map
	// in the future, only redraw the board, only load map once
	drawMap();
		
	// draw quarantine
	drawQuarantine();

	// draw population
	drawPopulation();

	// update scoreboard
	updateScoreboard();
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


var drawPopulation = function() {

  var people_coords = getPopulationAsGoogleCoords();
  
  for(var i=0; i<people.length; i++) {

  	var person = people[i];
  	
  	
  	if(!doesPersonHaveAMarkerYet(person)) {
	  	
	  	if(isPersonMe(person)) {
	  	  	labelMeWithYouAreHere(people_coords[i]);
	  	}

	    var marker_obj = new google.maps.Marker({
	      position: people_coords[i],
	      icon: getMarkerIconForPerson(person),
	      map: map,
	    });
    
	    markers.push({marker: marker_obj,
		    			id: person.id});
	}
	else {
		var marker_obj = getMarkerForPerson(person)
		marker_obj.setIcon(getMarkerIconForPerson(person));
	}
	
		
  }
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
    		_icon.fillColor = settings.color_healed_fill;		// don't change the color of patient zero
    		_icon.strokeColor = settings.color_healed_stroke;	// instead change the color of the quarantine
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
  if(isPersonMe(person)) {
	_icon.scale = 12;
	//animateMe(_icon); // apply the animation for my icon
    //_icon.fillColor = '#00FFFF';
  }


  return _icon;
}


// animate ME
// create a function to make a simple looping animation for my icon
// animating the scale will do just fine
var animateMe = function(icon) {
	//
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
  if(isPatientZeroContained())
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


var isPersonMe = function(person) {
	return person.id == _uuid;
}


var isPatientZeroContained = function() {

	var poly = getActivePopulationAsNormalCoords();
	
	if( poly.length < 3 )	// can't do it with less than 3
		return false;

	for(var i=0; i<people.length; i++) {
		var person = people[i];
	    if(person.isPatientZero){
	    	if(isPointInPoly(poly, person.x, person.y))
				return true;
			else
	        	return false;
	    } 
  	}
}


var countCasualties = function() {
  var count = 0;

  for(var i=0; i<people.length; i++) {
    if(!people[i].isPatientZero){
      if(getPersonType(people[i]) == 'casualty')
        count++;
    } 
  }
  return count;
}


var countActivePeople = function() {
  return getActivePopulationAsNormalCoords().length;
}


// calculate the total area quarantined
var getAreaQuarantined = function() {
	if(quarantine.getPath()) {	// only compute quarantine area if a path exists (even of one point :)
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