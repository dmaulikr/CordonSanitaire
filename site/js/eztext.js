// curl -d 'User=winnie&Password=the-pooh&PhoneNumbers[]=2123456785&PhoneNumbers[]=2123456786&PhoneNumbers[]=2123456787&PhoneNumbers[]=2123456788&Groups[]=honey lovers&Subject=From Winnie&Message=I am a Bear of Very Little Brain, and long words bother me&StampToSend=1305582245' https://app.eztexting.com/sending/messages?format=xml

function sendCurlRequest(){
	
    var json_data = {
                "User": "jbobrow",
                "Password": "dmiHQzPp6Kxt3q",
                "Subject":"From JB",
				"Message":"Testing EZ Text API",
				"PhoneNumbers":[
					"8186207518" 
					]};
					
    $.ajax({
	    cache : false,       
	    type: 'POST',
	    crossDomain:true,
	    url: 'https://app.eztexting.com/sending/messages?format=json',
	    data:json_data,
// 	    dataType: "jsonp",
	    contentType:"application/json",
	    success: function(data){
	            alert(data);
	        var pubResults = data;       
	    },
	    error: function(data){
	    	alert("ERROR RESPONSE FROM DRUID SERVER : "+JSON.stringify(data));
	    },
	    complete: function(data){
	        console.log("call completed");
	    }
    });
}

// Make the actual CORS request.
// http://stackoverflow.com/questions/20035101/no-access-control-allow-origin-header-is-present-on-the-requested-resource
// https://developer.chrome.com/extensions/xhr
// http://www.html5rocks.com/en/tutorials/cors/#toc-adding-cors-support-to-the-server
// Check this out later. Today, we hack :)

var sendTextMessage = function() {
	// simply send to the php page that successfully sends the text message
	var url = "http://playful.jonathanbobrow.com/prototypes/cordonsans/control/sendSMS/"
	var win = window.open(url, '_blank');
	//sendCurlRequest();
};