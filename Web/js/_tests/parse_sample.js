			Parse.initialize("Og1SUamdseHSQXnX940SK3DrVVJHtb3efFyv4sqO", "f0R0Nv8JMxOrU5VoPnGrR43C5iFcJomeTIVnJi1J");

			var SimpleUser = Parse.Object.extend("SimpleUser");
			var simpleUser = new SimpleUser();
			 
			simpleUser.save({
			  x: 0.1337,
			  y: 0.6523,
			  playerName: "Sean Plott",
			  active: true
			}, {
			  success: function(simpleUser) {
			    // The object was saved successfully.
			  },
			  error: function(simpleUser, error) {
			    // The save failed.
			    // error is a Parse.Error with an error code and message.
			  }
			});
