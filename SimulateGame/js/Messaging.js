/**
* Messaging for all graph communications
* Created by Jonathan Bobrow on 4/7/15.
*/

var _channel = 'ios_development';
var _clientChannel = _channel;
var _adminChannel = _channel;

// my unique ID
var _uuid = PUBNUB.uuid();

// Init
var pubnub = PUBNUB.init({
    publish_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884',
    subscribe_key: 'sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe',
    uuid: _uuid
});

var _players = ["player_one", "player_two", "player_three"];
player_count = 0
// showPlayersList(_players);

// Subscribe to channel
// don't really need to respond,
// simply publishing from here
pubnub.subscribe({
    channel: _channel,
    presence: function(m) {
        console.log(m)
    },
    message: function(m) {
        switch (m.action) {
            default:
                console.log(m);
        }
    }
});

// Publish

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

function sendAddUserMessage() {
	console.log("send add user message")
    player_count++
    if (player_count <= 3 && player_count > 0){
        pubnub.publish({
            channel: _channel,
            message: {
                'action': "AddToLobby",
                'id': _players[player_count-1],
                'username': document.getElementById("playerName").value,
                'latitude': parseFloat(document.getElementById("playerLat").value),
                'longitude': parseFloat(document.getElementById("playerLon").value)
            }
        });
    }
}

function sendJoinMessage(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'Join',
            id: id,
        }
    })
}
function sendReleaseMessage(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'Release',
            id: id,
        }
    })
}

function sendShoutMessage(id) {
    pubnub.publish({
        channel: _channel,
        message: {
            action: 'Shout',
            id: id,
        }
    })
}

function showPlayersList(list){
//   	var joinLink 	= "<a href="#" id="join" class="join btn btn-inline btn-sm btn-inverse">join</a></span><span>";
//   	var releaseLink = "<a href="#" id="release" class="btn btn-inline btn-sm btn-warning">release</a></span><span>";
//   	var shoutLink	= "<a href="#" id="shout" class="btn btn-inline btn-sm btn-danger">shout</a></span><span>";

//       $("#players").html("<li><span>" + list.join(joinLink) + joinLink + releaseLink + shoutLink + "</span></li>");
//       $(".join").click(function(e){
//           e.preventDefault();
//           var parent = $(e.target).parent("span");
//           var playerID = parent.text().split(" ")[0];
//           console.warn("join " + playerID);
//       });
//       $(".release").click(function(e){
	// });
//       $(".shout").click(function(e){
	// });
}
