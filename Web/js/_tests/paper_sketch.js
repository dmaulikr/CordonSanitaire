
var path;			// path that represents the rope held by the population

// draw people
var drawPeopleInBorder = function(people) {
    path = new paper.Path();
    path.closed = true;
    
    console.log("# of people: " + people.length);

    for (var i = 0; i<people.length; i++) {
    	path.add(new paper.Point(view.size * people[i].x, paper.view.size * people[i].y);
        var shape = new paper.Shape.Circle(new paper.Point(paper.view.size * people[i].x, paper.view.size * people[i].y), 10);
        shape.strokeWidth=5;
        shape.strokeColor = 'black';
        shape.fillColor = 'yellow';
    }

    // path.smooth();
    path.fillColor = 'white';
    path.strokeWidth = 10;
    path.strokeColor = 'black';
    path.strokeJoin = 'round';
}

var drawPatientZero = function() {
    var shape = new paper.Shape.Circle(paper.view.size * .5, 10);
    shape.strokeWidth=5;
    shape.strokeColor = 'black';
    if(path.hitTest(paper.view.size*.5))
        shape.fillColor = 'cyan';
    else
    	shape.fillColor = 'red';

}

//-----------------
//		MAIN
//-----------------

// Get a reference to the canvas object
//var canvas = document.getElementById('sample');
// Create an empty project and a view for the canvas:
//paper.setup(canvas);
//load people
// loadPeople();
// Create a Paper.js Path to draw a line into it:
//paper.view.draw();

// update loop
function onFrame() {
	// do stuff on each frame here
	//loadPeople();
}
