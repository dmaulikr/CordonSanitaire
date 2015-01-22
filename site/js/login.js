//----------------------------
//          Parse
//----------------------------

// Development Database
// Parse.initialize("se41N3nzbLBJ9oZFHrvhun7dGPK3tiLsj1mrey49", "KVhOztk5uviXDqaeQHzRa8GhgA0YjtPz9awX5gvC");
Parse.initialize("R2T7ReO7LkHmM8ASf11pqjyNJcYXPdVqAD09wWvC", "VLVfcK4ttzTdPo7fwXtexEbA6VnZ8wShmVhodTpE");
// Javascript key: ptVDEW3c1A3rGCotPgbBswc8Z0GtYrYIjvxDpZLn

if (Parse.User.current() != null){
  alert("You are already logged in! Let's play!")
  window.location = "/index.html"
}

var login = function(evnt){
    evnt = evnt || window.event;

    var username = document.getElementById('username-login').value;
    var password = document.getElementById('password-login').value;
    console.log(username)
    console.log(password)
    Parse.User.logIn(username, password, {
      success: function(user) {
        console.log("a user logged in");
        user.set({
          present: true,
          type : "passive"
        });
        user.save();
        window.location = "/index.html";
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        alert("Error: " + error.code + " " + error.message);
      }
    });

    evnt.preventDefault();
}

var signUp = function(evnt){
    evnt = evnt || window.event;

    var username = document.getElementById('username-signup').value;
    var password = document.getElementById('password-signup').value;
    var email = document.getElementById('email-signup').value;
    console.log(username)

    Parse.User.signUp(username, password, {
      email: email,
      x: Math.random(0,1),
      y: Math.random(0,1),
      role: "citizen",
      type: "passive",
      present: true
    }, {
      success: function(user) {
        console.log("a new user signed up");
        alert("Thank you for signning up. You will now be redirected to Cordon Sanitaire!");
        window.location = "/index.html";
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });

    evnt.preventDefault();
}