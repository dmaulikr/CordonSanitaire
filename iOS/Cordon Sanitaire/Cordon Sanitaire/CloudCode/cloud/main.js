// set PubNub
var pubnub = {
    publish_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884',
    subscribe_key: 'sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe',
};

var group_channel = "group0"

Parse.Cloud.define("dummyKMeans", function(request, response){
    var channel = request.params.id
    sendMessage("SubscribeToChannel " + group_channel, channel, function() {
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

Parse.Cloud.job("sendPushNotification", function(request, status) {
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo('deviceType', 'ios');
                
    Parse.Push.send({
        where: pushQuery,
        data: {
            alert: "You have been pushed"
        }
        }, { success: function() {
            status.success("Notification sent")
        }, error: function(err) { 
            console.log(err);
            status.error("Something went wrong. Notification was not sent")
        }
    });
})