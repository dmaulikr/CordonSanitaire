//----------------------------
//          Parse
//----------------------------

// Development Database
// Application ID | JavaScript Key
Parse.initialize("19YpaULveFMX1b6KUJBcSFeA2w25m8pPv2TUvJ8d", "V0UzvaJeICf0GJ37irtDA2KLLcKXCUSOMj74UWVA"); // CLONE

if (Parse.User.current() != null) {
    alert("You are already logged in! Let's play!")
    window.location = "/cs_beta/index.html"	// this path is necessary for the online location
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
            window.location = "/cs_beta/index.html";	// this path is necessary for the online location
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
    var phone = document.getElementById('phone-signup').value;

    Parse.User.signUp(username, password, {
        email: email,
        phone: phone,
        x: Math.random(0, 1),
        y: Math.random(0, 1),
        role: "citizen",
        type: "passive",
        present: true,
        admin: false
    }, {
        success: function(user) {
            console.log("a new user signed up");
            alert("Welcome to the team. Get ready for the next Cordon Sanitaire!");
            window.location = "/cs_beta/index.html";	// this path is necessary for the online location
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