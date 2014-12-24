/* PubNub + Parse to keep track of a game state and update a page when changes are published
 *
 * by Jonathan Bobrow
 *
 */

// MOBILE PHONE MESSAGE
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 // Redirect to Mobile Phone message;
 window.location = "http://playful.jonathanbobrow.com/prototypes/cordonsans/mobile/"
}
// Only on Chrome for now
if (!window.chrome) {
	window.location = "http://playful.jonathanbobrow.com/prototypes/cordonsans/unsupported/"
}


var _channel = 'my_channel';
var _uuid = PUBNUB.uuid();
var people = [];
var center;			// point that represents the center of the population (holding)

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
		    	//console.log(object.id + ' - ' + object.get('playerID') + ' - ' + object.get('active'));
		    }
		
			// When done updating from parse, then we update the population
			updatePopulation();
		    
	  	},
		error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		    console.log("Error: " + error.code + " " + error.message);
		}
	});
}

//----------------------------
// Map stuffs
//----------------------------

var pickPatientZero = function() {
	// something with parse to set the value inactive
	console.log("picking patient zero");

	var uuid = people[Math.floor(Math.random() * people.length)].id;
	console.log("picked" + uuid);

	var users = Parse.Object.extend("SimpleUser");
	var query = new Parse.Query(users);
	query.equalTo("present", true);
	query.find({
	  	success: function(results) {
	  		// look through all present people
		    for (var i = 0; i < results.length; i++) { 
			    
		    	var object = results[i];
		    	
		    	if(object.get('playerID') == uuid)
		    		object.set('isPatientZero', true);
		    	else
		    		object.set('isPatientZero', false);
		    	
		    	if(i != results.length - 1)
		    		object.save();
		    	else
					object.save(null, 	// update after the last one is saved
					{
						success:function (object)
						{
							// let the others know we have picked a new patient zero
							sendUpdateMessage();
							//console.log("WOAAAAHHHH YEAH", object);
						},
						error:function(object)
						{
							console.log("WOAAAAHHHH NOOOOOOO!", object);
						}
					});
			}

		},
		error: function(error) {
		    console.log("Error: " + error.code + " " + error.message);
		}

	});
}


var updatePopulation = function(){
	people.clear();

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

		    	// place useful data into a local object
		    	var obj = {
		    		x: object.get('x'),
		    		y: object.get('y'),
		    		id: object.get('playerID'),
		    		active: object.get('active'),
		    		role: object.get('role'),
		    		isPatientZero: object.get('isPatientZero')
		    	};

			    people.push(obj);
		    }

		    displayGameState();
	  	},
		error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		    console.log("Error: " + error.code + " " + error.message);
		}
	});
}

var displayGameState = function() {
	
    // draw border
    // draw all people
    updateGameBoard();
    
    // print debug info
    //printDebugData();

    //paper.drawPeopleInBorder(people);
    //paper.drawPatientZero();
}

// find center of active people
var findCenter = function() {

    var total = {x:0, y:0};
    center = {x:0, y:0};

    for(var i=0; i<people.length; i++) {
	    if(people.isActive) {
		    total.x += people[i].x;
		    total.y += people[i].y;
      	}
    }
    
    center.x = total.x / people.length;
    center.y = total.y / people.length;  
}

// sort people
var sortPeople = function() {
	var sortedPeople = [];
	sortedPeople.clear();

	var lastPerson = people[0];
	sortedPeople.push(lastPerson);

	for(var i=0; i<people.length; i++) {
		var nextPerson = getNextPersonCounterClockwise(lastPerson);
		sortedPeople.push(nextPerson);
		lastPerson = nextPerson;
	}

	people = sortedPeople;
}

var getNextPersonCounterClockwise = function(p) {

    var min = 2*Math.PI;	// max angle
    var index = 0;
    
    var start_theta = Math.atan2((p.y - center.y), (p.x - center.x));
    
    for(var i=0; i<people.length; i++) {
      
    	if(people[i] == p)
        	continue;
        
    	var p_theta = Math.atan2((people[i].y - center.y), (people[i].x - center.x));
	    var diff = p_theta - start_theta;

	    if(diff < 0)
	    	diff += 2*Math.PI;
	      
	    if(diff < min) {
	    	index = i;
	    	min = diff;
	    }  
    }

	return people[index];
}

var printDebugData = function() {

	var string = "<ol><li>center: " + center.x + ", " + center.y+"</li>";
    
    for(var i=0; i<people.length; i++) {
    	string += "<li>person " + i + " location " + people[i].x + ", " + people[i].y + "</li>";
    }
    string += "</ol>";
    document.getElementById("debug_data").innerHTML = string;

}

//----------------------------
//		Modal Window
//----------------------------
var dialog = document.querySelector('dialog');
dialog.showModal();

var close = document.querySelector('#close');
close.onclick = function() {
	dialog.close();
};

var showEndGameMessage = function() {

	if(isPatientZeroContained()) {
		document.getElementById("end_game").innerHTML = "Congratulations, you have successfully contained patient zero, providing safety to millions.";
	}
	else {
		document.getElementById("end_game").innerHTML = "Warning! Patient zero is still on the loose, the emergency response team has failed to collaborate and contain. Can you work better and faster next time?";
	}
		
	document.getElementById("end_game").style.visibility = "visible";
}

//----------------------------
//		General Actions
//----------------------------

var setUserActiveState = function(isActive) {
	
	// something with parse to set the value inactive
	console.log("setting user state");
	
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

var flipUserActiveState = function() {
	
	// something with parse to set the value inactive
	console.log("flipping user state");
	
	var User = Parse.Object.extend("SimpleUser");
	var query = new Parse.Query(User);
	query.equalTo("playerID", _uuid);
	query.find(
	{
		success: function(result) 
		{
			var object = result[0];
			var state = object.get("active");
			state = !state;
			object.set("active", state);
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

// reset all of the players back to no-one playing
var setAllUsersNotPresent = function() {
	
	var users = Parse.Object.extend("SimpleUser");
	var query = new Parse.Query(users);
	query.equalTo("present", true);
	query.find({
	  	success: function(results) {
			for (var i = 0; i < results.length; i++) { 
		    	var object = results[i];
		    	object.set("present", false);
				
				if(i != results.length - 1)
		    		object.save();
		    	else
					object.save(null, 	// update after the last one is saved
					{
						success:function (object)
						{
							// let the others know we have picked a new patient zero
							sendUpdateMessage();
							//console.log("WOAAAAHHHH YEAH", object);
						},
						error:function(object)
						{
							console.log("WOAAAAHHHH NOOOOOOO!", object);
						}
					});
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
				updatePopulation();
			break;

			case "leave":
				// set this user to no longer focussed...
				console.log("leave - UUID - " + m.uuid);
				updatePopulation();
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

// send start message
var sendStartOfGame = function() {
	pubnub.publish({
	 channel: _channel,
	 message: 'start'
	});
}


//----------------------------
//			Utility
//----------------------------
Array.prototype.clear = function() {
  while (this.length > 0) {
    this.pop();
  }
};

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
  present: true,
  isPatientZero: false
}, {
  success: function(simpleUser) {
    // The object was saved successfully.
  },
  error: function(simpleUser, error) {
    // The save failed.
    // error is a Parse.Error with an error code and message.
  }
});
