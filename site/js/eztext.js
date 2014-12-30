// curl -d 'User=winnie&Password=the-pooh&PhoneNumbers[]=2123456785&PhoneNumbers[]=2123456786&PhoneNumbers[]=2123456787&PhoneNumbers[]=2123456788&Groups[]=honey lovers&Subject=From Winnie&Message=I am a Bear of Very Little Brain, and long words bother me&StampToSend=1305582245' https://app.eztexting.com/sending/messages?format=xml

function sendCurlRequest(){
    var json_data = {
                "User": "jbobrow",
                "Password": "",
                "Subject":"From JB",
				"Message":"Testing EZ Text API",
				"StampToSend":"05-16-2011 5:44 PM",
				"PhoneNumbers":[
					"8186207518",
					"8186207518" 
					]};
    $.ajax({
         cache : false,       
     type: 'POST',
     crossDomain:true,
     url: 'https://app.eztexting.com/sending/messages?format=json',
     data:json_data,
     //dataType: "jsonp",
     contentType:"application/jsonp",
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

sendCurlRequest();