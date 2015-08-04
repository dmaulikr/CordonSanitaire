// set pubnub
var pubnub = {
    publish_key: 'pub-c-cc12e9c4-752b-4216-872c-12ec350ab404',
    subscribe_key: 'sub-c-92bfbb92-357a-11e5-9004-02ee2ddab7fe',
};

// var _channel = 'production'; // Dev Channel vs. Production Channel
var _channel = 'development'; // Dev Channel vs. Production Channel

// reset all of the players back to no-one playing
Parse.Cloud.define("setAllUsersNotPresent", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("present", true);
    query.each(function(user) {
        if (!user.get('admin')) {
            console.log("resetting " + user.id);
            user.set("present", false);
            return user.save();
        }
    }).then(function() {
        response.success("Users reset");
    }, function(error) {
        response.error("Error: " + error.code + " " + error.message);
    });
});

// an user ping
Parse.Cloud.define("ping", function(request, response) {
    var cur_date = new Date();
    request.user.set('ping', cur_date);
    request.user.save().then(function() {
        response.success("User " + request.user.id + " pinged");
    }, function(error) {
        response.error("Error: " + error.code + " " + error.message);
    });
});

// every 2 minutes checks which users are present according to their pings
Parse.Cloud.job("updateUsersPresent", function(request, status) {
    console.log("Updating users present");
    Parse.Cloud.useMasterKey();

    var query = new Parse.Query(Parse.User);
    query.each(function(user) {
        var timestamp = user.get('ping')

        var cur_date = new Date();

        var total_seconds = (cur_date - timestamp) / 1000
        if (total_seconds > 120) {
            if (user.get("present")){
                user.set({
                    present: false
                });
                user.save();

                var message = {
                    action: 'removeUser',
                    id: user.id
                }

                sendMessage(message);
            }
        } else {
            if(!user.get("present")) {
                user.set({
                    present: true
                });
                user.save();

                var message = {
                    action: 'addUser',
                    id: user.id
                }

                sendMessage(message);
            }
        }
    }).then(function() {

        status.success("Users updated");
    }, function(error) {
        status.error("Error: " + error.code + " " + error.message);
    })
});

//shuffling of an array
function shuffle(array){
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0!== currentIndex) {
        randomIndex = Math.floor(Math.random()*currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function getCenter(coordinates) {
    if (coordinates === undefined) {
        console.log("No coordinates passed");
        return;
    }
    else {
        var avgLat = 0;
        var avgLon = 0;
        //loops through and adds all coordinate values
        for (var i = 0; i < coordinates.length; i++){
            avgLat += coordinates[i][0];
            avgLon += coordinates[i][1];
        }
        //returns the average.
        avgLat = avgLat/double(coordinates.length);
        avgLon = avgLon/double(coordinates.length);
        return (avgLat, avgLon);
    }
}

// selects the position of patient zero one minute before a game starts
Parse.Cloud.job('selectPatientZero', function(request, status) {
    //Randomly select 3 names: scramble an array and choose first 3,
    //place patient zero in the middle.

    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('present', true);
    var userArray = [];
    userQuery.each(function(user) {
        userArray.push(user);
    }).then(function() {

        shuffle(userArray);
        console.log("shuffled");

        if (userArray.length >= 3) {
            var randomUsers = [(userArray[0].get('x'), userArray[0].get('y')), 
                           (userArray[1].get('x'), userArray[1].get('y')), 
                           (userArray[2].get('x'), userArray[2].get('y'))];
            var pos = getCenter(randomUsers);

            setPatientZeroPosition(pos, function() {
               status.success("Patient Zero position was set to " + pos[0] + ", " + pos[1]);
            }, function(error) {
                status.error("Error:" + error.code + " " error.message);
            });
        }
        else {
            console.log("Not enough players.");
        }   
    });
});

// every day at midnight sets a new game to be started at a given time
Parse.Cloud.job('setGame', function(request, status) {
    var start_time = new Date();
    start_time.setHours(request.params.hours, request.params.minutes, request.params.seconds);
    var Game = Parse.Object.extend("Game");
    var game = new Game();

    game.save({
            startTime: start_time
        }, {
        success: function() {
            status.success("Game is set to " + start_time);
        },
        error: function(error) {
            status.error("Error: " + error.code + " " + error.message);
        }
    });
});

// every day at midnight reset the position of the users
Parse.Cloud.job('resetUsersPosition', function(request, status) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.each(function(user) {
        user.save({
            x : Math.random(),
            y : Math.random()
        });
    }).then (function() {
        status.success("Users' position have been reseted");
    }, function(error) {
        statur.error("Error: " + error.code + " " + error.message);
    });
});


// publish message to pubnub from cloud code
function sendMessage(message){
    Parse.Cloud.httpRequest({
        url: 'http://pubsub.pubnub.com/publish/' +
            pubnub.publish_key + '/' +
            pubnub.subscribe_key + '/0/' +
            _channel + '/0/' +
            encodeURIComponent(JSON.stringify(message)),

        // successful HTTP status code
        success: function(httpResponse) {
            console.log(httpResponse.text);
        },
        // unsuccessful HTTP status code
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
}

function setPatientZeroPosition(pos, callback){
    var message;
    var NPC = Parse.Object.extend("NPC");
    var query = new Parse.Query(NPC);
    query.equalTo('isPatientZero', true);
    query.first({
        success: function(patient_zero) {
            if (patient_zero != undefined){
                patient_zero.save({
                    x : pos.x,
                    y : pos.y
                })
                message = {
                    action: 'setPatientZeroPosition',
                    pos: pos
                }
                sendMessage(message);
            } else {
                patient_zero = new NPC();
                patient_zero.save({
                    x : pos.x,
                    y : pos.y,
                    role : "citizen",
                    type: "infectious",
                    isPatientZero: true
                }, {
                    success: function(npc) {
                        message = {
                            action: 'addNPC',
                            id: npc.id
                        }

                    sendMessage(message);
                    },
                    error : function(error) {
                        status.error("Error: " + error.code + " " + error.message);

                    }
                });
            }

            callback();
        },
        error: function(error) {
            status.error("Error: " + error.code + " " + error.message);
        }
    })
}

