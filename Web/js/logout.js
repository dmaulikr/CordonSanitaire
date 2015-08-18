function idleLogout() {
    var t;
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer; // catches touchscreen presses
    window.onclick = resetTimer;     // catches touchpad clicks
    window.onscroll = resetTimer;    // catches scrolling with arrow keys
    window.onkeypress = resetTimer;

    function logout() {
        alert("Due to inactivity, you have been logged out.")
        Parse.User.logOut();
        window.location.href = 'login.html';
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(logout, 15 * 60 * 1000);  // time is in milliseconds
    }
}

function userLogout() {
    if (window.confirm("Are you sure you want to log out?")){
        Parse.User.current().save({
            present : false
        });
        sendLogOutMessage(myUser.id);
        Parse.User.logOut();
        window.location.href = 'login.html';
    }
}

function pingLoop() {
    var pingInterval = setInterval( function() {
            ping();
    }, 60 * 1000);
}

function ping() {
    console.log("ping called");

    Parse.Cloud.run('ping', {}, {
        success: function(){
            console.log("ping successfully sent");
        },
        error: function(error){
            console.log("Error: " + error.code + " " + error.message);
        }
    });
}

// run idle log out loop 
// NOTE: JB - do we ever need to log someone out?
// 
// idleLogout();