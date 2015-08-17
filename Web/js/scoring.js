//creates a score object that is specific to each player and should be updated after each move.
var Score = function(id){
    this.id = id;
    //check for changes in user state for score updates
    this.status = getType(User.getPersonById(id));
    this.pZeroStatus = isPatientZeroContained();
    this.casualties = countCasualties();
    this.isGameOver = false;

    //score
    this.score = 0;
    //in gmaps.js, updates the scores of first 3 individuals who join
    this.joinFirst = false; //+10
    this.joinSecond = false; //+5
    this.joinThird = false; //+1
    //updating numbers
    this.peopleTrapped = 0; //-1
    this.peopleSaved = 0; //+1

    this.timesJoined = 0;
    this.timesReleased = 0;
    this.timesTrapped = 0;
    //this.timesShouted = 0;

    this.trappedPZero = 0; //+10
    this.releasedPZero = 0; //-10

    //Add something for forming/breaking the quarantine? +-5
    //Add something for emoji use/shout? but don't want to promote spamming
};

//Uses number properties to update this.score
Score.prototype.updateScore = function(){
    //does this work asynchronously?
    this.updateAction();
    this.updatePeople();

    this.score = this.calculateScore();
};

//calculates user score based on numbers
Score.prototype.calculateScore = function(){
    var joinBonus = 0;
    if (this.joinFirst == true){
        joinBonus = 10;
    }
    else if (this.joinSecond == true){
        joinBonus = 5;
    }
    else if (this.joinThird == true){
        joinBonus = 1;
    }

    var endBonus = 0;    //NOTE: not implemented yet: if game is over and P0 is trapped, add 100.
    var calScore = this.peopleSaved - this.peopleTrapped + 10*this.trappedPZero - 10*this.releasedPZero + joinBonus + endBonus;
    return calScore;
};

//Updates stats involving status of the user (ie joined, released, shouted)
Score.prototype.updateAction = function(){
    var newStatus = getType(User.getPersonByID(id));
    if (newStatus == "ACTIVE"){
        this.timesJoined +=1;
    }
    if (newStatus == "PASSIVE"){
        this.timesReleased +=1;
    }
    if (newStatus == "TRAPPED"){
        this.timesTrapped +=1;
    }
};

//Updates people trapped, saved, and pzero
Score.prototype.updatePeople = function(){
    var newCasualties = countCasualties();
    var diff = this.casualties - newCasualties;
    if (diff > 0){
        this.peopleTrapped += diff;
    }
    else {
        this.peopleSaved -= diff;
    }

    //checks for changes in patient zero status
    var newPZeroStatus = isPatientZeroContained();
    if (this.pZeroStatus != newPZeroStatus){
        if (newPZeroStatus == true){
            this.trappedPZero +=1;
        }
        else {
            this.releasedPZero +=1;
        }
    }
};

//Sets all values to zero, and states to current
Score.prototype.resetScore = function(){
    this.status = getType(User.getPersonById(id));
    this.pZeroStatus = isPatientZeroContained();
    this.casualties = countCasualties();

    this.score = 0;

    this.joinFirst = false;
    this.joinSecond = false;
    this.joinThird = false;

    this.peopleTrapped = 0;
    this.peopleSaved = 0;

    this.timesJoined = 0;
    this.timesReleased = 0;
    //this.timesShouted = 0;

    this.trappedPZero = 0;
    this.releasedPZero = 0;
};

//returns User scoreg
Score.prototype.getScore = function(){
    return this.score;
};

//returns User's actions.
Score.prototype.getStats = function(){
    var stats = [
        this.timesJoined,
        this.timesReleased,
        this.timesTrapped
    ];
    return stats;
};


function countCasualties() {
    var count = 0;

    // count players casualties
    for (var i = 0; i < people.length; i++) {
        if (!people[i].isPatientZero) {
            if (getType(people[i]) == TypeEnum.TRAPPED)
                count++;
        }
    }

    // count npcs casualities
    for (var b = 0; b < npcs.length; b++) {
        if (!npcs[b].isPatientZero) {
            if (getType(npcs[b]) == TypeEnum.TRAPPED)
                count++;
        }
    }

    _numTrapped = count;

    return count;
}

//returns number of people active in quarantine
function countActivePeople() {
    var count = 0;

    for (var i = 0; i < people.length; i++) {
        if (people[i].isActive())
            count++;
    }

    return count;
}

//boolean value representing state of patient zero
function isPatientZeroContained() {

    if (patient_zero == null)
        return true;

    if (quarantine == null || quarantine.length < 3) { // can't do it with less than 3
        console.log("fewer than 3 people maintaining quarantine");
        patientZeroContained = false;
        return false;
    }

    _patientZeroContained = (patient_zero.type == TypeEnum.HEALED);

    return _patientZeroContained
}
