// This example uses SVG path notation to add a vector-based symbol
// as the icon for a marker. The resulting icon is a star-shaped symbol
// with a pale yellow fill and a thick yellow border.

// function initialize() {
//   var mapOptions = {
//     zoom: 4,
//     center: new google.maps.LatLng(-25.363882, 131.044922)
//   };

//   var map = new google.maps.Map(document.getElementById('map-canvas'),
//       mapOptions);

//   var goldStar = {
//     path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
//     fillColor: 'yellow',
//     fillOpacity: 0.8,
//     scale: 1,
//     strokeColor: 'gold',
//     strokeWeight: 14
//   };

//   var marker = new google.maps.Marker({
//     position: map.getCenter(),
//     icon: goldStar,
//     map: map
//   });

// }

// google.maps.event.addDomListener(window, 'load', initialize);

var map;
var infoWindow;

var createMap = function() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(40.776779, -73.969699),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var quarantine;

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Define the LatLng coordinates for the polygon.
  var triangleCoords = [
      new google.maps.LatLng(25.774252, -80.190262),
      new google.maps.LatLng(18.466465, -66.118292),
      new google.maps.LatLng(32.321384, -64.75737)
  ];

  // Construct the polygon.
  quarantine = new google.maps.Polygon({
    paths: getPopulationAsGoogleCoords(),
    strokeColor: settings.color_border_stroke,
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillColor: settings.color_border_fill,
    fillOpacity: settings.color_border_opacity
  });

  quarantine.setMap(map);

  // Add a listener for the click event.
  //google.maps.event.addListener(bermudaTriangle, 'click', showArrays);

  //infoWindow = new google.maps.InfoWindow();
}

var getPopulationAsGoogleCoords = function() {
  var coords = [];

  var begLat = 40.704204;
  var endLat = 40.829535;
  var begLng = -74.096729;
  var endLng = -73.834258;
  var diffLat = endLat - begLat;
  var diffLng = endLng - begLng;

  for(var i=0; i<people.length; i++) { 

    var latlng = new google.maps.LatLng(begLat + diffLat*people[i].x, begLng + diffLng*people[i].y);
    coords.push(latlng);
  }

  return coords;
}

/** @this {google.maps.Polygon} */
function showArrays(event) {

  // Since this polygon has only one path, we can call getPath()
  // to return the MVCArray of LatLngs.
  var vertices = this.getPath();

  var contentString = '<b>Bermuda Triangle polygon</b><br>' +
      'Clicked location: <br>' + event.latLng.lat() + ',' + event.latLng.lng() +
      '<br>';

  // Iterate over the vertices.
  for (var i =0; i < vertices.getLength(); i++) {
    var xy = vertices.getAt(i);
    contentString += '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat() + ',' +
        xy.lng();
  }

  // Replace the info window's content and position.
  infoWindow.setContent(contentString);
  infoWindow.setPosition(event.latLng);

  infoWindow.open(map);
}

//google.maps.event.addDomListener(window, 'load', createMap);
