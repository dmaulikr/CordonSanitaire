/*
  Cordon Sanitaire
   - draw a path connecting all people to their closest person
   - Look for intersections, then swap until no intersections. Enforse the convex path.
  by Jonathan Bobrow
  October 17, 2014
*/
ArrayList<Person> persons;
int numPeople = 20;
int startPerson = 0;
int margin = 50;

Border border;

void setup(){
  size(1000,600,P2D);
  persons = new ArrayList<Person>();
  
  randomSeed(3);  // use a random seed to help with debugging (same results every run)
  for(int i=0; i<numPeople; i++){
    persons.add(new Person((int)random(margin,width-margin), (int)random(margin,height-margin)));
  }
  
  border = new Border(persons);
  drawOnce();
}

void draw(){
}

void drawOnce(){
  background(204);
  for(int i=0; i<persons.size(); i++){
    Person p = (Person)persons.get(i);
    p.display();
  }
  
  border.display();
}

void keyPressed(){
  
  // start drawing with a different person
  if(key == ' ') {
    if(startPerson < numPeople - 1)
      startPerson++;
    else
      startPerson = 0;
    
    border.determineBestNearestNeighborPath();
    //border.createNearestNeighborPath(persons.get(startPerson));
  
    drawOnce();
  }
  
  // remove intersections
  else if(key == 'r') {
    border.removeCrossedPaths();
    drawOnce();
  }
}
