//creates a score object that is specific to each player and is updated after each move.
var Score = function(id){
    this.id = id;
    //check for changes in user state for score updates
    this.status = getType(User.getPersonById(id));
    this.pZeroStatus = isPatientZeroContained();
    //score
    this.score = 0;
    //checks upon first action if joined in first 3
    this.joinFirst = false;
    this.joinSecond = false;
    this.joinThird = false;
    //updating numbers
    this.peopleTrapped = 0;
    this.peopleSaved = 0;
    this.timesJoined = 0;
    this.timesReleased = 0;
    this.timesShouted = 0;
    this.trappedPZero = 0;
    this.releasedPZero = 0;
};

Score.prototype.updateScore = function(){
    //checks to see if user was among first 3 to join, updates boolean values accordingly
    this.didJoinFirst();
    var newStatus = getType(User.getPersonById(id));


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

////check status of patient zero
//if (_patientZeroContained)
//    document.getElementById('patient_status').innerHTML = 'contained';
//else
//    document.getElementById('patient_status').innerHTML = 'not contained';
//
//// update count of casualties
//document.getElementById('casualty_count').innerHTML = countCasualties();
//
//// calculate the sq mi of quarantine...
//document.getElementById('area_quarantined').innerHTML = getAreaQuarantined();
//
//// update count of people quarantining
//document.getElementById('num_active').innerHTML = countActivePeople();
//
//// update score