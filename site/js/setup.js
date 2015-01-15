/* PubNub + Parse to keep track of a game state and update a page when changes are published
 *
 * by Jonathan Bobrow
 *
 */

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

// sets Pubnub channel
// var _channel = 'production'; // Dev Channel vs. Production Channel
var _channel = 'development'; // Dev Channel vs. Production Channel

// defines global variables
var _uuid = PUBNUB.uuid();
var hasReceivedJoinedMessage = false;
var people = [];
var npcs = [];
var center; // point that represents the center of the population (holding)


// Then add new user (the current user)
var myUser = new User(Math.random(0, 1),
  Math.random(0, 1),
  "citizen",
  TypeEnum.PASSIVE,
  false
);

// pushes myUser to the database and sets its id to the be the database id.
myUser.pushToDatabase(function(){
    myUser.id = this.id
});
// console.log("myUser id:" + myUser.id);

function setup(callback) {
    // callback setup: it will only draw the map after it has gotten the NPC and User data from the Database
    NPC.getAllFromDatabase(function() { // populate the npc array with the entries in the Database
        User.getAllFromDatabase(function() { // populate the people array with the entries in the Database
            drawMap(); // draw map
            console.log("setting up");
            console.log("calling setup callback");
            callback();
        });
    });
}