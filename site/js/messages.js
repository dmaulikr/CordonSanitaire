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
                    hasReceivedJoinedMessage = true;
                    setup();
                }
                // updatePopulation();
                break;

            case "leave":
                // set this user to no longer focussed...
                console.log("received LEAVE message - " + m.uuid);
                updatePopulation();
                break;
        }
    },
    message: function(m) {
        switch (m.action) {

            case "update":
                console.log("received UPDATE message");
                updatePopulation();
                break;

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
                if (!User.isIdPresent(m.id)) {
                    User.addToLocalArray(m.id);
                } else {
                    console.log("User " + m.id + " was already present in the local array");
                }
                break;

            case "changeUserType":
                User.changeUserType(m.id, m.type);
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
var sendUpdateMessage = function() {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'update'
        }
    });
}


// send start message
var sendStartOfGame = function() {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'start'
        }
    });
}

// send shout message
var sendShout = function() {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'shout',
            id: myUser.id
        }
    });
}

var sendAddNPCMessage = function(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'addNPC',
            id: id
        }
    });
}

var sendRemoveNPCMessage = function(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'removeNPC',
            id: id
        }
    });
}

var sendAddUserMessage = function(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'addUser',
            id: id
        }
    });
}

var sendChangeUserTypeMessage = function(id, type) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'changeUserType',
            id: id,
            type: type
        }
    })
}