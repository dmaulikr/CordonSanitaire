// takes in an array of tuples containing latitudes and longitudes and averages them to find the center.
// might not take into account edge cases/ where coordinates wrap around.
function getCenter(coordinates) {
    if (coordinates !== undefined) {
        var avgLat = 0;
        var avgLon = 0;
        //loops through and adds all coordinate values
        for (var i = 0; i < coordinates.length; i++) {
            avgLat += coordinates[i][0];
            avgLon += coordinates[i][1];
        }
        //returns the average.
        avgLat = avgLat / double(coordinates.length);
        avgLon = avgLon / double(coordinates.length);
        return [avgLat, avgLon];
    } else {
        console.log("No coordinates passed");
    }
}

//return two tuples, containing the minimum and maximum latitudes/longitudes, from which 4 boundary points can be extrapolated
function getBounds(coordinates) {
    var maxLat = 0;
    var maxLon = 0;
    var minLat = coordinates[0][0];
    var minLon = coordinates[0][1];
    for (var i = 0; i < coordinates.length; i++) {
        if (coordinates[i][0] < minLat) {
            minLat = coordinates[i][0];
        }
        else if (coordinates[i][0] > maxLat) {
            maxLat = coordinates[i][0];
        }
        if (coordinates[i][1] < minLon) {
            minLon = coordinates[i][0];
        }
        else if (coordinates[i][1] > maxLon) {
            maxLon = coordinates[i][0];
        }

    }
    return [[minLat, minLon], [maxLat, maxLon]];
}

//loads a map for the game around center point, that also contains the bounds.
function loadMap(center, bounds) {
    var mapOptions;
    mapOptions = {
        center: new google.maps.LatLng(center[0], center[1]),
        mapTypeId: google.maps.mapTypeId.ROADMAP,
        zoom: 5,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        panControl: false,
        streetViewControl: false
    };

    map = new google.maps.loadMap(document.getElementById('map'), mapOptions);

    //empty LatLngBounds object
    var mapBounds = new google.maps.LatLngBounds();
    var infoWindow = new google.maps.InfoWindow();

    for (i = 0; i < bounds.length; i++) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(bounds[i][0], locations[i][1]),
            map: map
        });

        mapBounds.extend(marker.position);

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infoWindow.open(map, marker);
            }
        })(marker, i));
    }

    //fit map to new bounds
    map.fitBounds(mapBounds);
}




