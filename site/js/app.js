/* PubNub + Parse to keep track of a game state and update a page when changes are published
 *
 * by Jonathan Bobrow
 *
 */

var _channel = 'my_channel';
var _uuid = PUBNUB.uuid();

var updateFromParse = function() {

	var users = Parse.Object.extend("SimpleUser");
	var query = new Parse.Query(users);
	query.equalTo("present", true);
	query.find({
	  	success: function(results) {
		    // list contains the present players.
		    	console.log(results);
		    	console.log("# of present: " + results.length);
		    // draw this list of players across the screen.
		    for (var i = 0; i < results.length; i++) { 
		    	var object = results[i];
		    	console.log(object.id + ' - ' + object.get('playerID') + ' - ' + object.get('active'));
		    }
	  	},
		error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		    console.log("Error: " + error.code + " " + error.message);
		}
	});
}

//----------------------------
//		General Actions
//----------------------------

var setUserActiveState = function(isActive) {
	
	// something with parse to set the value inactive
	console.log("setting user inactive");
	
	var User = Parse.Object.extend("SimpleUser");
	var query = new Parse.Query(User);
	query.equalTo("playerID", _uuid);
	query.find(
	{
		success: function(result) 
		{
			var object = result[0];
			object.set("active", isActive);
			object.save(null, 
			{
				success:function (object)
				{
					// then update pubnub
					sendUpdateMessage();
					//console.log("WOAAAAHHHH YEAH", object);
				},
				error:function(object)
				{
					console.log("WOAAAAHHHH NOOOOOOO!", object);
				}
			});
		},
		error: function(error) {
		    console.log("Error: " + error.code + " " + error.message);
		}

	});
}

var setUserPresent = function(uuid) {
	
	// something with parse to set the value inactive
	console.log("setting user present");

	var User = Parse.Object.extend("SimpleUser");
	var query = new Parse.Query(User);
	query.equalTo("playerID", uuid);
	query.find({
		success: function(result) {
			var object = result[0];
			object.set("present", true);
			object.save();
		},
		error: function(error) {
		    console.log("Error: " + error.code + " " + error.message);
		}

	});

	// then update pubnub
	sendUpdateMessage();
}
//----------------------------
//			PubNub
//----------------------------

// Init
var pubnub = PUBNUB.init({
	keepalive     : 30,
	publish_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884',
	subscribe_key: 'sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe',
	uuid: _uuid
});

// Subscribe
pubnub.subscribe({
	channel: _channel,
	presence: function(m){
		//console.log(m)
		switch(m.action){
			case "join":
				// set the UUID here
				console.log("join - UUID - " + m.uuid);
			break;

			case "leave":
				// set this user to no longer focussed...
				console.log("leave - UUID - " + m.uuid);
			break;

			default: console.log(m.action);	
		}
	},
	message: function(m){
		switch(m) {

			case "update":
				console.log("update the page to the latest from parse db");
				updateFromParse();
			break;

			case "start":
				console.log("start the game");
				startTheClock();
			break;

			case "end":
				console.log("end the game");
			break;

			default: console.log(m);
		}
	}
});

// Unsubscribe when closing the window
window.onbeforeunload = function() {
    return pubnub.unsubscribe({
    	channel : _channel
 		});
}

// window.onunload = function() {
//     return pubnub.unsubscribe({
//     	channel : _channel,
//  		});
// };

// Publish
var sendUpdateMessage = function() {
	pubnub.publish({
	 channel: _channel,
	 message: 'update'
	});
}

//----------------------------
//			Parse
//----------------------------

// Init
Parse.initialize("Og1SUamdseHSQXnX940SK3DrVVJHtb3efFyv4sqO", "f0R0Nv8JMxOrU5VoPnGrR43C5iFcJomeTIVnJi1J");

// Then add new user
var SimpleUser = Parse.Object.extend("SimpleUser");
var simpleUser = new SimpleUser();
 
simpleUser.save({
  playerID: _uuid,
  x: Math.random(0,1),
  y: Math.random(0,1),
  role: "citizen",
  active: false,
  present: true
}, {
  success: function(simpleUser) {
    // The object was saved successfully.
  },
  error: function(simpleUser, error) {
    // The save failed.
    // error is a Parse.Error with an error code and message.
  }
});
