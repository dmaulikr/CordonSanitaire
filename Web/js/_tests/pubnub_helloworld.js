 // Initialize with Publish & Subscribe Keys
 
 var pubnub = PUBNUB.init({
     publish_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884',
     subscribe_key: 'pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884'
 });

// get the time
// pubnub.time(
// 	function(time){
//     	console.log(time)
// 	}
// );

// Subscribe to a channel
 
pubnub.subscribe({
	channel: 'my_channel',
	message: function(m){console.log(m)}
});

 // Publish a welcome message
 
 pubnub.publish({
     channel: 'my_channel',        
     message: 'Hello from the PubNub Javascript SDK. One. Two. One. Two'
 });

 // Get List of Occupants and Occupancy Count.
 
 // pubnub.here_now({
 //     channel : 'my_channel',
 //     callback : function(m){console.log(m)}
 // });

/*
pubnub.subscribe({
     channel: "my_channel",
     presence: function(m){console.log(m)},
     message: function(m){console.log(m)}
 });
 */