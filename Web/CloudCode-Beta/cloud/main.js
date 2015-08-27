// Twilio integration
// Require and initialize the Twilio module with your credentials
var ACCOUNT_SID = 'ACe1411ef11ed3bd884ac1ae80b39ea1af';
var AUTH_TOKEN = '4e7f5bfd0715adf2a51651523edd7df7';
var twilio_client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
var twilio_number = '+19495367529';

// handle incoming text messages from Twilio
// NOT YET WORKING
//var express = require('express');
//var app = express();
//
//// Global app configuration section
//app.use(express.bodyParser());  // Populate req.body
//
//app.post('/receiveSMS',
//    function(req, res) {
//        console.log("Received a new text " + req.From + ": " + req.Body);
//        res.send('Success');
//          // possible to get array of one for req.From...
//    });
//
//app.listen();

// set pubnub
var pubnub = {
    publish_key: 'pub-c-cc12e9c4-752b-4216-872c-12ec350ab404',
    subscribe_key: 'sub-c-92bfbb92-357a-11e5-9004-02ee2ddab7fe'
};

// var _channel = 'production'; // Dev Channel vs. Production Channel
var _channel = 'development'; // Dev Channel vs. Production Channel

// update lobby after player has joined
Parse.Cloud.afterSave("_User", function (request) {
    Parse.Cloud.useMasterKey();

    var gameStartDelay;
    var numRequiredPlayers;
    var startTime;

    // Get the game configs from Parse
    Parse.Config.get().then(function(config) {

        gameStartDelay = config.get("gameStartDelay");
        numRequiredPlayers = config.get("numRequiredPlayers");

        var query = new Parse.Query(Parse.User);
        query.equalTo("present", true);
        query.count({
            success: function(count) {

                console.log("counted " + count.toString() + " players present");

                if(count == numRequiredPlayers) {

                    // check to see if game is scheduled
                    var game = Parse.Object.extend("Game");
                    var query = new Parse.Query(game);
                    query.descending('createdAt');
                    query.find({
                        success: function (results) {

                            // get the first game object in the results
                            var gameObject = results[0];
                            var bGameScheduled = gameObject.get('isScheduled');
                            var gameId = gameObject.get('objectId');
                            var gameTime = gameObject.get('startTime');
                            console.log("is game scheduled: " + bGameScheduled + " gameId: " + gameId + " gameTime: " + gameTime);

                            if(!bGameScheduled) {
                                // if not yet scheduled, schedule the game
                                var start_time = new Date();

                                // set the start time to be 1 minute from when the job is run (for testing purposes)
                                // TODO: set the start time to be random (within... a time range) - set once a day
                                start_time.getTime();
                                var hours = start_time.getUTCHours();
                                var minutes = start_time.getUTCMinutes();
                                var seconds = start_time.getUTCSeconds();

                                // set the time 10 seconds away from now
                                seconds += gameStartDelay;
                                if(seconds  >= 60) {
                                    seconds  = seconds - 60;
                                    minutes += 1;
                                }
                                if(minutes  >= 60) {
                                    minutes = minutes - 60;
                                    hours += 1;
                                }
                                if(hours >= 24) {
                                    hours = hours - 24;
                                }

                                start_time.setHours(hours, minutes, seconds);
                                console.log("setting start time: " + start_time.toString());

                                gameObject.set('startTime', start_time);
                                gameObject.set('isScheduled', true);
                                gameObject.save().then(function () {
                                    // then publish a message
                                    var message = {
                                        action: 'setGameTime',
                                        time: start_time
                                    };
                                    sendMessage(message);
                                    console.log("Game is set to " + start_time);

                                    // now set Patient Zero's position
                                    selectPatientZero(request, null); // null parameter for status

                                }, function(error) {
                                    console.log("Error in the game save with game time: " + start_time);
                                    console.log("Error: " + error.code + " " + error.message);
                                });
                                //saveStartGameAndPublish(start_time);
                            }
                            else {
                                // scheduled, we are done here
                                console.log("game already scheduled");

                            }

                            // create a timer status loop
                            //timerStatusUpdate();
                        },
                        error: function (object, error) {
                            // The object was not retrieved successfully.
                            console.log("Error: " + error.code + " " + error.message);
                        }
                    });
                }

                else if(count < numRequiredPlayers) {
                    sendUpdateLobby(count, numRequiredPlayers);
                }

                else
                    console.log("already have enough players, let them spectate");
            },
            error: function(error) {
                console.log("Error in the count method");
                console.log("Error: " + error.code + " " + error.message);
            }
        });

    }, function(error) {
        console.log("failed to load config from Parse.");
    });
});


function saveStartGameAndPublish(startTime) {
    // set a game
    var Game = Parse.Object.extend("Game");
    var game = new Game();
    game.set('startTime', startTime);
    game.save().then(function () {
        // then publish a message
        var message = {
            action: 'setGameTime',
            time: startTime
        };
        sendMessage(message);
        console.log("Game is set to " + startTime);
    }, function(error) {
        console.log("Error in the game save with game time: " + startTime);
        console.log("Error: " + error.code + " " + error.message);
    });
}


function sendUpdateLobby(numPlayers, numRequired) {
    // update lobby with latest values
    var message = {
        action: 'updateLobby',
        num_required: numRequired,
        num_present: numPlayers
    };
    sendMessage(message);
    console.log("Users present counted and published - sent UpdateLobby");
}

// reset all of the players back to no-one playing
Parse.Cloud.define("setAllUsersNotPresent", function (request, status) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("present", true);
    query.each(function (user) {
        if (!user.get('admin')) {
            console.log("resetting " + user.id);
            user.set("present", false);
            return user.save();
        }
    }).then(function () {
        status.success("Users reset");
    }, function (error) {
        status.error("Error: " + error.code + " " + error.message);
    });
});

// logs a ping from a user to say, "hey, I am still here"
Parse.Cloud.define("ping", function (request, status) {
    var cur_date = new Date();
    request.user.set('ping', cur_date);
    request.user.save().then(function () {
        status.success("User " + request.user.id + " pinged");
    }, function (error) {
        status.error("Error: " + error.code + " " + error.message);
    });
});

// Look at all players and if the player has not pinged in the last 2 minutes,
// set them to not present.
// This can be checked at any point, might make sense to look at before a play test
Parse.Cloud.job("updateUsersPresent", function (request, status) {
    console.log("Updating users present");
    Parse.Cloud.useMasterKey();

    var query = new Parse.Query(Parse.User);
    query.each(function (user) {
        var timestamp = user.get('ping');

        var cur_date = new Date();

        var total_seconds = (cur_date - timestamp) / 1000;
        if (total_seconds > 120) {
            if (user.get("present")) {
                user.set({
                    present: false
                });
                user.save();

                var message = {
                    action: 'removeUser',
                    id: user.id
                };

                sendMessage(message);
            }
        } else {
            if (!user.get("present")) {
                user.set({
                    present: true
                });
                user.save();

                var message = {
                    action: 'addUser',
                    id: user.id
                };

                sendMessage(message);
            }
        }
    }).then(function () {

        status.success("Users updated");
    }, function (error) {
        status.error("Error: " + error.code + " " + error.message);
    })
});

//shuffling of an array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
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
    }
    else {
        var avgLat = 0;
        var avgLon = 0;
        //loops through and adds all coordinate values
        for (var i = 0; i < coordinates.length; i++) {
            avgLat += coordinates[i][0];
            avgLon += coordinates[i][1];
        }
        //returns the average.
        avgLat = avgLat / coordinates.length;
        avgLon = avgLon / coordinates.length;
        return [avgLat, avgLon];
    }
}

// selects the position of patient zero one minute before a game starts
function selectPatientZero(request, status) {
    //Randomly select 3 names: scramble an array and choose first 3,
    //place patient zero in the middle.

    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('present', true);
    var userArray = [];

    userQuery.each(function (user) {
        userArray.push(user);
    }).then(function () {

        shuffle(userArray);
        console.log("shuffled");

        if (userArray.length >= 3) {
            var randomUsers = [[userArray[0].get('x'), userArray[0].get('y')],
                [userArray[1].get('x'), userArray[1].get('y')],
                [userArray[2].get('x'), userArray[2].get('y')]];
            var pos = getCenter(randomUsers);

            setPatientZeroPosition(pos, request, status);
        }
        else {
            if(status)
                status.error("Not enough players. Only " + userArray.length + " players present.");
            else
                console.log("Not enough players. Only " + userArray.length + " players present.");
        }
    });
}

//reset all players to Passive.
function setAllUsersPassive(request, status) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("type", "active");
    query.each(function (user) {
        console.log("resetting passivity of " + user.id);
        user.set("type", "passive");
        return user.save();
    }).then(function () {
        status.success("Users reset to passive");
    }, function (error) {
        status.error("Error: " + error.code + " " + error.message);
    });
}

//Set all users to Present: false
function setAllUsersNotPresent(request, status) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("present", true);
    query.each(function (user) {
        if (!user.get('admin')) {
            console.log("resetting " + user.id);
            user.set("present", false);
            return user.save();
        }
    }).then(function () {
        status.success("Users reset");
    }, function (error) {
        status.error("Error: " + error.code + " " + error.message);
    });
}

// every day at midnight sets a new game to be started at a given time
function createEmptyGame(request, status) {

    // Get the game configs from Parse
    Parse.Config.get().then(function(config) {

        gamePaddingMinutes = config.get("gamePadding");

        var start_time = new Date();

        // set the start time to be 1 minute from when the job is run (for testing purposes)
        // TODO: set the start time to be random (within... a time range) - set once a day
        start_time.getTime();
        var hours = start_time.getUTCHours();
        var minutes = start_time.getUTCMinutes();
        var seconds = start_time.getUTCSeconds();

        // set the time ~10 minutes away from now
        minutes += gamePaddingMinutes;
        if(minutes  >= 60) {
            minutes = minutes - 60;
            hours += 1;
        }
        if(hours >= 24) {
            hours = hours - 24;
        }

        start_time.setHours(hours, minutes, seconds);
        console.log("creating an empty game at: " + start_time.toString());

        var Game = Parse.Object.extend("Game");
        var game = new Game();

        game.save({
            startTime: start_time,
            isScheduled: false
        }, {
            success: function () {
                status.success("Game is set to " + start_time);
            },
            error: function (error) {
                status.error("Error: " + error.code + " " + error.message);
            }
        });
    });
}

// every day at midnight sets a new game to be started at a given time
function setGame(request, status) {
    var start_time = new Date();
    start_time.setHours(request.params.hours, request.params.minutes, request.params.seconds);
    var Game = Parse.Object.extend("Game");
    var game = new Game();

    game.save({
        startTime: start_time,
        isScheduled: false
    }, {
        success: function () {
            status.success("Game is set to " + start_time);
        },
        error: function (error) {
            status.error("Error: " + error.code + " " + error.message);
        }
    });
}

// every day at midnight reset the position of the users
function resetUsersPosition(request, status) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.each(function (user) {
        user.save({
            x: Math.random(),
            y: Math.random()
        });
    }).then(function () {
        status.success("Users' position have been reset");
    }, function (error) {
        status.error("Error: " + error.code + " " + error.message);
    });
}

// send a text message to players of the game
function sendTextMessage(request, status) {

    // Query all users that are opted in to text message
    var query = new Parse.Query(Parse.User);
    query.equalTo("phoneOptOut", false);
    query.each(function (user) {
        var phone_number = '+1' + user.get('phone');
        var message_url = 'bit.ly/playCSbeta';
        var now = new Date();
        var message_time = now.toDateString();
        var message = 'PLAYFUL URGENT. Patient Zero detected! USE YOUR PHONE NOW to enact quarantine ' +  message_url + ' ' + message_time;

        // Send an SMS message w/ twilio
        twilio_client.sendSms({
                to: phone_number,
                from: twilio_number,
                body: message
            }, function(err, responseData) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(responseData.from);
                    console.log(responseData.body);
                }
            }
        );

    }).then(function () {
        status.success("Users have been texted");
    }, function (error) {
        status.error("Error: " + error.code + " " + error.message);
    });
}

// Master button function
//
// 1) sets new locations
// 2) sets all users to passive
// 3) creates a new game
// 4) sends a text message to anounce the game (5 minutes away)

function launchGame(request, status) {

    Parse.Cloud.useMasterKey();

    Parse.Promise.when(
        function () {
            //Sets new location for all users
            console.log("set location");
            resetUsersPosition(request, status);
        }).then(function () {
            //sets all users to passive state
            console.log("set passive");
            setAllUsersPassive(request, status);
        }).then(function () {
            //sets game time for 5 minutes from now
            var currentTime = Date.now();
            var start_time = currentTime + 5 * 60 * 1000; // sets start time to 5 minutes.
            var Game = Parse.Object.extend("Game");
            var game = new Game();

            game.save({
                startTime: start_time
            });
        },
        function(error) {
            status.error("Error: " + error.code + " " + error.message);
        });

        //.then(function () {
        //    //sets game time for 5 minutes from now
        //    var currentTime = Date.now();
        //    var start_time = currentTime + 5 * 60 * 1000; // sets start time to 5 minutes.
        //    var Game = Parse.Object.extend("Game");
        //    var game = new Game();
        //
        //    game.save({
        //        startTime: start_time
        //    }).then(
        //        function (result) {
        //            //Text message, sends text notifications (playful urgent)
        //            Parse.Cloud.httpRequest({
        //                method: 'GET',
        //                url: 'http://playful.jonathanbobrow.com/cs_beta/sms/sendTextMessage.php',
        //                headers: {
        //                    'Content-Type': "application/json",
        //                },
        //                body: {
        //                    'group': "Personal",
        //                    'time': "4:30PM EST",
        //                    'sms_url': "bit.ly/playCSbeta"
        //                },
        //                success: function (httpResponse) {
        //
        //                    console.log(httpResponse.text);
        //                },
        //                error: function (httpResponse) {
        //
        //                    console.error('Request failed with response code ' + httpResponse.status);
        //                }
        //            })
        //        }).then(
        //        function (result) {
        //            // Set a timer to set patient zero before the game starts
        //            setTimeout(function () {
        //                    selectPatientZero(request, status)
        //                }
        //                , 4.5 * 60 * 1000); // 4:30 minutes.
        //        },
        //        function (error) {
        //            status.error("didn't send text message");
        //        });
        //});
}

// send a message to all clients refreshing their webpage
function sendRefreshPageMessage(request, status) {
    var message = {
        action: 'refreshPage'
    };
    sendMessage(message);
    status.success();
}


// publish message to pubnub from cloud code
function sendMessage(message) {
    Parse.Cloud.httpRequest({
        url: 'http://pubsub.pubnub.com/publish/' +
        pubnub.publish_key + '/' +
        pubnub.subscribe_key + '/0/' +
        _channel + '/0/' +
        encodeURIComponent(JSON.stringify(message)),

        // successful HTTP status code
        success: function (httpResponse) {
            console.log(httpResponse.text);
        },
        // unsuccessful HTTP status code
        error: function (httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
}

function setPatientZeroPosition(pos, request, status) {
    var message;
    var NPC = Parse.Object.extend("NPC");
    var query = new Parse.Query(NPC);
    query.equalTo('isPatientZero', true);
    query.first({
        success: function (patient_zero) {
            if (patient_zero != undefined) {
                patient_zero.save({
                    x: pos.x,
                    y: pos.y
                });
                message = {
                    action: 'setPatientZeroPosition',
                    pos: pos
                };
                sendMessage(message);
                if(status)
                    status.success("Published P0 location");
                else
                    console.log("Published P0 location");

            } else {
                patient_zero = new NPC();
                patient_zero.save({
                    x: pos.x,
                    y: pos.y,
                    role: "citizen",
                    type: "infectious",
                    isPatientZero: true
                }, {
                    success: function (npc) {
                        message = {
                            action: 'addNPC',
                            id: npc.id
                        };

                        sendMessage(message);
                        if(status)
                            status.success("Published P0 location");
                        else
                            console.log("Published P0 location");

                    },
                    error: function (error) {
                        if(status)
                            status.error("Error: " + error.code + " " + error.message);
                        else
                            console.log("Error: " + error.code + " " + error.message);
                    }
                });
            }
        },
        error: function (error) {
            if(status)
                status.error("Error: " + error.code + " " + error.message);
            else
                console.log("Error: " + error.code + " " + error.message);
        }
    });
}

// FORCE START
function forceStart(request, status) {

    Parse.Cloud.useMasterKey();

    var gameStartDelay;
    var startTime;

// Get the game configs from Parse
    Parse.Config.get().then(function (config) {

        gameStartDelay = config.get("gameStartDelay");

        // check to see if game is scheduled
        var game = Parse.Object.extend("Game");
        var query = new Parse.Query(game);
        query.descending('createdAt');
        query.find({
            success: function (results) {
                // get the first game object in the results
                var gameObject = results[0];
                var bGameScheduled = gameObject.get('isScheduled');
                var gameId = gameObject.get('objectId');
                var gameTime = gameObject.get('startTime');
                console.log("is game scheduled: " + bGameScheduled + " gameId: " + gameId + " gameTime: " + gameTime);

                if (!bGameScheduled) {
                    // if not yet scheduled, schedule the game
                    var start_time = new Date();

                    // set the start time to be 1 minute from when the job is run (for testing purposes)
                    // TODO: set the start time to be random (within... a time range) - set once a day
                    start_time.getTime();
                    var hours = start_time.getUTCHours();
                    var minutes = start_time.getUTCMinutes();
                    var seconds = start_time.getUTCSeconds();

                    // set the time 10 seconds away from now
                    seconds += gameStartDelay;
                    if (seconds >= 60) {
                        seconds = seconds - 60;
                        minutes += 1;
                    }
                    if (minutes >= 60) {
                        minutes = minutes - 60;
                        hours += 1;
                    }
                    if (hours >= 24) {
                        hours = hours - 24;
                    }

                    start_time.setHours(hours, minutes, seconds);
                    console.log("setting start time: " + start_time.toString());

                    gameObject.set('startTime', start_time);
                    gameObject.set('isScheduled', true);
                    gameObject.save().then(function () {
                        // then publish a message
                        var message = {
                            action: 'setGameTime',
                            time: start_time
                        };
                        sendMessage(message);
                        console.log("Game is set to " + start_time);

                        // now set Patient Zero's position
                        selectPatientZero(request, null); // null parameter for status

                    }, function (error) {
                        console.log("Error in the game save with game time: " + start_time);
                        console.log("Error: " + error.code + " " + error.message);
                    });
                    //saveStartGameAndPublish(start_time);
                }
                else {
                    // scheduled, we are done here
                    console.log("game already scheduled");
                }
            },
            error: function (object, error) {
                // The object was not retrieved successfully.
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    }, function (error) {
        console.log("failed to load config from Parse.");
    });
}


/*
 *
 *  JOBS for Cloud Code
 *
 */

// Create jobs here, call other functions that have been defined to perform our ask

Parse.Cloud.job('refreshPage', function (request, status) {
    sendRefreshPageMessage(request, status);
});

Parse.Cloud.job('selectPatientZero', function (request, status) {
    selectPatientZero(request, status);
});

Parse.Cloud.job("setAllUsersNotPresent", function (request, status) {
    setAllUsersNotPresent(request, status)
});

Parse.Cloud.job("setAllUsersPassive", function (request, status) {
    setAllUsersPassive(request, status)
});

Parse.Cloud.job('createEmptyGame', function (request, status) {
    createEmptyGame(request, status)
});

Parse.Cloud.job('setGame', function (request, status) {
    setGame(request, status)
});

Parse.Cloud.job('resetUsersPosition', function (request, status) {
    resetUsersPosition(request, status)
});

//Master button
Parse.Cloud.job('launchGameMasterButton', function (request, status) {
    launchGame(request, status);
});

//Text Message button
Parse.Cloud.job('sendTextMessage', function (request, status) {
    sendTextMessage(request, status);
});

//Force Start button
Parse.Cloud.job('forceStart', function (request, status) {
    forceStart(request, status);
});



