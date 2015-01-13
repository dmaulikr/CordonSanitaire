/* NPC class object */ 

/**
 * Constructor for NPC Class
 */
var NPC = function(id, x, y, role, type, isPatientZero){
    this.id   = id;
    this.x    = x;
    this.y    = y;
    this.role = role;
    this.type = type;
    this.isPatientZero = isPatientZero; 
    this.marker = null;
}

/**
 * Draws a NPC into the map
 */
NPC.prototype.draw = function() {
    var coords = getLatLngCoords(npc.x, npc.y);
    
    // if there's no marker, create one.
    if(this.marker == null) {
        // creates a new marker for the npc and adds it to the map
        var marker_obj = new google.maps.Marker({
          position: coords,
          icon: getMarkerIcon(this.type), // depends on the type of the npc
          map: map,
        });

        // sets the npc marker to the created marker
        this.marker = marker_obj;
                
    }
    // if there's a marker just change the icon
    else
        this.marker.setIcon(getMarkerIcon(this.type));

    } 
}

/**
 * Erases an NPC from the map
 */
NPC.prototype.erase = function() {
    this.marker.setMap(null);
}