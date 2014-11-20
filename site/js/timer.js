
function timePassedSince(start_month, start_day, start_hour, start_minute, start_second, start_millis) {

    // grab the current UTC values
    var cur_date = new Date();
    var cur_month = cur_date.getUTCMonth();
    var cur_day = cur_date.getUTCDay();
    var cur_hour = cur_date.getUTCHours();
    var cur_minute = cur_date.getUTCMinutes();
    var cur_second = cur_date.getUTCSeconds();
    var cur_millis = cur_date.getUTCMilliseconds();

    // calculate the difference in time
    var delta_month = cur_month - start_month;
    var delta_day = cur_day - start_day;
    var delta_hour = cur_hour - start_hour;
    var delta_minute = cur_minute - start_minute;
    var delta_second = cur_second - start_second;
    var delta_millis = cur_millis - start_millis;

    if(delta_month < 0) delta_month += 12;
    if(delta_day < 0){
        var num_days; 
        switch(cur_month){
            
            case 1, 3, 5, 7, 8, 10, 12:
                num_days = 31;
                break;

            case 4, 6, 9, 11:
                num_days = 30;
                break;

            case 2:
                num_days = 28;
                break;
        }
        delta_day += num_days;
    }
    if(delta_hour < 0) delta_hour += 24;
    if(delta_minute < 0) delta_minute += 60;
    if(delta_second < 0) delta_second += 60;
    if(delta_millis < 0) delta_millis += 1000;

    if(delta_minute < 10) delta_minute = "0" + delta_minute;
    if(delta_second < 10) delta_second = "0" + delta_second;
    if(delta_millis < 100) delta_millis = "0" + delta_millis;
    if(delta_millis < 10) delta_millis = "0" + delta_millis;
    
    document.getElementById('countdown').innerHTML =  delta_minute + ":" + delta_second + ":" + delta_millis;
}

var startTheClock = function() {
    
    // grab the current UTC values
    var cur_date = new Date();
    var cur_month = cur_date.getUTCMonth();
    var cur_day = cur_date.getUTCDay();
    var cur_hour = cur_date.getUTCHours();
    var cur_minute = cur_date.getUTCMinutes();
    var cur_second = cur_date.getUTCSeconds();
    var cur_millis = cur_date.getUTCMilliseconds();

    // create a timer and set its interval
    var countdownTimer = setInterval(function () {timePassedSince(cur_month, cur_day, cur_hour, cur_minute, cur_second, cur_millis)}, 10);
    //'timePassedSince(cur_month, cur_day, cur_hour, cur_minute, cur_second, cur_millis)', 10);

}
