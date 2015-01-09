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
    Parse.User.logIn(getUsername(), getPassword(), {
      success: function(user) {
        console.log("a user logged in");
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        alert("Error: " + error.code + " " + error.message);
      }
    });
}

var signUp = function(){
    Parse.User.signUp(getUsername(), getPassword(), null, {
      success: function(user) {
        console.log("a new user signed up");
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });
}