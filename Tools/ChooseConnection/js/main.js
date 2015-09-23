/**
 * Created by jonathanbobrow on 9/3/15.
 */

// prevent scroll on touch
document.ontouchmove = function (event) {
    event.preventDefault();
}

var startTouchPoint = {x: 0, y: 0};

// Do this stuff on load (thanks jquery!)
$(function () {

    var width = $(window).width();
    var height = $(window).height();
    console.log("window of size: (" + width + ", " + height + ")");

    two = new Two({
        fullscreen: true
    });

    two.appendTo(document.getElementById("two"));

    // Update the renderer in order to generate corresponding DOM Elements.
    two.update();

    initPlayers();

    _.defer(function () {

        two.bind('resize', function () {

        })
            .bind('update', function (frameCount) {

                // update loop here
                TWEEN.update();

            })
            .play();

    });

});

var obj = document.getElementById('two');

obj.addEventListener('onmousedown', function (event) {
    console.log("began press: (" + event.offsetX + ", " + event.offsetY + ")");
}, false);

obj.addEventListener('touchstart', function (event) {
    // If there's exactly one finger inside this element
    if (event.targetTouches.length == 1) {
        var touch = event.targetTouches[0];
        // location of touch
        console.log("began touch: (" + touch.pageX + ", " + touch.pageY + ")");
        document.getElementById('x_coord_start').innerHTML = touch.pageX;
        document.getElementById('y_coord_start').innerHTML = touch.pageY;
        startTouchPoint.x = touch.pageX;
        startTouchPoint.y = touch.pageY;
        makeMeBig();
        showGuideLines();
    }
}, false);

obj.addEventListener('touchmove', function (event) {
    // If there's exactly one finger inside this element
    if (event.targetTouches.length == 1) {
        var touch = event.targetTouches[0];
        // location of touch
        console.log("moved touch: (" + touch.pageX + ", " + touch.pageY + ")");
        document.getElementById('x_coord_move').innerHTML = touch.pageX;
        document.getElementById('y_coord_move').innerHTML = touch.pageY;

        updateLineDirection(touch.pageX - startTouchPoint.x, startTouchPoint.y - touch.pageY);
    }
}, false);

obj.addEventListener('touchend', function (event) {
    console.log("ended touch: (" + event.pageX + ", " + event.pageY + ")");
    document.getElementById('x_coord_end').innerHTML = event.pageX;
    document.getElementById('y_coord_end').innerHTML = event.pageY;
    makeMeSmall();
    makePlayerSmall(selectedPlayerID);
    hideGuideLines();
    drawToSelectedPlayer();
}, false);