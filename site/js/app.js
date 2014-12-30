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
// CHROME ONLY
if (!window.chrome) {
	window.location = "http://playful.jonathanbobrow.com/prototypes/cordonsans/unsupported/"
}



var _channel = 'my_channel';
var _uuid = PUBNUB.uuid();
var hasReceivedJoinedMessage = false;
var people = [];
var center;			// point that represents the center of the population (holding)


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
	
	if(!hasReceivedJoinedMessage) return; // only update after we have added ourselves to the population
	
	people.clear();

	var users = Parse.Object.extend("SimpleUser");
	var query = new Parse.Query(users);
	query.equalTo("present", true);
	query.find({
	  	success: function(results) {
		  	console.log("Success: Update population - get present");
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
		    	
// 		    	console.log("placing person at (" + obj.x + ", " + obj.y + ")");

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
	
	// draw all things necessary... This function should clearly go. Get on it Jon
    updateGameBoard();
}


// find center of active people
var findCenter = function() {

	var numPeopleHolding = 0;
    var total = {x:0, y:0};
    center = {x:0, y:0};
        
    for(var i=0; i<people.length; i++) {
	    if(people[i].active) {
		    total.x += people[i].x;
		    total.y += people[i].y;
		    numPeopleHolding++;
      	}
    }

	if( numPeopleHolding > 0 ) {
	    center.x = total.x / numPeopleHolding;
	    center.y = total.y / numPeopleHolding;
    }
    
//     console.log("Found center: (" + center.x + ", " + center.y + ")");  
}


// sort people
var sortPeople = function() {
	
	var sortedPeople = [];
	sortedPeople.clear();

	var lastPerson = people[0];
	sortedPeople.push(lastPerson);

	for(var i=0; i<people.length - 1; i++) {
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
	if(isUserAllowedToStart())
		dialog.close();
};


// end of game pop up
var showEndGameMessage = function() {

	var end_game_text = "";
	var numTrapped = countCasualties();
	var totalArea = getAreaQuarantined();
	var numJoined = countActivePeople();
	
	if(isPatientZeroContained()) {
		
		end_game_text = "Congratulations, you have successfully contained patient zero, ";
		
		// update count of casualties
		if(numTrapped == 0) {
			end_game_text += "and managed to minimize trapping healthy people inside.";
		}
		else if(numTrapped > 0 && numTrapped < 5) {
			end_game_text += "but you trapped ";
			end_game_text += numTrapped;
			end_game_text += " healthy people inside." 
		}
		else if(numTrapped > 5) {
			end_game_text += "but you trapped a shocking ";	
			end_game_text += numTrapped;
			end_game_text += " healthy people inside." 
		}
		
		// comment on quarantine total area
		if(totalArea < 11) {
			end_game_text += " You also managed to contain the patient in an area less than half the size of Manhattan.";	
		}
		else if(totalArea >= 11 && totalArea <= 22.7) {
			end_game_text += " It took a quarantine nearly the size of Manhattan to contain patient zero.";				
		}
		else if(totalArea >= 22.7) {
			end_game_text += " 9 million people could be affected, the quarantine amasses larger than the size of Manhattan.";							
		}
		
		// comment on number of people quarantining
		if(numJoined < 3) {
			end_game_text += " You are going to need at least 3 people to build a successful quarantine. Next time, find anyone who can help.";	
		}
		else if(numJoined >= 3 && numJoined <= 8) {
			end_game_text += " You had the right idea, the fewer people on the front lines, the fewer in contact with patient zero.";				
		}
		else if(numJoined > 8) {
			end_game_text += " Remember, you don't need that many people to contain the outbreak, just the right ones!";							
		}
		
		end_game_text += " Can you do even better next time?";
		  
	}
	else {
		end_game_text = "Warning! Patient zero is still on the loose, the emergency response team of ";
		end_game_text += people.lenth;
		end_game_text += " has failed to collaborate and contain.";	// Can you work better and faster next time?";
		
		// update count of casualties
		if(numTrapped == 0) {
			end_game_text += "At least you didn't trap healthy people inside.";
		}
		else if(numTrapped > 0 && numTrapped < 5) {
			end_game_text += "Somehow you managed to trap ";
			end_game_text += numTrapped;
			end_game_text += " healthy people inside." 
		}
		else if(numTrapped > 5) {
			end_game_text += "With ";
			end_game_text += numTrapped;
			end_game_text += " healthy people trapped inside, the team needs to work better together." 
		}
		
/*
		// comment on quarantine total area
		if(totalArea < 11) {
			end_game_text += " You also managed to contain the patient in an area less than half the size of Manhattan.";	
		}
		else if(totalArea >= 11 && totalArea <= 22.7) {
			end_game_text += " It took a quarantine nearly the size of Manhattan to contain patient zero.";				
		}
		else if(totalArea >= 22.7) {
			end_game_text += " 9 million people could be affected, the quarantine amasses larger than the size of Manhattan.";							
		}
*/
		
		// comment on number of people quarantining
		if(numJoined < 3) {
			end_game_text += " Remember, you are going to need at least 3 people to build a successful quarantine.";	
		}
/*
		else if(numJoined >= 3 && numJoined <= 8) {
			end_game_text += " You had the right idea, the fewer people on the front lines, the fewer in contact with patient zero.";				
		}
		else if(numJoined > 8) {
			end_game_text += " Remember, you don't need that many people to contain the outbreak, <b>just the right ones!</b>";							
		}
*/

		end_game_text += " Can you work better and faster next time?";
	}
		
	document.getElementById("end_game").innerHTML = end_game_text;
	document.getElementById("end_game").style.visibility = "visible";
}

// missed the game pop up
var showMissedGameMessage = function() {
	
	var missed_game_text = "";

	if(isPatientZeroContained()) {
		missed_game_text = "Too Late! Patient zero, has already been successfully quarantined, but you were not here to help reduce the number trapped inside. Keep an eye out for future outbreaks!";
	}
	else {
		missed_game_text = "Too Late! The quarantine failed to contain patient zero. You could have been a critical link in stopping the contagion. Keep an eye out for future outbreaks!";
	}
	document.getElementById("end_game").innerHTML = missed_game_text;
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
				console.log("received JOIN message - " + m.uuid);
				if(m.uuid == _uuid)
					hasReceivedJoinedMessage = true;
				updatePopulation();
			break;

			case "leave":
				// set this user to no longer focussed...
				console.log("received LEAVE message - " + m.uuid);
				updatePopulation();
			break;
		}
	},
	message: function(m){
		switch(m) {

			case "update":
				console.log("received UPDATE message");
				updatePopulation();
			break;

			case "start":
				console.log("received START message");
				startTheClock();
			break;

			case "end":
				console.log("received END message");
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
    console.log("Success: Added a new simple user");
  },
  error: function(simpleUser, error) {
    // The save failed.
    // error is a Parse.Error with an error code and message.
  }
});
