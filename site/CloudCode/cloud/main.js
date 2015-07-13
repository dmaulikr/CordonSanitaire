// set pubnub
var pubnub = {
    publish_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884',
    subscribe_key: 'sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe',
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

// selects the position of patient zero one minute before a game starts
Parse.Cloud.job('selectPatientZero', function(request, status) {
    var count = 0;
    var total = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };

    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('present', true);
    userQuery.each(function(user) {
        var rnd = Math.round(Math.random());
        if (rnd == 1) {
            total.x += user.get('x');
            total.y += user.get('y');
            count++;
        }
    }).then(function() {
        if (count != 0){
            pos.x = total.x / count;
            pos.y = total.y / count;
        } else {
            pos.x = Math.random();
            pos.y = Math.random();
        }

        setPatientZeroPosition(pos, function() {
            status.success("Patient Zero position was set to " + pos.x + ", " + pos.y);
        });

    }, function(error) {
        status.error("Error: " + error.code + " " + error.message);
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

