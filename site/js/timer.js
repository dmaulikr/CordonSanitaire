var start_time;

function timePassedSince(start_date) {

    // grab the current UTC values
    var cur_date = new Date();
    
    var start = start_date.getTime(start_date);
    var current = cur_date.getTime(cur_date); 

    var difference = current - start;
    var elapsed_time = new Date(difference);  


    var minutes = Math.abs(elapsed_time.getMinutes());

    var seconds = Math.abs(elapsed_time.getSeconds());

    var millis = Math.abs(elapsed_time.getMilliseconds());

    // difference from time on timer (2 minutes)
    var minutes_remaining = 1 - minutes;
    var seconds_remaining = 59 - seconds;
    var millis_remaining = 999 - millis;

    if(minutes_remaining < 10 ) minutes_remaining = '0' + minutes_remaining;
    if(seconds_remaining < 10 ) seconds_remaining  = '0' + seconds_remaining;
    if(millis_remaining < 100) millis_remaining = '0' + millis_remaining;
    if(millis_remaining < 10) millis_remaining = '0' + millis_remaining;
    var tenths = Math.floor(millis_remaining/100);
    var hundredths = Math.floor(millis_remaining/10);
    if(hundredths < 10) hundredths = '0' + hundredths;


    document.getElementById('countdown').innerHTML =  minutes_remaining+':'+seconds_remaining+'.'+hundredths;
}

// function updateClock() {
//     document.getElementById('countdown').innerHTML =  minutes+':'+seconds+':'+millis;    
// }

var startTheClock = function() {
    
    // grab the current UTC values
    var cur_date = new Date();

    // create a timer and set its interval
    var countdownTimer = setInterval(function () {timePassedSince(cur_date)}, 10);
}
