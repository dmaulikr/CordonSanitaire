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
// Live Database
// Parse.initialize("Og1SUamdseHSQXnX940SK3DrVVJHtb3efFyv4sqO", "f0R0Nv8JMxOrU5VoPnGrR43C5iFcJomeTIVnJi1J");

// Development Database
// Parse.initialize("se41N3nzbLBJ9oZFHrvhun7dGPK3tiLsj1mrey49", "ptVDEW3c1A3rGCotPgbBswc8Z0GtYrYIjvxDpZLn");// NOT IN USE
Parse.initialize("R2T7ReO7LkHmM8ASf11pqjyNJcYXPdVqAD09wWvC", "VLVfcK4ttzTdPo7fwXtexEbA6VnZ8wShmVhodTpE"); // CLONE
if (Parse.User.current() == null || !Parse.User.current().authenticated()){
    alert('You are not logged in');
    window.location = 'login.html'
}

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
var my_user = Parse.User.current()

// Then add new user (the current user)
var myUser = new User(
    my_user.id,
    my_user.get('x'),
    my_user.get('y'),
    my_user.get('role'),
    my_user.get('type'),
    false // isPatientZero
);

console.log("MY USEEEER " + myUser.type);

// pushes myUser to the database and sets its id to the be the database id.

function setup() {
    NPC.getAllFromDatabase(function() { // populate the npc array with the entries in the Database
        User.getAllFromDatabase(function() { // populate the people array with the entries in the Database
            setGameBoard(); // set the game board
            hasReceivedJoinedMessage = true; // with the game board set, we are allowed to update it.
            console.log("allowed to update");
            sendAddUserMessage(myUser.id);
        });
    });
}