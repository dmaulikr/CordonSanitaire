/* PubNub + Parse to keep track of a game state and update a page when changes are published
 *
 * by Jonathan Bobrow
 *
 */

// MOBILE PHONE MESSAGE
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 // Redirect to Mobile Phone message;
 //window.location = "http://playful.jonathanbobrow.com/prototypes/cordonsans/mobile/"
}
// CHROME ONLY
if (!window.chrome) {
//  window.location = "http://playful.jonathanbobrow.com/prototypes/cordonsans/unsupported/"
}

var isWindowInFocus = true;

// NOTIFY USER WITH AN ALERT IF THE GAME IS STARTING AND THEY NAVIGATE AWAY
// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

// If the page is hidden, pause the video;
// if the page is shown, play the video
function handleVisibilityChange() {
    if (document[hidden]) {
        isWindowInFocus = false;
        console.log("window out of focus");
    } else {
        isWindowInFocus = true;
        console.log("window in focus");
    }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" ||
  typeof document[hidden] === "undefined") {
  alert("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  // Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}


//----------------------------
//          Parse
//----------------------------

// Init
// Live Database
Parse.initialize("Og1SUamdseHSQXnX940SK3DrVVJHtb3efFyv4sqO", "f0R0Nv8JMxOrU5VoPnGrR43C5iFcJomeTIVnJi1J");

// Development Database
// Parse.initialize("se41N3nzbLBJ9oZFHrvhun7dGPK3tiLsj1mrey49", "ptVDEW3c1A3rGCotPgbBswc8Z0GtYrYIjvxDpZLn");// NOT IN USE
// Parse.initialize("R2T7ReO7LkHmM8ASf11pqjyNJcYXPdVqAD09wWvC", "VLVfcK4ttzTdPo7fwXtexEbA6VnZ8wShmVhodTpE");// CLONE

var _channel = 'production'; // Dev Channel vs. Production Channel
// var _channel = 'development';   // Dev Channel vs. Production Channel
var _uuid = PUBNUB.uuid();
var hasReceivedJoinedMessage = false;
var people = [];
var npcs = [];
var center;         // point that represents the center of the population (holding)

NPC.getAllFromDatabase();

//----------------------------
// Map stuffs
//----------------------------

var pickPatientZero = function() {
    // something with parse to set the value inactive
    console.log("picking patient zero");

    var uuid = people[Math.floor(Math.random() * people.length)].id;
    console.log("picked" + uuid);

    var users = Parse.Object.extend("SimpleUser");
    var query = new Parse.Query(users);
    query.equalTo("present", true);
    query.find({
        success: function(results) {
            // look through all present people
            for (var i = 0; i < results.length; i++) {

                var object = results[i];

                if(object.get('playerID') == uuid)
                    object.set('isPatientZero', true);
                else
                    object.set('isPatientZero', false);

                if(i != results.length - 1)
                    object.save();
                else
                    object.save(null,   // update after the last one is saved
                    {
                        success:function (object)
                        {
                            // let the others know we have picked a new patient zero
                            sendUpdateMessage();
                            //console.log("WOAAAAHHHH YEAH", object);
                        },
                        error:function(object)
                        {
                            console.log("WOAAAAHHHH NOOOOOOO!", object);
                        }
                    });
            }

        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }

    });
}

var flipPlayerState = function(id, state){
    console.log("adding player to the quarantine");
    var person = popPerson(id);
    if (person.active == state)
        console.log('no changes were made to the player ' + id);
    else{
        person.active = state;
        people.push(person);
    }
    updateGameBoard();
}


var updatePopulation = function(){

    if(!hasReceivedJoinedMessage) return; // only update after we have added ourselves to the population

    people.clear();

    var users = Parse.Object.extend("SimpleUser");
    var query = new Parse.Query(users);
    query.equalTo("present", true);
    query.find({
        success: function(results) {
            console.log("Success: Update population - get present");
            // draw this list of players across the screen.
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                // place useful data into a local object
                var obj = {
                    x: object.get('x'),
                    y: object.get('y'),
                    id: object.get('playerID'),
                    active: object.get('active'),
                    role: object.get('role'),
                    isPatientZero: object.get('isPatientZero')
                };

//              console.log("placing person at (" + obj.x + ", " + obj.y + ")");

                people.push(obj);
            }

            updateGameBoard();
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            console.log("Error: " + error.code + " " + error.message);
        }
    });
}

// find center of active people
var findCenter = function() {

    var numPeopleHolding = 0;
    var total = {x:0, y:0};
    center = {x:0, y:0};

    for(var i=0; i<people.length; i++) {
        if(people[i].active) {
            total.x += people[i].x;
            total.y += people[i].y;
            numPeopleHolding++;
        }
    }

    if( numPeopleHolding > 0 ) {
        center.x = total.x / numPeopleHolding;
        center.y = total.y / numPeopleHolding;
    }

//     console.log("Found center: (" + center.x + ", " + center.y + ")");
}


// sort people
var sortPeople = function() {

    var sortedPeople = [];
    sortedPeople.clear();

    var lastPerson = people[0];
    sortedPeople.push(lastPerson);

    for(var i=0; i<people.length - 1; i++) {
        var nextPerson = getNextPersonCounterClockwise(lastPerson);
        sortedPeople.push(nextPerson);
        lastPerson = nextPerson;
    }

    people = sortedPeople;
}


var getNextPersonCounterClockwise = function(p) {

    var min = 2*Math.PI;    // max angle
    var index = 0;

    var start_theta = Math.atan2((p.y - center.y), (p.x - center.x));

    for(var i=0; i<people.length; i++) {

        if(people[i] == p)
            continue;

        var p_theta = Math.atan2((people[i].y - center.y), (people[i].x - center.x));
        var diff = p_theta - start_theta;

        if(diff < 0)
            diff += 2*Math.PI;

        if(diff < min) {
            index = i;
            min = diff;
        }
    }

    return people[index];
}


var printDebugData = function() {

    var string = "<ol><li>center: " + center.x + ", " + center.y+"</li>";

    for(var i=0; i<people.length; i++) {
        string += "<li>person " + i + " location " + people[i].x + ", " + people[i].y + "</li>";
    }
    string += "</ol>";
    document.getElementById("debug_data").innerHTML = string;

}


//----------------------------
//      Modal Window
//----------------------------
/*
var dialog = document.querySelector('dialog');
dialog.showModal();
*/


var close = document.querySelector('#close');
close.onclick = function() {
    if(isUserAllowedToStart()) {
        // hide intro view
        document.getElementById("overlay").style.visibility = 'hidden';
    }
};


// end of game pop up
var showEndGameMessage = function() {

    var end_game_text = "";
    var numTrapped = countCasualties();
    var totalArea = getAreaQuarantined();
    var numJoined = countActivePeople();
    var numPresent = people.length - 1; // ignore the Patient Zero

    if(isPatientZeroContained()) {

        end_game_text = "Patient Zero has been contained";

        // update count of casualties
        if(numTrapped == 0) {
            end_game_text += " with only a few healthy people trapped inside the quarantine.";
        }
        else if(numTrapped > 0 && numTrapped < 5) {
            end_game_text += " (along with ";
            end_game_text += numTrapped;
            end_game_text += " heathy people, sadly.)"
        }
        else if(numTrapped > 5) {
            end_game_text += ", but ";
            end_game_text += numTrapped;
            end_game_text += " healthy people are trapped inside the quarantine!"
        }

        // comment on quarantine total area
/*
        if(totalArea < 11) {
            end_game_text += " You also managed to contain the patient in an area less than half the size of Manhattan.";
        }
        else if(totalArea >= 11 && totalArea <= 22.7) {
            end_game_text += " It took a quarantine nearly the size of Manhattan to contain patient zero.";
        }
        else if(totalArea >= 22.7) {
            end_game_text += " 9 million people could be affected, the quarantine amasses larger than the size of Manhattan.";
        }
*/

        // comment on number of people quarantining
        if(numJoined < 3) {
            end_game_text += " Looks like not enough poeple committed to quarantining Patient Zero.";
        }
        else if(numJoined >= 3 ) {
            end_game_text += " ";
            end_game_text += numJoined;
            end_game_text += " people successfully formed the front line.";
        }
/*
        else if(numJoined > 8) {
            end_game_text += " Remember, you don't need that many people to contain the outbreak, just the right ones!";
        }
*/

        end_game_text += " Quarantines depend on everyone... The next outbreak is tomorrow.";

    }
    else {
        end_game_text = "";
        end_game_text += numJoined;
        end_game_text += " formed the quarantine line, but Patient Zero is outside it! Everyone has failed to contain the infection (you all lose!)";

        // update count of casualties
        if(numTrapped == 0) {
            //end_game_text += " At least you didn't trap healthy people inside.";
        }
        else if(numTrapped > 0 ) {
            end_game_text += " Not only is Patient Zero on the loose, but ";
            end_game_text += numTrapped;
            end_game_text += " people are trapped inside inside the quarantine."
        }
/*
        else if(numTrapped > 5) {
            end_game_text += "With ";
            end_game_text += numTrapped;
            end_game_text += " healthy people trapped inside, the team needs to work better together."
        }
*/

/*
        // comment on quarantine total area
        if(totalArea < 11) {
            end_game_text += " You also managed to contain the patient in an area less than half the size of Manhattan.";
        }
        else if(totalArea >= 11 && totalArea <= 22.7) {
            end_game_text += " It took a quarantine nearly the size of Manhattan to contain patient zero.";
        }
        else if(totalArea >= 22.7) {
            end_game_text += " 9 million people could be affected, the quarantine amasses larger than the size of Manhattan.";
        }
*/

        // comment on number of people quarantining
        if(numJoined < 3) {
            end_game_text += " Looks like a quarantine wasn’t formed. We need 3 people to form it.";
        }
/*
        else if(numJoined >= 3 && numJoined <= 8) {
            end_game_text += " You had the right idea, the fewer people on the front lines, the fewer in contact with patient zero.";
        }
        else if(numJoined > 8) {
            end_game_text += " Remember, you don't need that many people to contain the outbreak, <b>just the right ones!</b>";
        }
*/


		end_game_text += " This particular infection wasn’t contained. But there’s a new one tomorrow.";
	}

	document.getElementById("end_game").innerHTML = end_game_text;
	document.getElementById("end_game").style.visibility = "visible";
	document.getElementById("patient_zero").style.visibility = 'hidden';

}

// missed the game pop up
var showMissedGameMessage = function() {
	var missed_game_text = "";

	if(isPatientZeroContained()) {
		missed_game_text = "Too Late! Quarantines depend on everyone... The next outbreak is tomorrow.";
	}
	else {
		missed_game_text = "Too Late! This particular infection wasn’t contained... But there’s a new one tomorrow.";
	}
	document.getElementById("end_game").innerHTML = missed_game_text;
	document.getElementById("end_game").style.visibility = "visible";
	document.getElementById("patient_zero").style.visibility = 'hidden';
}


//----------------------------
//      General Actions
//----------------------------

var flipUserActiveState = function() {
    // something with parse to set the value inactive
    console.log("flipping user state");

    var User = Parse.Object.extend("SimpleUser");
    var query = new Parse.Query(User);
    query.equalTo("playerID", _uuid);
    query.find(
    {
        success: function(result)
        {
            var object = result[0];
            var state = object.get("active");
            state = !state;

            //show an alert notification, testing
/*
            if(state)
                ohSnap('YOU HAVE JOINED THE QUARANTINE', 'yellow');
            else
                ohSnap('YOU ARE STANDING BY', 'black');
*/

            object.set("active", state);
            object.save(null,
            {
                success:function (object)
                {
                    var id = object.get('playerID');
                    // then update pubnub
                    sendFlipStateMessage(id, state);

                    //console.log("WOAAAAHHHH YEAH", object);
                },
                error:function(object)
                {
                    console.log("WOAAAAHHHH NOOOOOOO!", object);
                }
            });
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }

    });
}


// reset all of the players back to no-one playing
var setAllUsersNotPresent = function() {

    var users = Parse.Object.extend("SimpleUser");
    var query = new Parse.Query(users);
    query.equalTo("present", true);
    query.find({
        success: function(results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                object.set("present", false);

                if(i != results.length - 1)
                    object.save();
                else
                    object.save(null,   // update after the last one is saved
                    {
                        success:function (object)
                        {
                            // let the others know we have picked a new patient zero
                            sendUpdateMessage();
                            //console.log("WOAAAAHHHH YEAH", object);
                        },
                        error:function(object)
                        {
                            console.log("WOAAAAHHHH NOOOOOOO!", object);
                        }
                    });
            }
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            console.log("Error: " + error.code + " " + error.message);
        }
    });
}

//----------------------------
//          Utility
//----------------------------
Array.prototype.clear = function() {
  while (this.length > 0) {
    this.pop();
  }
};

// Helper Functions

var popPerson = function(uuid) {

    for(var i=0; i<people.length; i++) {
        if(people[i].id == uuid){
            var person = people[i]
            people.splice(i, 1);
            return person;
        }
    }

    console.log("DID NOT FIND PERSON");
}

//-----------------------------
//		Setup
//
//	TODO: Move this to its own folder
//-----------------------------

// Then add new user
var SimpleUser = Parse.Object.extend("SimpleUser");
var simpleUser = new SimpleUser();

simpleUser.save({
  playerID: _uuid,
  x: Math.random(0,1),
  y: Math.random(0,1),
  role: "citizen",
  active: false,
  present: true,
  isPatientZero: false
}, {
  success: function(simpleUser) {
    // The object was saved successfully.
    console.log("Success: Added a new simple user");
  },
  error: function(simpleUser, error) {
    // The save failed.
    // error is a Parse.Error with an error code and message.
  }
});
