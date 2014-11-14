/* Parse functions */
function parseInit()
{
	Parse.initialize("Og1SUamdseHSQXnX940SK3DrVVJHtb3efFyv4sqO", "f0R0Nv8JMxOrU5VoPnGrR43C5iFcJomeTIVnJi1J");
}

function createAlphaUser()
{
	var SimpleUser = new Parse.Object.extend("SimpleUser");
	var newUser = new SimpleUser();
	// newUser.set("username", "testing");
	// newUser.set("x_coord", .52542);
	// newUser.set("y_coord", .52542);
	newUser.save( {"username", "testing"},       
	success: function(object) {
        $(".success").show();
    },
    error: function(model, error) {
        $(".error").show();
    });
}

function createNewUser(name, xcoord, ycoord)
{
	var user = new Parse.User();
	user.set("username", name);
	//user.set("password", "my pass");
	//user.set("email", "email@example.com");
	 
	// set user location
	user.set("x_coord", xcoord);
	user.set("y_coord", ycoord);
	 
	user.signUp(null, {
	  success: function(user) {
	    // Hooray! Let them use the app now.
	    alert("Success, user signed up :)");
	  },
	  error: function(user, error) {
	    // Show the error message somewhere and let the user try again.
	    alert("Error: " + error.code + " " + error.message);
	  }
	});
}