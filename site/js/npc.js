/* NPC class object */

/**
 * Constructor for NPC Class
 */
var NPC = function(x, y, role, type, isPatientZero){
    this.id   = null; // id will be attributed once the object is pushed to the database
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

/**
 * Creates a new NPC in the database with the same info of this NPC. Also assigns the UUID from the database to this NPC.
 */
NPC.prototype.pushToDatabase = function() {
    var NPC = Parse.Object.extend("NPC");
    var npc = new NPC();

    // save new npc to database
    npc.save({
      x: this.x,
      y: this.y,
      role: this.role,
      type: this.type,
      isPatientZero: this.isPatientZero
    }, {
      success: function(npc) {
        // The object was saved successfully.
        console.log("Success: a new NPC was addes to the database");

        // once the object is pushed to the database give it its id
        this.id = npc.id;

        // sends message so other players also add the npc locally
        sendAddNPCMessage(this.id);
      },
      error: function(npc, error) {
        // The save failed.
        // error is a Parse.Error with an error code and message.
        console.log("Error: " + error.code + " " + error.message);
      }
    });
}