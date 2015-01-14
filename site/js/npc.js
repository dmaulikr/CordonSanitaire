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
};

/**
 * Draws a NPC into the map
 */
NPC.prototype.draw = function() {
    var coords = getLatLngCoords(this.x, this.y);

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
};

/**
 * Erases an NPC from the map
 */
NPC.prototype.erase = function() {
    this.marker.setMap(null);
};

/**
 * Creates a new NPC in the database with the same info of this NPC.
 * Also assigns the UUID from the database to this NPC.
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
        console.log("Success: a new NPC was added to the database");

        // once the object is pushed to the database give it its id
        this.id = npc.id;

        // sends message so other players also add the npc locally
        console.log(this.id);
        sendAddNPCMessage(this.id);
      },
      error: function(npc, error) {
        // The save failed.
        // error is a Parse.Error with an error code and message.
        console.log("Error: " + error.code + " " + error.message);
      }
    });
};

NPC.prototype.removeFromDatabase = function(){
  var npc = Parse.Object.extend("NPC");
  var query = new Parse.Query(npc);
  query.get(this.id, {
    success: function(obj) {
      console.log("npc removed from database");
      obj.destroy();
    },
    error: function(obj, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
        console.log("Error: " + error.code + " " + error.message + ". ID " + npc.id);
    }
  });
}

/**
 * Updates the type of this NPC
 * @param  {TypeEnum} type
 */
NPC.prototype.updateType = function(type) {
    this.type = type;
};

/**
 * Repopulates the local array of NPCs with all the entries from the database.
 */
NPC.getAllFromDatabase = function(){
  npcs.clear;
  var npc = Parse.Object.extend("NPC");
  var query = new Parse.Query(npc);
  query.find({
      success: function(results) {
          console.log("Success: Getting NPCs");
          // draw this list of players across the screen.
          for (var i = 0; i < results.length; i++) {
              var object = results[i];

              // create a local NPC
              var npc = new NPC (
                  object.get('x'),
                  object.get('y'),
                  object.get('role'),
                  object.get('type'),
                  object.get('isPatientZero')
              );
              // set id according to the database
              npc.id = object.id;


              npcs.push(npc);
          }
          console.log("synchronized npcs array with database");
      },
      error: function(object, error) {
          // The object was not retrieved successfully.
          // error is a Parse.Error with an error code and message.
          console.log("Error: " + error.code + " " + error.message);
      }
  });
}

/**
 * Adds an NPC to the local array of NPCs.
 * @param id [id of the NPC in the database]
 */
NPC.addToLocalArray = function(id){
  var npc = Parse.Object.extend("NPC");
  var query = new Parse.Query(npc);
  query.get(id, {
      success: function(object) {
        console.log("Success: Getting NPC");

        // create a local NPC
        var npc = new NPC (
          object.get('x'),
          object.get('y'),
          object.get('role'),
          object.get('type'),
          object.get('isPatientZero')
        );

        // set id according to the database
        npc.id = object.id;

        npcs.push(npc);
        console.log(npcs.length);
        updateGameBoard();

      },
      error: function(object, error) {
          // The object was not retrieved successfully.
          // error is a Parse.Error with an error code and message.
          console.log("Error: " + error.code + " " + error.message);
      }
    });
}

/**
 * Removes an NPC from the local array of NPCs.
 * @param id [id of the NPC to be removed]
 */
NPC.removeFromLocalArray = function(id){
    for(var i = 0; i < npcs.length ; i++){
        if (npcs[i].id == id){
            if (npcs[i].marker != null)
              npcs[i].marker.setMap(null);
            npcs.splice(i, 1);
            console.log("npc deleted");
            updateGameBoard();
        }
    }
}

/**
 * Checks wheter an certain ID exists in the local array of NPCs.
 * @param  id [the id to be found]
 * @return boolean [wheter the id exist or not]
 */
NPC.isIdPresent = function(id){
  for(var i=0; i<npcs.length; i++) {
      if (npcs[i].id == id){
          return true;
      }
  }
  return false;
}

/**
 * Looks for patient zero in the local array of NPC. If found, returns patient zero, if not returns undefined.
 * @return patient zero [if patient zero is found returns it, else returns undefined]
 */
NPC.getPatientZero = function(){
  for(var i = 0; i < npcs.length ; i++){
    if (npcs[i].isPatientZero){
        return npcs[i];
    }
  }
}