class Person{
  
  State state;
  PVector pos;
  
  Person(int xPos, int yPos){
    pos = new PVector(xPos, yPos);
    state = State.BORDER;
  }

  void display(){
    
    strokeWeight(1);

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
    
    ellipse(pos.x,pos.y,10,10);    
  }
}
