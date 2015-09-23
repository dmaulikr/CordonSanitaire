// icons
var me;
var players = [];
var selectedPlayerID = -1;
var lastSelectedPlayer;
var guides = [];

var numPlayers = 20;
var playerSize = 8;
var icon_spacing = 20;
var line_length = 28;

var aim_line;
var aim_circle;

// make layers
var background;
var middleground;
var foreground;


var initPlayers = function () {

    // make layers
    background = two.makeGroup();
    middleground = two.makeGroup();
    foreground = two.makeGroup();

    // make Me

    var x_pos = (0.1 + 0.8 * Math.random()) * $(window).width();
    var y_pos = (0.1 + 0.8 * Math.random()) * $(window).height();

    aim_line = two.makeLine(x_pos, y_pos, x_pos, y_pos);
    aim_line.stroke = '#00CCFF';
    aim_line.opacity = 0;
    aim_line.linewidth = 6;
    aim_line.cap = 'round';
    background.add(aim_line);

    //aim_circle = two.makeCircle(x_pos, y_pos, playerSize / 2)
    //aim_circle.lineWidth = 0;
    //aim_circle.fill = '#000000';
    //background.add(aim_circle);

    var highlight = two.makeCircle(x_pos, y_pos, playerSize);
    highlight.stroke = '#000000';
    highlight.linewidth = 0;
    highlight.opacity = 0.3;
    highlight.fill = "#00CCFF";

    var icon = two.makeCircle(x_pos, y_pos, playerSize);
    icon.stroke = '#000000';
    icon.linewidth = 4;
    icon.fill = '#99DDFF';

    me = {
        icon: icon,
        highlight: highlight
    };

    createOtherPlayers();
};

// make other players
var createOtherPlayers = function () {
    while (players.length < numPlayers) {
        var x_pos = Math.random() * $(window).width();
        var y_pos = Math.random() * $(window).height();
        if (isWellSpacedPosition(x_pos, y_pos))
            createOtherPlayer(players.length, x_pos, y_pos);
    }
};

var isWellSpacedPosition = function (x, y) {

    // proximity to me
    var my_x_diff = x - me.icon.translation.x;
    var my_y_diff = y - me.icon.translation.y;
    var my_dist = Math.sqrt(my_x_diff * my_x_diff) + Math.sqrt(my_y_diff * my_y_diff);

    if (my_dist < icon_spacing)
        return false;

    // proximity to walls
    if (x < icon_spacing || x > $(window).width() - icon_spacing || y < icon_spacing || y > $(window).height() - icon_spacing)
        return false;

    // check proximity to other players
    for (var i = 0; i < players.length; i++) {
        var x_diff = players[i].icon.translation.x - x;
        var y_diff = players[i].icon.translation.y - y;
        var dist = Math.sqrt(x_diff * x_diff) + Math.sqrt(y_diff * y_diff);
        if (dist < icon_spacing)
            return false;
    }
    return true;
};

var createOtherPlayer = function (id, x, y) {
    var theta = Math.atan2(me.icon.translation.x - x, me.icon.translation.y - y) + Math.PI / 2;
    if (theta > 2 * Math.PI) theta -= 2 * Math.PI;
    if (theta < 0) theta += 2 * Math.PI;
    //theta = 2 * Math.PI - theta;
    var degrees = theta * 180 / Math.PI;
    console.log("player " + id + " is " + Math.floor(degrees) + "º from me");

    var highlight = two.makeCircle(x, y, playerSize);
    highlight.stroke = '#000000';
    highlight.linewidth = 0;
    highlight.opacity = 0.5;
    highlight.fill = '#FF9900';

    var icon = two.makeCircle(x, y, playerSize);
    icon.stroke = '#000000';
    icon.linewidth = 4;
    icon.fill = '#FFFF00';

    var guide = two.makeLine(x, y, me.icon.translation.x, me.icon.translation.y);
    guide.stroke = '#00CCFF';
    guide.linewidth = 4;
    guide.opacity = 0;
    background.add(guide);

    var line = two.makeLine(me.icon.translation.x, me.icon.translation.y, me.icon.translation.x, me.icon.translation.y);
    line.stroke = '#000000';
    line.opacity = 1;
    line.linewidth = 4;
    background.add(line);

    players.push({
            icon: icon,
            highlight: highlight,
            guide: guide,
            line: line,
            angle: degrees
        }
    );
};

var makeMeBig = function () {
    new TWEEN.Tween(me.icon)
        .to({scale: 1.5}, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
    new TWEEN.Tween(me.highlight)
        .to({scale: 4}, 750)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
    new TWEEN.Tween(aim_line)
        .to({
            opacity: 0.5
        }, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
};

var makeMeSmall = function () {
    new TWEEN.Tween(me.icon)
        .to({scale: 1}, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
    new TWEEN.Tween(me.highlight)
        .to({scale: 1}, 750)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
    new TWEEN.Tween(aim_line)
        .to({
            opacity: 0.0
        }, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
};

var makePlayerBig = function (id) {
    new TWEEN.Tween(players[id].icon)
        .to({scale: 1.2}, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
    new TWEEN.Tween(players[id].highlight)
        .to({scale: 3}, 750)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
};

var makePlayerSmall = function (id) {
    new TWEEN.Tween(players[id].icon)
        .to({scale: 1}, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
    new TWEEN.Tween(players[id].highlight)
        .to({scale: 1}, 750)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
};

var drawLineToPlayer = function (id) {

};

var removeLineFromPlayer = function (id) {

};

var showGuideLines = function () {
    for (var i = 0; i < numPlayers; i++) {
        new TWEEN.Tween(players[i].guide)
            .to({
                opacity: 0.1
            }, 250)
            .easing(TWEEN.Easing.Elastic.Out)
            .start();
    }
};

var hideGuideLines = function () {
    for (var i = 0; i < numPlayers; i++) {
        new TWEEN.Tween(players[i].guide)
            .to({
                opacity: 0
            }, 250)
            .easing(TWEEN.Easing.Elastic.Out)
            .start();
    }
};

var drawToSelectedPlayer = function () {
    // if no change, don't animate
    if (lastSelectedPlayer == players[selectedPlayerID])
        return;

    var x_pos = players[selectedPlayerID].icon.translation.x - me.icon.translation.x;
    var y_pos = players[selectedPlayerID].icon.translation.y - me.icon.translation.y;
    new TWEEN.Tween(players[selectedPlayerID].line.vertices[1])
        .to({x: x_pos, y: y_pos}, 500)
        .easing(TWEEN.Easing.Exponential.Out)
        .start();

    // return old selected line
    if (lastSelectedPlayer) {
        new TWEEN.Tween(lastSelectedPlayer.line.vertices[1])
            .to({x: 0, y: 0}, 500)
            .easing(TWEEN.Easing.Exponential.Out)
            .start();
    }

    lastSelectedPlayer = players[selectedPlayerID];
};

var getPlayerClosestToDirection = function (degrees) {
    var id = 0;
    var diff = 360;
    for (var i = 0; i < numPlayers; i++) {  // TODO: fix this
        if (Math.abs(players[i].angle - degrees) < diff) {
            diff = Math.abs(players[i].angle - degrees);
            id = i;
        }
        if (Math.abs(360 + players[i].angle - degrees) < diff) {
            diff = Math.abs(players[i].angle - degrees);
            id = i;
        }
    }
    return id;
};

var updateLineDirection = function (x, y) {
    //console.log("my position: ("+me.icon.translation.x+", "+me.icon.translation.y+")");
    var theta = Math.atan2(x, y) - Math.PI / 2;
    if (theta < 0) theta += 2 * Math.PI;
    theta = 2 * Math.PI - theta;
    document.getElementById('angle').innerHTML = Math.floor(theta * 180 / Math.PI);
    //console.log("degrees: " + theta * 180 / Math.PI);
    aim_line.vertices[1].x = Math.round(line_length * Math.cos(theta));
    aim_line.vertices[1].y = -Math.round(line_length * Math.sin(theta));
    //console.log("line point: (" + aim_line.vertices[1].x + ", " + aim_line.vertices[1].y + ")");

    //aim_circle.translation.x = me.icon.translation.x + Math.round(2 * playerSize * Math.cos(Math.atan2(x, y) - Math.PI / 2));
    //aim_circle.translation.y = me.icon.translation.y + Math.round(2 * playerSize * Math.sin(Math.atan2(x, y) - Math.PI / 2));

    var playerID = getPlayerClosestToDirection(Math.floor(theta * 180 / Math.PI));
    if (selectedPlayerID < 0) {
        makePlayerBig(playerID);
        selectedPlayerID = playerID;
    }
    else if (selectedPlayerID != playerID) {
        makePlayerSmall(selectedPlayerID);
        makePlayerBig(playerID);
        selectedPlayerID = playerID;
    }
    // find player closest to direction
    // if doesn't exist a player currently selected
    // connect to player
    // else
    // if different from player currently selected
    // disconnect from current player
    // select new player to connect to

};

var drawLineToPlayer = function (player) {

}