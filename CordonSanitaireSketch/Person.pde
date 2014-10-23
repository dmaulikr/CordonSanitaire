class Person{
  
  State state;
  int x, y;
  
  Person(int xPos, int yPos){
    x = xPos;
    y = yPos;
    state = State.BORDER;
  }

  void display(){
    
    strokeWeight(5);

    switch(state) {
      case CONTAGIOUS:
        stroke(0);
        fill(255,0,0);      
        break;
      
      case INSIDE:
        stroke(0);
        fill(0,235,235);      
        break;
      
      case BORDER:
        stroke(0);
        fill(255);      
        break;
      
      case OUTSIDE:
        stroke(0);
        fill(0);
        break;
    }
    
    ellipse(x,y,25,25);    
  }
}
