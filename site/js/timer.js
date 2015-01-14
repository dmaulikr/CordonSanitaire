var parse_start_date;
var offset_system_date = new Date() - new Date();

var countdownTimer;
var statusInterval;
var isRunning = false;
var total_seconds = 1;

var bUserAllowedToStart = false;
var bShouldShowMissedGameMessage = false;
var bUpdatedDialogText = false;

var bAlertedUserOfGameStart = false;
var bShown10SecondMessage = false;
var bShown20SecondMessage = false;

var DEFAULT_DURATION = 45;

var duration = DEFAULT_DURATION;

// might not be a bad idea to look into using this http://keith-wood.name/countdown.html

// keep different devices in sync
var calculateClockOffset = function() {
	pubnub.time(
	   function(time){

	      var pubnub_time = new Date(Math.ceil(time / 10000));
	      console.log("pub nub time: " + pubnub_time);
	      
	      var system_time = new Date();
	      console.log("system time: " + system_time);

	      offset_system_date = system_time - pubnub_time;
  	      console.log("offset amount: " + offset_system_date);
  	   }
	);
}


// get the clock offset from system to pubnub clock
calculateClockOffset();


// check start time from parse
var game = Parse.Object.extend("Game");
var query = new Parse.Query(game);
query.find({
  	success: function(results) {
// 	  		console.log(results);
			
			// get the last time in the stack
			// TODO: get the next time i.e. smallest positive difference from now and then use that time and the start time. This will allow setting up days worth of playtest start times, without having to change anything
	  		var gameObject = results[results.length-1];
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


//
var timerStatusUpdate = function() {
	
	//
	statusInterval = setInterval(function () {
		
	    var cur_date = new Date();
		var synchedTime = new Date(cur_date.getTime() - offset_system_date);
		var cur_hour = synchedTime.getUTCHours();
		var cur_min = synchedTime.getUTCMinutes();
		var cur_sec = synchedTime.getUTCSeconds();
		
		var start_hour = parse_start_date.getUTCHours();
		var start_min = parse_start_date.getUTCMinutes();
		var start_sec = parse_start_date.getUTCSeconds();
						
		var dif_hour = start_hour - cur_hour;
		var dif_min = start_min - cur_min;
		var dif_sec = start_sec - cur_sec;

		total_seconds = dif_hour*60*60 + dif_min*60 + dif_sec;
		
		if( total_seconds == 0 ) {
		 	// start the game
		 	timerStartGame();
		}
		else if( total_seconds + duration < 0) {
			// user missed the game, display the end result of the game
			timerMissedGame();
		}
		else if( total_seconds < 0 ) {
			// user showed up late, let's update the duration and start the game
			timerLateToGame();
		}
		else if( total_seconds > 20 ) {
			// user showed up more than 20 seconds before start
			timerEarlyEnoughToWatchVideo();
		}
		else {
			// wait til game start, no video
			timerWaitTilGameStart();
		}

	}, 100);
 
}

var timerStartGame = function() {
	// Bring window into focus when game starts
 	window.focus();
 	
 	// user was present on time, let's start the game
 	bUserAllowedToStart = true;
 	
 	var intro_message = "<p>BEGIN!</p>";
	document.getElementById("intro_message").innerHTML = intro_message;


	document.getElementById("start_button").innerHTML = "Let's Go!";
	var spans = document.getElementsByClassName("countdown_til_start");
	for(var i=0; i<spans.length; i++){
		spans[i].innerHTML = 0;
	}
	// close the intro screen
	document.getElementById("overlay").style.visibility = 'hidden';

	// start the clock
	startTheClock();
	console.log("On Time User - Start Game.");
	window.clearInterval(statusInterval);
}

var timerMissedGame = function() {

	console.log("Latest User - Show End Game.");
	window.clearInterval(statusInterval);
	
	// possibly send to new page that notifies you missed the game
	// close the intro screen
	document.getElementById("overlay").style.visibility = 'hidden';

	bShouldShowMissedGameMessage = true;
}

var timerLateToGame = function () {
	var new_duration = DEFAULT_DURATION + total_seconds;
			bUserAllowedToStart = true;
			
			if(!bUpdatedDialogText) {
				var intro_message = "<p>Game is in progress!</p><p><b>The game only lasts 45 seconds!</b></p><p><b>You have one job: join the quarantine line, or not.</b> Just press the <b>JOIN/RELEASE</b> button on the upper right. You can do this as many times as you like.</p><p>You will be on a map of a world in which Patient Zero(<b>P0</b>) has a lethal infectious disease. You -- and everyone -- will work together to contain  by drawing a quarantine line around them.</p><p>At the end of the game, we will all have drawn a quarantine line. It will contain <b>P0</b> (hopefully!) or not. It will trap 'healthy' players inside with <b>P0</b>, or not. Hopefully not.</p><p>That’s up to you … all of you.</p>";
				document.getElementById("intro_message").innerHTML = intro_message;
				
				bUpdatedDialogText = true;
			}
			updateDuration(new_duration);
			startTheClock();
			console.log("Late User - Update duration. Start Game.");
			window.clearInterval(statusInterval);
}

var timerEarlyEnoughToWatchVideo = function() {
	if(!bUpdatedDialogText) {
		var intro_message = "<p>Game starts in <span class='countdown_til_start'>0</span> seconds.</p><p>Once the game starts <b>it will only last 45 seconds!</b> You’ll be playing with everyone else who jumps in.</p><p>You will be on a map of a world in which Patient Zero(<b>P0</b>)  has a lethal infectious disease. You -- and everyone -- will work together to contain  by drawing a quarantine line around them.</p><p><b>You have one job: join the quarantine line, or not.</b> Just press the <b>JOIN/RELEASE</b> button on the upper right. You can do this as many times as you like.</p><p>At the end of the game, we will all have drawn a quarantine line. It will contain <b>P0</b> (hopefully!) or not. It will trap 'healthy' players inside with <b>P0</b>, or not. Hopefully not.</p><p>That’s up to you … all of you.</p>";
		document.getElementById("intro_message").innerHTML = intro_message;
		
		bUpdatedDialogText = true;
	}
	
	var spans = document.getElementsByClassName("countdown_til_start");
	for(var i=0; i<spans.length; i++){
		spans[i].innerHTML = total_seconds;
	}
	var start_button_text = "Wait ";
	start_button_text += total_seconds;
	start_button_text += " seconds";
	document.getElementById("start_button").innerHTML = start_button_text;
	//console.log("Early - Show YouTube Vid.");
}

var timerWaitTilGameStart = function() {
	// user showed up early, let's keep them in the waiting room and display a countdown til the start of the game			
	// console.log("Early User - (" + dif_hour + ":" + dif_min + ":" + dif_sec + ") --- Seconds left: " + total_seconds);
	var spans = document.getElementsByClassName("countdown_til_start");
	for(var i=0; i<spans.length; i++){
		spans[i].innerHTML = total_seconds;
	}
	var start_button_text = "Wait ";
	start_button_text += total_seconds;
	start_button_text += " seconds";
	document.getElementById("start_button").innerHTML = start_button_text;
	
	//alert at 5 seconds til
	// if the page is not in focus, send an alert!
 	if(total_seconds == 5 && !isWindowInFocus && !bAlertedUserOfGameStart) {
 		var intro_message = "<p>The game is starting!</p><p>Once the game starts <b>it will only last 45 seconds!</b> You’ll be playing with everyone else who jumps in.</p><p>You will be on a map of a world in which Patient Zero(<b>P0</b>)  has a lethal infectious disease. You -- and everyone -- will work together to contain  by drawing a quarantine line around them.</p><p><b>You have one job: join the quarantine line, or not.</b> Just press the <b>JOIN/RELEASE</b> button on the upper right. You can do this as many times as you like.</p><p>At the end of the game, we will all have drawn a quarantine line. It will contain <b>P0</b> (hopefully!) or not. It will trap 'healthy' players inside with <b>P0</b>, or not. Hopefully not.</p><p>That’s up to you … all of you.</p>";
		document.getElementById("intro_message").innerHTML = intro_message;
		document.getElementById("start_button").innerHTML = "Let's Go!";

 		alert("PLAYFUL ALERT!!! CORDON SANITAIRE IS ABOUT TO START!!!");
 		window.focus();
 	}
}

var isUserAllowedToStart = function() {
	return bUserAllowedToStart;
}


//
var timePassedSince = function(start_date) {
    
    // grab the current UTC values
    var cur_date = new Date();
    
    var start = start_date.getTime(start_date);
	var current = new Date(cur_date.getTime() - offset_system_date);

	
    var difference = current - start;
    var elapsed_time = new Date(difference);  


    var minutes = Math.round( Math.abs(elapsed_time.getMinutes()));

    var seconds = Math.round( Math.abs(elapsed_time.getSeconds()));

    var millis = Math.round( Math.abs(elapsed_time.getMilliseconds()));

    // difference from time on timer (2 minutes)
    var minutes_remaining = Math.floor((duration-1)/60) - minutes;
    var seconds_remaining = Math.floor(duration - 1 - seconds) % 60;
    var millis_remaining = 999 - millis;

    var time_remaining = minutes_remaining * 60 * 1000 + seconds_remaining * 1000 + millis_remaining;
    //console.log("min: " + minutes_remaining);
    //console.log("sec: " + seconds_remaining);
    //console.log("mil: " + millis_remaining);

    if(minutes_remaining >= 0 && seconds_remaining >= 0) {
        document.getElementById('countdown').innerHTML =  getTimeInStringFormatFromMillis(time_remaining);
        
        
        // send message at 20 seconds remaining
        if(!bShown20SecondMessage && minutes_remaining == 0 && seconds_remaining == 20) {
			ohSnap('20 SECONDS REMAINING', 'black');
			bShown20SecondMessage = true;
		}

        // send message at 10 seconds remaining
        if(!bShown10SecondMessage && minutes_remaining == 0 && seconds_remaining == 10) {
			ohSnap('10 SECONDS REMAINING!', 'black');
			bShown10SecondMessage = true;
		}
        
        // blink the timer red when below 10 seconds
        
        if( minutes_remaining == 0 && seconds_remaining < 10 ){
	        
	        if(seconds_remaining % 2 == 0 ) {
		    	// turn the timer white    
		    	document.getElementById("countdown").style.color = '#FFFFFF';
	        }
	        else
	        {
		        // turn the timer red
		    	document.getElementById("countdown").style.color = '#FF0000';
	        }
	         
        }
    }
    else {
	    
	    // time is up
        document.getElementById('countdown').innerHTML =  '00:00.00';
        window.clearInterval(countdownTimer);
        isRunning = false;
        
        // send a message for game over and end of game state here
        showEndGameMessage();
        revealPatientZero();
    }

}

var getTimeInStringFormatFromMillis = function(millis) {
    var string = "";

    var minutes = Math.floor(millis / (60 * 1000));
    var seconds = Math.floor((millis / 1000) % 60);
    var hundredths = Math.floor((millis % 1000) / 10);

    if(minutes < 10 ) minutes = '0' + minutes;
    if(seconds < 10 ) seconds  = '0' + seconds;
    if(hundredths < 10) hundredths = '0' + hundredths;

    return minutes + ':' + seconds + '.' + hundredths;
} 

// function updateClock() {
//     document.getElementById('countdown').innerHTML =  minutes+':'+seconds+':'+millis;    
// }

var startTheClock = function() {
    
    // grab the current UTC values
    var cur_date = new Date();
	var synchedTime = new Date(cur_date.getTime() - offset_system_date);
			
    isRunning = true;

    //make sure there isn't already an interval running
    window.clearInterval(countdownTimer);
    // create a timer and set its interval
    countdownTimer = setInterval(function () {timePassedSince(synchedTime)}, 10);
}

var stopTheClock = function() {    
    window.clearInterval(countdownTimer);
    isRunning = false;
}

var resetTheClock = function() {
    

    // document.getElementById('countdown').innerHTML =  '00:00.00';
    document.getElementById('countdown').innerHTML =  getTimeInStringFormatFromMillis(duration*1000);

    isRunning = false;
}

var updateDuration = function(seconds) {
    if(!isRunning) {
        duration = seconds;
        resetTheClock();
    }
}

// start the clock refreshed
resetTheClock();

