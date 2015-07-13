/*
 *  To publish changes to Cloud code
 *  From terminal:
 *      cd CloudCode
 *      parse deploy
 *
 *  In english, change directory to cloud code and then deploy w/ parse :)
 */


// set PubNub
var pubnub = {
    publish_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884',
    subscribe_key: 'sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe',
};

var group_channel = "group0"

Parse.Cloud.define("dummyKMeans", function(request, response){
    
    var channel = request.params.id
    sendMessage({
       "action": "SubscribeToChannel",
       "channel": group_channel
       }, channel, function() {
            response.success("Success")
    })
});

function sendMessage(message, channel, callback){
    
    Parse.Cloud.httpRequest({
        url: 'http://pubsub.pubnub.com/publish/' +
        pubnub.publish_key + '/' +
        pubnub.subscribe_key + '/0/' +
        channel + '/0/' +
        encodeURIComponent(JSON.stringify(message)),
        
        // successful HTTP status code
        success: function(httpResponse) {
            console.log(httpResponse.text);
            callback()
        },
        
        // unsuccessful HTTP status code
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
}

function setGameToStartInMinutes() {
    
    var start_time = new Date();
    
    // set the start time to be 1 minute from when the job is run (for testing purposes)
    // TODO: set the start time to be random (within... a time range) - set once a day
    start_time.getTime();
    var hours = start_time.getUTCHours();
    var minutes = start_time.getUTCMinutes();
    var seconds = start_time.getUTCSeconds();
    
    // set the time 1 minute away from now
    minutes += 1;
    if(minutes >=60) {
        minutes = minutes - 60;
        hours += 1;
    }
    
    start_time.setHours(hours, minutes, seconds);
    var Game = Parse.Object.extend("Game");
    var game = new Game();
    
    game.save({
        startTime: start_time
        }, {
        success: function() {
            sendMessage({"action": "AddGame"}, group_channel, function() {
                  status.success("Game is set to " + start_time);
            })
        },
        error: function(error) {
              status.error("Error: " + error.code + " " + error.message);
        }
    });
}

Parse.Cloud.job("sendPushNotification", function(request, status) {
    
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo('deviceType', 'ios');
                
    var timeInMs = Date.now();
    var timeNow = Date(timeInMs).toString();
    var message1 = "Playful FAKE URGENT. Contagion detected at ";
    var message2 = ", you have 45 SECONDS to enact quarantine!";
    
    var message = message1.concat(timeNow, message2);
                
    Parse.Push.send({
        where: pushQuery,
        data: {
            alert: message
        }
        }, { success: function() {

            // call function to set game to start in a minute or so
            setGameToStartInMinutes();

            status.success("Notification sent")
        }, error: function(err) { 
            console.log(err);
            status.error("Something went wrong. Notification was not sent")
        }
    });
})

// every day at midnight sets a new game to be started at a given time
Parse.Cloud.job("setGame", function(request, status) {
    
    // call function to set game to start in a minute or so
    setGameToStartInMinutes();
});