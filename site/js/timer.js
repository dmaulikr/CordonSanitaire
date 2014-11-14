var seconds = 59;
var hundredths = 100;
function timePassed() {
    var minutes = Math.round((seconds - 30)/60);
    var remainingSeconds = seconds % 60;
    var remainingHundredths = hundredths % 100;

    if (remainingHundredths < 10) {
    	remainingHundredths = "0" + remainingHundredths;
    }
    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;  
    }
    if (minutes < 10) {
    	minutes = "0" + minutes;
    }

    document.getElementById('countdown').innerHTML = minutes + ":" + remainingSeconds + ":" + remainingHundredths;
    
    if(hundredths == 0) {
    	hundredths = 100;
    	seconds--;
    }
    if (seconds == 0) {
        clearInterval(timePassed);
        document.getElementById('countdown').innerHTML = "00:00:00";

        // call function to run end of game sequence

    } else {
        hundredths--;
    }
}

var startTheClock = function() {
    
    // create a timer and set its interval
    var countdownTimer = setInterval('timePassed()', 10);

}
