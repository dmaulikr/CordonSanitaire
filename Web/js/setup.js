/* PubNub + Parse to keep track of a game state and update a page when changes are published
 *
 * by Jonathan Bobrow
 *
 */
// check if user is logged

// MOBILE PHONE MESSAGE
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
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
// Development Database
// Application ID | JavaScript Key
Parse.initialize("19YpaULveFMX1b6KUJBcSFeA2w25m8pPv2TUvJ8d", "V0UzvaJeICf0GJ37irtDA2KLLcKXCUSOMj74UWVA"); // CLONE
if (Parse.User.current() == null || !Parse.User.current().authenticated()){
    alert('You are not logged in');
    Parse.User.logOut();
    window.location = 'login.html'
} else {
    Parse.User.current().set('present', true);
    Parse.User.current().save();
}


// Get the game configs from Parse
Parse.Config.get().then(function(config) {

    NUM_REQUIRED_PLAYERS = config.get("numRequiredPlayers");
    DEFAULT_DURATION = config.get("gameDuration");

    console.log("loaded configuration from Parse.");
}, function(error) {
    // Something went wrong (e.g. request timed out)
    console.log("failed to load config from Parse.")
});



// sets Pubnub channel
// var _channel = 'production'; // Dev Channel vs. Production Channel
var _channel = 'development'; // Dev Channel vs. Production Channel

// defines global variables
var _uuid = PUBNUB.uuid();
var hasReceivedJoinedMessage = false;
var people = [];
var npcs = [];
var center; // point that represents the center of the population (holding)
var patient_zero;
var myUser;

Parse.User.current().fetch().then( function(current_user){
    // Then creates myUser with the data
    myUser = new User(
        current_user.id,
        current_user.get('x'),
        current_user.get('y'),
        current_user.get('role'),
        current_user.get('type'),
        false // isPatientZero
    );

    // run setup after existing :)
    console.log("setting up after creating my own object from Parse");
    setup();
});

function setup() {
    NPC.getAllFromDatabase(function() { // populate the npc array with the entries in the Database
        User.getAllFromDatabase(function() { // populate the people array with the entries in the Database
            setGameBoard(); // set the game board
            hasReceivedJoinedMessage = true; // with the game board set, we are allowed to update it.
            console.log("allowed to update");
            sendAddUserMessage(myUser.id);

            ping(); // let parse know we just loaded the page
        });
    });
}