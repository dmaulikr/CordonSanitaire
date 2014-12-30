var parse_start_date;
var countdownTimer;
var statusInterval;
var isRunning = false;

var duration = 120;

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
		var cur_hour = cur_date.getUTCHours();
		var cur_min = cur_date.getMinutes();
		var cur_sec = cur_date.getSeconds();
		
		var start_hour = parse_start_date.getUTCHours();
		var start_min = parse_start_date.getUTCMinutes();
		var start_sec = parse_start_date.getUTCSeconds();
				
		console.log(cur_date);
		console.log(parse_start_date);

		// if there is time til the game, keep the user in a waiting room and display a countdown til the start of the game
		
		// if the time equals gametime, start the game
		
		// if the time is greater than gametime but less than end time (i.e. start time + duration, then display short message to be dismissed and enter directly into the game (starting the clock with a modified duration based on entrance time)
		
		// if the time is after the end game, display last game outcome (as stored in the database with a message about the game. Saying Join next time
		
		if( cur_hour == start_hour &&
		 	cur_min == start_min &&
		 	cur_sec == start_sec ) {

			startTheClock();
			console.log("going to start the clock");
			window.clearInterval(statusInterval);
		}
	}, 100);
 
}


//
var timePassedSince = function(start_date) {

    // grab the current UTC values
    var cur_date = new Date();
    
    var start = start_date.getTime(start_date);
    var current = cur_date.getTime(cur_date); 

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

    isRunning = true;

    //make sure there isn't already an interval running
    window.clearInterval(countdownTimer);
    // create a timer and set its interval
    countdownTimer = setInterval(function () {timePassedSince(cur_date)}, 10);
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

