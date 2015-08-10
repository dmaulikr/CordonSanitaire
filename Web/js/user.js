/* User class object */

/**
 * Constructor for User Class
 */
var User = function (id, x, y, role, type, isPatientZero) {
    this.id = id; // id will be attributed once the object is pushed to the database
    this.x = x;
    this.y = y;
    this.coords = getLatLngCoords(this.x, this.y);
    this.role = role;
    this.type = type;
    this.isPatientZero = isPatientZero;
    this.marker = null;
    this.score = 0; // used for keeping track of how well they do
};

/**
 * Draws a User into the map
 */
User.prototype.draw = function () {
    var coords = getLatLngCoords(this.x, this.y);

    // if there's no marker, create one.
    if (this.marker == null) {
        // creates a new marker for the users and adds it to the map
        var marker_obj = new google.maps.Marker({
            position: coords,
            icon: getMarkerIcon(this.type), // depends on the type of the users
            map: map,
        });

        // sets the users marker to the created marker
        this.marker = marker_obj;

    }
    // if there's a marker just change the icon
    else
        this.marker.setIcon(getMarkerIcon(this.type));
};

/**
 * Erases a User from the map
 */
User.prototype.erase = function () {
    this.marker.setMap(null);
};

/**
 * Returns whether a user is active or not.
 * @return boolean [true if the the user is active, false otherwise]
 */
User.prototype.isActive = function () {
    return this.type == TypeEnum.ACTIVE
};

User.prototype.isUserMe = function () {
    return this.id == myUser.id;
};

/**
 * Updates the type of this user
 * @param  {TypeEnum} type
 */
User.prototype.updateType = function (type) {
    this.type = type;
};

User.prototype.actionLabel = function (text, color, duration) {
    var coords = getLatLngCoords(this.x, this.y);

    var labelOptions = {
        content: text,
        boxStyle: {

            textAlign: "center",
            fontSize: "8pt",
            fontWeight: "bold",
            backgroundColor: color,
            border: "4px solid rgba(0,0,0,.8)",
            borderRadius: "10px",
            padding: "5px 5px 5px 5px",
            width: "100 px"
        },
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(-55, -45),
        position: coords,
        closeBoxURL: "",
        isHidden: false,
        pane: "mapPane",
        enableEventPropagation: true,
    };

    // add a timed animation for show and hide that lasts the "duration"

    var userLabel = new InfoBox(labelOptions);
    userLabel.open(map);


    window.setInterval(function() {
        userLabel.close(map);
        },
        duration);

    //delete(userLabel);
};


User.prototype.labelWithYouAreHere = function () {

    var coords = getLatLngCoords(this.x, this.y);
    var labelText = "YOU ARE HERE";

    var myOptions = {
        content: labelText,
        boxStyle: {
            textAlign: "center",
            fontSize: "8pt",
            fontWeight: "bold",
            backgroundColor: "white",
            border: "4px solid rgba(0,0,0,.8)",
            borderRadius: "10px",
            padding: "5px 0 5px 0",
            width: "100px"
        },
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(-55, 20),
        position: coords,
        closeBoxURL: "",
        isHidden: false,
        pane: "mapPane",
        enableEventPropagation: true
    };

    var ibLabel = new InfoBox(myOptions);
    ibLabel.open(map);

};

/**
 * Repopulates the local array of Users with all the entries from the database.
 */
User.getAllFromDatabase = function (callback) {
    User.eraseAll();
    people.clear;
    var user = Parse.Object.extend("_User");
    var query = new Parse.Query(user);
    query.equalTo('present', true);
    query.find({
        success: function (results) {
            console.log("Success: Getting people");
            // draw this list of players across the screen.
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                // create a local user
                var user = new User(
                    object.id,
                    object.get('x'),
                    object.get('y'),
                    object.get('role'),
                    object.get('type'),
                    object.get('isPatientZero')
                );

                people.push(user);
            }

            console.log("synchronized people array with database");
            if (callback != null) {
                console.log("calling callback");
                callback();
            }
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            console.log("Error: " + error.code + " " + error.message);
        }
    });
};

/**
 * Checks wheter an certain ID exists in the local array of Users.
 * @param  id [the id to be found]
 * @return boolean [wheter the id exist or not]
 */
User.isIdPresent = function (id) {
    for (var i = 0; i < people.length; i++) {
        if (people[i].id == id) {
            return true;
        }
    }
    return false;
};

/**
 * Adds an User to the local array of Users.
 * @param id [id of the User in the database]
 */
User.addToLocalArray = function (id) {
    var user = Parse.Object.extend("_User");
    var query = new Parse.Query(user);
    query.get(id, {
        success: function (object) {
            console.log("Success: Getting User");

            // create a local user
            var user = new User(
                object.id,
                object.get('x'),
                object.get('y'),
                object.get('role'),
                object.get('type'),
                object.get('isPatientZero')
            );

            // if id is not in the local array, add to local array
            if (!User.isIdPresent(user.id)) {
                people.push(user);
            }

            updateGameBoard();

        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            console.log("Error: " + error.code + " " + error.message);
        }
    });
};

/**
 * Removes an User from the local array of people.
 * @param id [id of the User to be removed]
 */
User.removeFromLocalArray = function (id) {
    for (var i = 0; i < people.length; i++) {
        if (people[i].id == id) {
            if (people[i].marker != null) {
                console.log("remove marker");
                people[i].marker.setMap(null);
            }
            people.splice(i, 1);
            updateGameBoard();
        }
    }
};

/**
 * Changes the type of an User in the local array of Users.
 * @param   id      [id of the User that will have its type changed]
 * @param   type    [the new type of the User]
 * @return  boolean [true if the change was successful, false otherwise]
 */
User.changeUserType = function (id, type) {

    // add a notification to the user letting people know what's up
    var usr = User.getPersonById(id);
    //switch(type){
    //    case "active": break;
    //    case "passive": break;
    //    case "contained": break;
    //    default: break;
    //}
    usr.actionLabel("Hello! Is anybody out there? Testing, 1, 2...", "#FFAA00", 2000);


    for (var i = 0; i < people.length; i++) {
        if (people[i].id == id) {
            people[i].type = type;
            updateGameBoard();
            return true;
        }
    }

    return false;
};

User.getPersonById = function (id) {
    for (var i = 0; i < people.length; i++) {
        if (people[i].id == id)
            return people[i];
    }

    console.log("DID NOT FIND PERSON FOR UUID");
};

/**
 * Erase all users from the map (delete their markers).
 */
User.eraseAll = function () {
    for (var i = 0; i < people.length; i++) {
        people[i].erase();
    }
};