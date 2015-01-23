
// reset all of the players back to no-one playing
Parse.Cloud.define("setAllUsersNotPresent", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("present", true);
    query.each( function (user) {
        if (!user.get('admin')){
            console.log("resetting " + user.id);
            user.set("present", false);
            return user.save();
        }
    }).then(function(){
        response.success("Users reset");
    }, function(error) {
        response.error("Error: " + error.code + " " + error.message);
    });
});

Parse.Cloud.job("choosePatientZero", function(request, status){

})