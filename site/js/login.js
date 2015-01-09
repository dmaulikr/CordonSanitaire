//----------------------------
//          Parse
//----------------------------

// Development Database
// Parse.initialize("se41N3nzbLBJ9oZFHrvhun7dGPK3tiLsj1mrey49", "KVhOztk5uviXDqaeQHzRa8GhgA0YjtPz9awX5gvC");
Parse.initialize("R2T7ReO7LkHmM8ASf11pqjyNJcYXPdVqAD09wWvC", "VLVfcK4ttzTdPo7fwXtexEbA6VnZ8wShmVhodTpE");
// Javascript key: ptVDEW3c1A3rGCotPgbBswc8Z0GtYrYIjvxDpZLn


var getUsername = function(){
    return document.getElementById('username').value;
}

var getPassword = function(){
    return document.getElementById('password').value;
}

var login = function(){
    console.log("logging in");
    Parse.User.logIn(getUsername(), getPassword());
}

var signUp = function(){
    var user = new Parse.User();
    user.setUsername(getUsername());
    user.setPassword(getPassword());
    user.signUp(null, {
      success: function(user) {
        console.log("a new user signed up");
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });
}