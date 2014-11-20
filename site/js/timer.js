
function timePassedSince(start_date) {

    // grab the current UTC values
    var cur_date = new Date();
    
    var start = start_date.getTime(start_date);
    var current = cur_date.getTime(cur_date); 

    var difference = current - start;
    var elapsed_time = new Date(difference);  
    
    var minutes = elapsed_time.getMinutes() < 10 ? '0' + elapsed_time.getMinutes() : elapsed_time.getMinutes();
    var seconds = elapsed_time.getSeconds() < 10 ? '0' + elapsed_time.getSeconds() : elapsed_time.getSeconds();
    var millis = elapsed_time.getMilliseconds();
    if(millis < 100) millis = '0' + millis;
    if(millis < 10) millis = '0' + millis;

    document.getElementById('countdown').innerHTML =  minutes+':'+seconds+':'+millis;
}

var startTheClock = function() {
    
    // grab the current UTC values
    var cur_date = new Date();

    // create a timer and set its interval
    var countdownTimer = setInterval(function () {timePassedSince(cur_date)}, 10);
}
