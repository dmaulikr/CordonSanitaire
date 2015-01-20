//----------------------------
//          PubNub
//----------------------------

// Init
var pubnub = PUBNUB.init({
    keepalive: 30,
    publish_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884',
    subscribe_key: 'sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe',
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
                } else {
                    console.log("User " + m.id + " was already present in the local array or I have not joined the game yet.");
                }
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