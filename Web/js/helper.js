/**
 * Set of helper functions.
 */

/**
 * Given a type, return the proper marker.
 * @param  {typeEnum}
 * @return {marker}
 */
function getMarkerIcon(type) {
    // common options for icons
    var _icon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#FFFFFF',
        fillOpacity: 1.0,
        scale: markerSize,
        strokeColor: settings.color_border_stroke,
        strokeOpacity: 0.8,
        strokeWeight: markerSize/2
    };

    // set the colors now that we know what type we are
    switch (type) {

        case TypeEnum.INFECTIOUS:
            _icon.scale = markerSize * 2;
            _icon.fillColor = settings.color_infectious_fill;
            _icon.strokeColor = settings.color_infectious_stroke;
            break;

        case TypeEnum.HEALED:
            _icon.scale = markerSize * 2;
            _icon.fillColor = settings.color_healed_fill; // don't change the color of patient zero
            _icon.strokeColor = settings.color_healed_stroke; // instead change the color of the quarantine
            break;

        case TypeEnum.ACTIVE:
            _icon.fillColor = settings.color_active_fill;
            _icon.strokeColor = settings.color_active_stroke;
            break;

        case TypeEnum.PASSIVE:
            _icon.fillColor = settings.color_passive_fill;
            _icon.strokeColor = settings.color_passive_stroke;
            break;

        case TypeEnum.TRAPPED:
            _icon.fillColor = settings.color_casualty_fill;
            _icon.strokeColor = settings.color_casualty_stroke;
            break;
    }

    // make the person stand out so they know who they are
    // Now handled in the animation

    return _icon;
}

/**
 * Get the type of an object. Right now only works with npcs.
 * @param  obj
 * @return {TypeEnum} type
 */
function getType(obj) {

    var type = obj.type;

    // check for casualty
    if (type != TypeEnum.ACTIVE) {
        if (!isInsideQuarantine(obj.x, obj.y)) {
            type = TypeEnum.PASSIVE;
        } else {
            type = TypeEnum.TRAPPED;
        }
    }

    // check for patient zero
    if (obj.isPatientZero) {
        if (isInsideQuarantine(obj.x, obj.y))
            type = TypeEnum.HEALED;
        else
            type = TypeEnum.INFECTIOUS;
    }

    return type;
}

/**
 * Return the active Users.
 * @return activePopulation [an array with the active Users]
 */
function getActivePopulation(){
    var activePopulation = [];
    for (var i = 0; i < people.length; i++) {
        if (people[i].isActive() && !people[i].isPatientZero) {
            activePopulation.push(people[i]);
        }
    }

    return activePopulation;
}

/**
 * Gets the Google Coordinates of the active Users.
 * @return coord [an array with the Google Coordinates of the active Users]
 */
function getActivePopulationAsGoogleCoords() {
    var coords = [];
    for (var i = 0; i < people.length; i++) {
        if (people[i].isActive() && !people[i].isPatientZero) {
            coords.push(getLatLngCoords(people[i].x, people[i].y));
        }
    }

    _numActive = coords.length; //update for notifications

    return coords;
}


/**
 * Given x and y, returns the respective latitute and longitude as Google Coordinates
 * @param     x     [description]
 * @param     y     [description]
 * @return  latlng  [description]
 */
function getLatLngCoords(x, y) {

    var diffLat = LAT_MAX - LAT_MIN;
    var diffLng = LON_MAX - LON_MIN;

    var latlng = new google.maps.LatLng(LAT_MIN + diffLat * x, LON_MIN + diffLng * y);

    return latlng;
}

function getPositionFromGoogleCoords(coords){
    var diffLat = LAT_MAX - LAT_MIN;
    var diffLng = LON_MAX - LON_MIN;

    var x = (coords.k - LAT_MIN) / diffLat
    var y = (coords.D - LON_MIN) / diffLng

    return {x: x, y: y}
}
/**
 * Given an array of users, returns the center locations of those users.
 * @param  users [users]
 * @return loc   [the center of the coordinates of the users]
 */
function getCenter(users) {
    var total = {
        x: 0,
        y: 0
    };
    var loc = {
        x: 0,
        y: 0
    };

    for (var i = 0; i < users.length; i++) {
        total.x += users[i].x;
        total.y += users[i].y;
    }
    if (users.length > 0){
        loc.x = total.x / users.length;
        loc.y = total.y / users.length;
    }

    return loc;
}

//return a google maps LatLngBounds object, containing the minimum and maximum latitudes/longitudes, from which 4 boundary points can be extrapolated
function getBounds(users) {
    var maxLat = -180;
    var maxLon = -90;
    var minLat = users[0].coords.lat();
    var minLon = users[0].coords.lng();

    // look through all users to find the outer bounds of all players
    for (var i = 0; i < users.length; i++) {
        if (users[i].coords.lat() < minLat) {
            minLat = users[i].coords.lat();
        }
        else if (users[i].coords.lat() > maxLat) {
            maxLat = users[i].coords.lat();
        }
        if (users[i].coords.lng() < minLon) {
            minLon = users[i].coords.lng();
        }
        else if (users[i].coords.lng() > maxLon) {
            maxLon = users[i].coords.lng();
        }

    }

    // create google lat lng coordinates for bounds
    var sw = new google.maps.LatLng(minLat, minLon);
    var ne = new google.maps.LatLng(maxLat, maxLon);
    var bounds = new google.maps.LatLngBounds(sw, ne);

    return bounds;
}