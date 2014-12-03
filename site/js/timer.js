var start_time;
var countdownTimer;
var isRunning = false;

var duration = 120;


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
    console.log("min: " + minutes_remaining);
    console.log("sec: " + seconds_remaining);
    console.log("mil: " + millis_remaining);

    if(!(minutes_remaining <= 0 && seconds_remaining < 0))
        document.getElementById('countdown').innerHTML =  getTimeInStringFormatFromMillis(time_remaining);
    else {
        document.getElementById('countdown').innerHTML =  '00:00.00';
        window.clearInterval(countdownTimer);
        isRunning = false;
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

