/* User class object */

/**
 * Constructor for User Class
 */
var User = function(x, y, role, type){
    this.id   = null; // id will be attributed once the object is pushed to the database
    this.x    = x;
    this.y    = y;
    this.role = role;
    this.type = type;
    this.marker = null;
};

/**
 * Returns wheter an user is active or not.
 * @return boolean [true if the the user is active, false otherwise]
 */
User.prototype.isActive = function() {
    return this.type == TypeEnum.Active
};