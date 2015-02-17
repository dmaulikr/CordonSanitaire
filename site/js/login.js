//----------------------------
//          Parse
//----------------------------

// Development Database
// Parse.initialize("se41N3nzbLBJ9oZFHrvhun7dGPK3tiLsj1mrey49", "KVhOztk5uviXDqaeQHzRa8GhgA0YjtPz9awX5gvC");
Parse.initialize("R2T7ReO7LkHmM8ASf11pqjyNJcYXPdVqAD09wWvC", "VLVfcK4ttzTdPo7fwXtexEbA6VnZ8wShmVhodTpE");
// Javascript key: ptVDEW3c1A3rGCotPgbBswc8Z0GtYrYIjvxDpZLn

if (Parse.User.current() != null) {
    alert("You are already logged in! Let's play!")
    window.location = "/prototypes/cordonsans/index.html"	// this path is necessary for the online location
}

// check start time from parse
var game = Parse.Object.extend("Game");
var query = new Parse.Query(game);
query.find({
    success: function(results) {
        //        console.log(results);

        // get the last time in the stack
        // TODO: get the next time i.e. smallest positive difference from now and then use that time and the start time. This will allow setting up days worth of playtest start times, without having to change anything
        var gameObject = results[results.length - 1];
        parse_start_date = gameObject.get('startTime');
        console.log(parse_start_date);

        // create a timer status loop
        timerStatusUpdate();
    },
    error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
        console.log("Error: " + error.code + " " + error.message);
    }
});

function timerStatusUpdate() {

    //
    statusInterval = setInterval(function() {

        var cur_date = new Date();
        var synchedTime = new Date(cur_date.getTime())
        var cur_hour = synchedTime.getUTCHours();
        var cur_min = synchedTime.getUTCMinutes();
        var cur_sec = synchedTime.getUTCSeconds();

        var start_hour = parse_start_date.getUTCHours();
        var start_min = parse_start_date.getUTCMinutes();
        var start_sec = parse_start_date.getUTCSeconds();

        var dif_hour = start_hour - cur_hour;
        var dif_min = start_min - cur_min;
        var dif_sec = start_sec - cur_sec;

        total_seconds = dif_hour * 60 * 60 + dif_min * 60 + dif_sec;

        if (total_seconds > 0)
            document.getElementById("first_line").innerHTML = "The next game starts in <b>" + total_seconds + "</b> seconds.";
        else if (total_seconds <= 0 && total_seconds > -45)
            document.getElementById("first_line").innerHTML = "Hurry up! The game is in progress!";
        else
            document.getElementById("first_line").innerHTML = "There's no game scheduled, but stay tuned - the next infection is coming!";

    }, 100);

}

function login(evnt) {
    evnt = evnt || window.event;

    var username = document.getElementById('username-login').value;
    var password = document.getElementById('password-login').value;

    Parse.User.logIn(username, password, {
        success: function(user) {
            console.log("a user logged in");
            user.set({
                present: true,
                type: "passive"
            });
            user.save();
            window.location = "/prototypes/cordonsans/index.html";	// this path is necessary for the online location
        },
        error: function(user, error) {
            // The login failed. Check error to see why.
            alert("Error: " + error.code + " " + error.message);
        }
    });

    evnt.preventDefault();
}

function signUp(evnt) {
    evnt = evnt || window.event;

    var username = document.getElementById('username-signup').value;
    var password = document.getElementById('password-signup').value;
    var email = document.getElementById('email-signup').value;

    Parse.User.signUp(username, password, {
        email: email,
        x: Math.random(0, 1),
        y: Math.random(0, 1),
        role: "citizen",
        type: "passive",
        present: true,
        admin: false
    }, {
        success: function(user) {
            console.log("a new user signed up");
            alert("Thank you for signning up. You will now be redirected to Cordon Sanitaire!");
            window.location = "/prototypes/cordonsans/index.html";	// this path is necessary for the online location
        },
        error: function(user, error) {
            // Show the error message somewhere and let the user try again.
            alert("Error: " + error.code + " " + error.message);
        }
    });

    evnt.preventDefault();
}

function resetPassword(evnt) {
    console.log("reseting..")
    evnt = evnt || window.event;
    var email = document.getElementById('email-reset').value;
    Parse.User.requestPasswordReset(email, {
        success: function() {
            console.log("sucess");
            alert("A reset link was sent to " + email);
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    })
    evnt.preventDefault();
}