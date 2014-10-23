class Border{
  ArrayList<Person> persons;
  ArrayList<Person> personsInBorder;
  
  Border(ArrayList p) {
    personsInBorder = new ArrayList<Person>();
    persons = p;
  }
  
  //
  void determineBestNearestNeighborPath() {
    float min = MIN_FLOAT;
    int index = 0;
    
    Person p1, p2;
    
    for(int i=0; i<persons.size(); i++){
    
      createNearestNeighborPath(persons.get(i));
      float dist = 0;
      
      for(int j=0; j<personsInBorder.size(); j++){
        p1 = (Person)personsInBorder.get(j);
        p2 = (Person)personsInBorder.get(j==personsInBorder.size()-1 ? 0 : j+1);
        dist += sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
      }
      
      if( dist < min ) {
        index = i;
        min = dist;
      }
    }

    // generate path of the winner
    createNearestNeighborPath(persons.get(index));
  }
  
  //
  void createNearestNeighborPath(Person p) {
    personsInBorder.clear();
    personsInBorder.add(p);

//    println("people in border: " + personsInBorder.size());
//    println("people in general: " + persons.size());
    
    while(personsInBorder.size() < persons.size()) {
      Person pnn = personsInBorder.get(personsInBorder.size()-1);
      personsInBorder.add(getNearestNeighbor(pnn));
      println("people in border: " + personsInBorder.size());
    }
    
//    println("people in border: " + personsInBorder.size());
//    println("people in general: " + persons.size());
  }
  
  boolean isPersonAlreadyInBorder(Person p) {
    for(int i=0; i<personsInBorder.size(); i++) {
      Person pb = (Person)personsInBorder.get(i);
      if(p == pb)
        return true;
    }
    return false;
  }
  
  //
  Person getNearestNeighbor(Person p) {
   Person nn = (Person)persons.get(0);
   Person n;
   float min = MAX_FLOAT;
   
   for(int i=0; i<persons.size(); i++){
     n = (Person)persons.get(i);
     if(n != p && !isPersonAlreadyInBorder(n)) {
       // check distance
       float dist = sqrt((n.x-p.x)*(n.x-p.x)+(n.y-p.y)*(n.y-p.y));
       
       if(dist < min) {
         nn = n;
         min = dist;
//         println("min dist: " + min);
       }
     }
   }
      
//   println("neighbor x: " + nn.x);
   return nn; 
  }
  
  // function to look through the path to find intersections and remove them
  void removeCrossedPaths() {
  }
  
  // function to determine whether the path intersects with these 4 points
  bool areTheseTwoPathsCrossed(PVector p1, PVector p2, PVector p3, PVector p4) {
    return false;
  }
  
  //
  void display() {
    Person p1, p2;
    stroke(255,0,0);
    strokeWeight(3);
    float dist = 0;
    for(int i=0; i<personsInBorder.size(); i++){
      p1 = (Person)personsInBorder.get(i);
      p2 = (Person)personsInBorder.get(i==personsInBorder.size()-1 ? 0 : i+1);
      line(p1.x, p1.y, p2.x, p2.y);
      dist += sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
    }
    
    println("path distance: " + dist);
  } 
}
