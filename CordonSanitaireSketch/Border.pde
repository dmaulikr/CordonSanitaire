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
        dist += p1.pos.dist(p2.pos);
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
//      println("people in border: " + personsInBorder.size());
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
       float dist = p.pos.dist(n.pos);
       
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
    // look for crossed paths
    Person p1, p2, p3, p4;
    
    //while( numberOfIntersections(personsInBorder) > 0 ) {
      // compare each line segment with every other line segment. (avoid redundancy)
      for(int i=0; i<personsInBorder.size(); i++) {
        boolean breakout = false;
        int p1_index = i;
        int p2_index = i == personsInBorder.size()-1 ? 0 : i+1; // wrap around
        p1 = (Person)personsInBorder.get(p1_index);
        p2 = (Person)personsInBorder.get(p2_index);
        
        for(int j=i+2; j<personsInBorder.size(); j++) {
          // check for intersection here
          int p3_index = j;
          int p4_index = j == personsInBorder.size()-1 ? 0 : j+1; // wrap around
          p3 = (Person)personsInBorder.get(p3_index);
          p4 = (Person)personsInBorder.get(p4_index);
  
          if(doIntersect(p1.pos, p2.pos, p3.pos, p4.pos)){
            println("found intersection at " + p1_index + "," + p2_index + " and " + p3_index + "," + p4_index);
            // determine the swap that doesn't create more intersections
            if( numberOfIntersections(personsInBorder, p1_index, p4_index) < numberOfIntersections(personsInBorder, p1_index, p4_index))
              Collections.swap(personsInBorder, p1_index, p4_index);
            else
              Collections.swap(personsInBorder, p2_index, p3_index);
              
            // one intersection at a time
            println("breakout");
            breakout = true;
            break;
          }
        }
        if(breakout)
          break;
      }
    //}
  }
  
  // return the number of intersections with a given swap
  int numberOfIntersections(ArrayList list, int a, int b){    
    Collections.swap(list, a, b);
    return numberOfIntersections(list);
  }

  // return the number of intersections in an ordered list of people
  int numberOfIntersections(ArrayList list){    
    int count = 0;
    Person p1, p2, p3, p4;
        
    // compare each line segment with every other line segment. (avoid redundancy)
    for(int i=0; i<list.size(); i++) {
      int p1_index = i;
      int p2_index = i == list.size()-1 ? 0 : i+1; // wrap around
      p1 = (Person)list.get(p1_index);
      p2 = (Person)list.get(p2_index);
      
      for(int j=i+2; j<list.size(); j++) {
        // check for intersection here
        int p3_index = j;
        int p4_index = j == list.size()-1 ? 0 : j+1; // wrap around
        p3 = (Person)list.get(p3_index);
        p4 = (Person)list.get(p4_index);

        if(doIntersect(p1.pos, p2.pos, p3.pos, p4.pos)){
          count++;
        }
      }
    }
    
    return count;
  }
    
  //
  void display() {
    Person p1, p2;
    stroke(255,0,0);
    strokeWeight(2);
    float dist = 0;
    for(int i=0; i<personsInBorder.size(); i++){
      p1 = (Person)personsInBorder.get(i);
      p2 = (Person)personsInBorder.get(i==personsInBorder.size()-1 ? 0 : i+1);
      line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
      fill(0);
      text(i, p1.pos.x + 20, p1.pos.y);
      dist += p1.pos.dist(p2.pos);
    }
    
    println("path distance: " + dist);
  } 
}
