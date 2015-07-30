
var message = document.getElementById('msg');
var latitude = document.getElementById('lati');
var longitude = document.getElementById('lon');


//determines user's latitude and longitude if possible.
function getLocation(){
	
	if(!navigator.geolocation){
		message.innerHTML = "<p> Geolocation is not supported by your browser. </p>";
		return;
	}

	function success(position){
		message.innerHTML = "Your coordinates are:";
		latitude.innerHTML = position.coords.latitude;
		longitude.innerHTML = position.coords.longitude;

	};

	function failure(){
		message.innerHTML = "Failed to retrieve coordinates.";
	};

		message.innerHTML = "<p>In progress...</p>";
		navigator.geolocation.getCurrentPosition(success, failure);

		return (position.coords.latitude, position.coords.longitude)
}

function getUserCoordinates(){
	if (navigator.geolocation){
		console.log("Finding coordinates");
		function success(position){
			return(position.coords.latitude, position.coords.longitude);
			console.log("success");
		};
		function failure(){
			console.log("Failed to retrieve coordinates");
		};
		navigator.geolocation.getCurrentPosition(success, failure);
	}
	console.log("Geolocation not supported");
	return (void,void);
}
