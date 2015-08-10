//----------------------------
//          PubNub
//----------------------------

// Init
var pubnub = PUBNUB.init({
    keepalive: 30,
    publish_key: 'pub-c-cc12e9c4-752b-4216-872c-12ec350ab404',
    subscribe_key: 'sub-c-92bfbb92-357a-11e5-9004-02ee2ddab7fe',
    uuid: _uuid
});

// Subscribe
pubnub.subscribe({
    channel: _channel,
    presence: function(m) {
        //console.log(m)
        switch (m.action) {
            case "join":
                // set the UUID here
                console.log("received JOIN message - " + m.uuid);
                if (m.uuid == _uuid) {
                    console.log("start setup");
                    setup();
                }
                break;

            case "leave":
                // set this user to no longer focussed...
                console.log("received LEAVE message - " + m.uuid);
                // updatePopulation();
                break;
        }
    },
    message: function(m) {
        switch (m.action) {

            case "start":
                console.log("received START message");
                startTheClock();
                break;

            case "end":
                console.log("received END message");
                break;

            case "shout":
                //console.log("received SHOUT message from " + m.uuid);
                animateShout(m.id);

                break;

            case "addNPC":
                if (!NPC.isIdPresent(m.id)) {
                    NPC.addToLocalArray(m.id);
                    // also update the map to include all markers
                    updateBounds();
                    
                } else {
                    console.log("npc " + m.id + " was already present in the local array");
                }
                break;

            case "removeNPC":
                NPC.removeFromLocalArray(m.id);
                break;

            case "addUser":
                if (!User.isIdPresent(m.id) && hasReceivedJoinedMessage) {
                    User.addToLocalArray(m.id);
                    // also update the map to include all markers
                    updateBounds();

                } else {
                    console.log("User " + m.id + " was already present in the local array.");
                }
                break;

            case "removeUser":
                User.removeFromLocalArray(m.id);
                break;

            case "changeUserType":
                User.changeUserType(m.id, m.type);

                break;

            case "resetPlayers":
                console.log("resetting players");
                // repopulate the local array
                User.getAllFromDatabase();

                // update the game board
                updateGameBoard();

                if(!Parse.User.current().get('admin')){
                    alert("For some reason you were logged out.")
                    Parse.User.logOut();
                    window.location.href = 'login.html';
                } else
                    window.location.reload()
                break;

            case "logOut":
                if(myUser.id == m.id){
                    Parse.User.logOut();
                    window.location.href = 'login.html';
                }
                User.removeFromLocalArray(m.id);
                break;

            case "setPatientZeroPosition":
                if (patient_zero.marker != null){
                    patient_zero.marker.setMap(null);
                    patient_zero.marker = null;
                }
                patient_zero.x = m.pos.x
                patient_zero.y = m.pos.y
                updateGameBoard();
                break;

            case "refreshPage":
                window.location.reload();
                break;

            default:
                console.log(m);
        }
    }
});

// Unsubscribe when closing the window
window.onbeforeunload = function() {
    return pubnub.unsubscribe({
        channel: _channel
    });
}

// window.onunload = function() {
//     return pubnub.unsubscribe({
//      channel : _channel,
//          });
// };


// Publish

// send start message
function sendStartOfGame() {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'start'
        }
    });
}

// send shout message
function sendShout() {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'shout',
            id: myUser.id
        }
    });
}

function sendAddNPCMessage(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'addNPC',
            id: id
        }
    });
}

function sendRemoveNPCMessage(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'removeNPC',
            id: id
        }
    });
}

function sendRemoveUserMessage(id) {
    console.log("remove")
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'removeUser',
            id: id
        }
    });
}

function sendAddUserMessage(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'addUser',
            id: id
        }
    });
}

function sendChangeUserTypeMessage(id, type) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'changeUserType',
            id: id,
            type: type
        }
    })
}

function sendResetPlayersMessage() {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'resetPlayers'
        }
    })
}

function sendLogOutMessage(id){
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'logOut',
            id: id
        }
    })
}

function sendSetPatientZeroPositionMessage(pos){
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'setPatientZeroPosition',
            pos: pos
        }
    })
}