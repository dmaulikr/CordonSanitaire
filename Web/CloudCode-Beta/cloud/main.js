// set pubnub
var pubnub = {
    publish_key: 'pub-c-cc12e9c4-752b-4216-872c-12ec350ab404',
    subscribe_key: 'sub-c-92bfbb92-357a-11e5-9004-02ee2ddab7fe'
};

// var _channel = 'production'; // Dev Channel vs. Production Channel
var _channel = 'development'; // Dev Channel vs. Production Channel

var _numPlayersRequired = 20;

// update lobby after player has joined
Parse.Cloud.afterSave("_User", function (request) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("present", true);
    query.count({
        success: function(count) {

            var message;

            if(count == _numPlayersRequired) {
                // set a game
                var Game = Parse.Object.extend("Game");
                var game = new Game();

                // Get the game configs from Parse
                Parse.Config.get().then(function(config) {

                    var gameStartDelay = config.get("gameStartDelay");
                    var startTime = Date.now() + gameStartDelay * 1000;

                    game.save({
                        startTime: startTime
                    }, {
                        success: function () {
                            // then publish a message
                            message = {
                                action: 'setGameTime',
                                time: startTime
                            };
                            sendMessage(message);

                            status.success("Game is set to " + startTime);
                        },
                        error: function (error) {
                            status.error("Error: " + error.code + " " + error.message);
                        }
                    });

                }, function(error) {
                    status.error("failed to load config from Parse.");
                });
            }

            else if(count < _numPlayersRequired) {

                // Get the game configs from Parse
                Parse.Config.get().then(function(config) {

                    var numRequiredPlayers = config.get("numRequiredPlayers");

                    // update lobby with latest values
                    message = {
                        action: 'updateLobby',
                        num_required: numRequiredPlayers,
                        num_present: count
                    };
                    sendMessage(message);

                    status.success("Users present counted and published");

                }, function(error) {
                    status.error("failed to load config from Parse.");
                });

            }

        },
        error: function(error) {
            status.error("Error: " + error.code + " " + error.message);
        }
    });
});




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
            status.error("Not enough players. Only " + userArray.length + " players present.");
        }
    });
}

//reset all players to Passive.
function setAllUsersPassive(request, status) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("type", "active");
    query.each(function (user) {
        if (!user.get('admin')) {
            console.log("resetting passivity of " + user.id);
            user.set("type", "passive");
            return user.save();
        }
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
function setGame(request, status) {
    var start_time = new Date();
    start_time.setHours(request.params.hours, request.params.minutes, request.params.seconds);
    var Game = Parse.Object.extend("Game");
    var game = new Game();

    game.save({
        startTime: start_time
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
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'http://playful.jonathanbobrow.com/cs_beta/sms/sendTextMessage.php',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded" //application/json",
        },
        body: {
            'group': "Personal",
            'time': "4:30PM EST",
            'sms_url': "bit.ly/playCSbeta"
        },
        success: function (httpResponse) {
            status.success(httpResponse.text);
        },
        error: function (httpResponse) {
            status.error('Request failed with response code ' + httpResponse.status);
        }
    })
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
                status.success("Published P0 location");

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
                        status.success("Published P0 location");
                    },
                    error: function (error) {
                        status.error("Error: " + error.code + " " + error.message);

                    }
                });
            }
        },
        error: function (error) {
            status.error("Error: " + error.code + " " + error.message);
        }
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


