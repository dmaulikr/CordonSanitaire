//----------------------------
// Map stuffs
//----------------------------

// sort people
function sortPeople() {

    var sortedPeople = [];
    sortedPeople.clear();

    var lastPerson = people[0];
    sortedPeople.push(lastPerson);

    for (var i = 0; i < people.length - 1; i++) {
        var nextPerson = getNextPersonCounterClockwise(lastPerson);
        sortedPeople.push(nextPerson);
        lastPerson = nextPerson;
    }

    people = sortedPeople;
}

//returns the next person in a counterclockwise direction
function getNextPersonCounterClockwise(p) {

    var min = 2 * Math.PI; // max angle
    var index = 0;

    var start_theta = Math.atan2((p.y - center.y), (p.x - center.x));

    for (var i = 0; i < people.length; i++) {

        if (people[i] == p)
            continue;

        var p_theta = Math.atan2((people[i].y - center.y), (people[i].x - center.x));
        var diff = p_theta - start_theta;

        if (diff < 0)
            diff += 2 * Math.PI;

        if (diff < min) {
            index = i;
            min = diff;
        }
    }

    return people[index];
}

//pass debugging data -center coordinates and people's locations as html code.
var printDebugData = function() {

    var string = "<ol><li>center: " + center.x + ", " + center.y + "</li>";

    for (var i = 0; i < people.length; i++) {
        string += "<li>person " + i + " location " + people[i].x + ", " + people[i].y + "</li>";
    }
    string += "</ol>";
    document.getElementById("debug_data").innerHTML = string;

};


//----------------------------
//      Modal Window
//----------------------------
/*
var dialog = document.querySelector('dialog');
dialog.showModal();
*/


var close = document.querySelector('#close');
close.onclick = function() {
    if (isUserAllowedToStart()) {
        // hide intro view
        document.getElementById("overlay").style.visibility = 'hidden';
    }
};


// end of game pop up
var showEndGameMessage = function() {

    var end_game_text = "";
    var numTrapped = countCasualties();
    var totalArea = getAreaQuarantined();
    var numJoined = countActivePeople();
    var numPresent = people.length - 1; // ignore the Patient Zero

    if (isPatientZeroContained()) {

        end_game_text = "Patient Zero has been contained";

        // update count of casualties
        if (numTrapped == 0) {
            end_game_text += " with only a few healthy people trapped inside the quarantine.";
        } else if (numTrapped > 0 && numTrapped < 5) {
            end_game_text += " (along with ";
            end_game_text += numTrapped;
            end_game_text += " heathy people, sadly.)"
        } else if (numTrapped > 5) {
            end_game_text += ", but ";
            end_game_text += numTrapped;
            end_game_text += " healthy people are trapped inside the quarantine!"
        }

        // comment on quarantine total area
        /*
                if(totalArea < 11) {
                    end_game_text += " You also managed to contain the patient in an area less than half the size of Manhattan.";
                }
                else if(totalArea >= 11 && totalArea <= 22.7) {
                    end_game_text += " It took a quarantine nearly the size of Manhattan to contain patient zero.";
                }
                else if(totalArea >= 22.7) {
                    end_game_text += " 9 million people could be affected, the quarantine amasses larger than the size of Manhattan.";
                }
        */

        // comment on number of people quarantining
        if (numJoined < 3) {
            end_game_text += " Looks like not enough poeple committed to quarantining Patient Zero.";
        } else if (numJoined >= 3) {
            end_game_text += " ";
            end_game_text += numJoined;
            end_game_text += " people successfully formed the front line.";
        }
        /*
                else if(numJoined > 8) {
                    end_game_text += " Remember, you don't need that many people to contain the outbreak, just the right ones!";
                }
        */

        end_game_text += " Quarantines depend on everyone... The next outbreak is tomorrow.";

    } else {
        end_game_text = "";
        end_game_text += numJoined;
        end_game_text += " formed the quarantine line, but Patient Zero is outside it! Everyone has failed to contain the infection (you all lose!)";

        // update count of casualties
        if (numTrapped == 0) {
            //end_game_text += " At least you didn't trap healthy people inside.";
        } else if (numTrapped > 0) {
            end_game_text += " Not only is Patient Zero on the loose, but ";
            end_game_text += numTrapped;
            end_game_text += " people are trapped inside inside the quarantine."
        }
        /*
                else if(numTrapped > 5) {
                    end_game_text += "With ";
                    end_game_text += numTrapped;
                    end_game_text += " healthy people trapped inside, the team needs to work better together."
                }
        */

        /*
                // comment on quarantine total area
                if(totalArea < 11) {
                    end_game_text += " You also managed to contain the patient in an area less than half the size of Manhattan.";
                }
                else if(totalArea >= 11 && totalArea <= 22.7) {
                    end_game_text += " It took a quarantine nearly the size of Manhattan to contain patient zero.";
                }
                else if(totalArea >= 22.7) {
                    end_game_text += " 9 million people could be affected, the quarantine amasses larger than the size of Manhattan.";
                }
        */

        // comment on number of people quarantining
        if (numJoined < 3) {
            end_game_text += " Looks like a quarantine wasn’t formed. We need 3 people to form it.";
        }
        /*
                else if(numJoined >= 3 && numJoined <= 8) {
                    end_game_text += " You had the right idea, the fewer people on the front lines, the fewer in contact with patient zero.";
                }
                else if(numJoined > 8) {
                    end_game_text += " Remember, you don't need that many people to contain the outbreak, <b>just the right ones!</b>";
                }
        */


        end_game_text += " This particular infection wasn’t contained. But there’s a new one tomorrow.";
    }

    document.getElementById("end_game").innerHTML = end_game_text;
    document.getElementById("end_game").style.visibility = "visible";
    document.getElementById("patient_zero").style.visibility = 'hidden';

};

// missed the game pop up
var showMissedGameMessage = function() {
    var missed_game_text = "";

    if (isPatientZeroContained()) {
        missed_game_text = "Too Late! Quarantines depend on everyone... The next outbreak is tomorrow.";
    } else {
        missed_game_text = "Too Late! This particular infection wasn’t contained... But there’s a new one tomorrow.";
    }
    document.getElementById("end_game").innerHTML = missed_game_text;
    document.getElementById("end_game").style.visibility = "visible";
    document.getElementById("patient_zero").style.visibility = 'hidden';
};


//----------------------------
//      General Actions
//----------------------------

//Changes user's state to Active.
function flipUserActiveState() {
    // something with parse to set the value inactive
    console.log("flipping user state");

    var User = Parse.Object.extend("_User");
    var query = new Parse.Query(User);
    query.get(myUser.id, {
        success: function(object) {
            var type = object.get("type");
            console.log(type);
            if (type == TypeEnum.PASSIVE)
                type = TypeEnum.ACTIVE;
            else if (type == TypeEnum.ACTIVE)
                type = TypeEnum.PASSIVE
            else
                throw "The flip state button is not supposed to be available."

			// save the state in parse and then notify players via pubnub
			// currently saves the type over its previous type
			// ----------------------------------------------------------------
			// change this to save a history by adding a new and latest value to 
			// the running log of actions with a reference to the table of users

            object.set("type", type);
            object.save(null, {
                success: function(object) {
                    // then update pubnub
                    sendChangeUserTypeMessage(object.id, type);

                    // TODO: Change these calls to use "then" in sequence
                    // test save to the actions table before relying on this table for current state
                    //var user_relation = Parse.Relation(User, myUser.id);
                    var Action = Parse.Object.extend("Actions");
                    var action_obj = new Action();

                    action_obj.save({
                        user: Parse.User.current(),
                        type: type,
                        x: myUser.x,    // updated position...
                        y: myUser.y		// updated position...
                    }, {
                        success: function(action_obj) {
                            // The object was saved successfully.
                            console.log("Success: Added a log of user's action");
                        },
                        error: function(action_obj, error) {
                            // The save failed.
                            // error is a Parse.Error with an error code and message.
                            console.log("Error: " + error.code + " " + error.message);
                        }
                    });

                },
                error: function(object) {
                    console.log("WOAAAAHHHH NOOOOOOO!", object);
                    console.log("Error: " + error.code + " " + error.message);
                }
            });

        },
        error: function(error) {
            console.log("Error: " + error.message);
        }

    });
}




//----------------------------
//          Utility
//----------------------------
Array.prototype.clear = function() {
    while (this.length > 0) {
        this.pop();
    }
};

