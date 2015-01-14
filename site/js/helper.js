/**
 * Set of helper functions.
 */

/////////////
// GENERAL //
/////////////

/**
 * Given a type, return the proper marker.
 * @param  {typeEnum}
 * @return {marker}
 */
function getMarkerIcon(type) {

  // common options for icons
  var _icon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#FFFFFF',
    fillOpacity: 1.0,
    scale: 8,
    strokeColor: settings.color_border_stroke,
    strokeOpacity: 0.8,
    strokeWeight: 4
  };

  // set the colors now that we know what type we are
  switch(type){

    case TypeEnum.INFECTIOUS:
            _icon.scale = 16;
            _icon.fillColor = settings.color_infectious_fill;
            _icon.strokeColor = settings.color_infectious_stroke;
      break;

    case TypeEnum.HEALED:
            _icon.scale = 16;
            _icon.fillColor = settings.color_healed_fill;       // don't change the color of patient zero
            _icon.strokeColor = settings.color_healed_stroke;   // instead change the color of the quarantine
      break;

    case TypeEnum.ACTIVE:
           _icon.fillColor = settings.color_active_fill;
           _icon.strokeColor = settings.color_active_stroke;
      break;

    case TypeEnum.PASSIVE:
            _icon.fillColor = settings.color_passive_fill;
            _icon.strokeColor = settings.color_passive_stroke;
      break;

    case TypeEnum.TRAPPED:
            _icon.fillColor = settings.color_casualty_fill;
            _icon.strokeColor = settings.color_casualty_stroke;
      break;
  }

  // make the person stand out so they know who they are
  // Now handled in the animation

  return _icon;
}

/**
 * Get the type of an object. Right now only works with npcs.
 * @param  obj
 * @return {TypeEnum} type
 */
function getType(obj) {

  var type = obj.type;

  var poly = getActivePopulationAsNormalCoords();

  // check for casualty
  if(isPointInPoly(poly, obj.x, obj.y))
    type = TypeEnum.TRAPPED;
  else
    type = TypeEnum.PASSIVE;

  // check for patient zero
  if(obj.isPatientZero) {
    if(isPointInPoly(poly, obj.x, obj.y))
      type = TypeEnum.HEALED;
    else
      type = TypeEnum.INFECTIOUS;
  }

  return type;
}

/**
 * Given an array of users, returns the center locations of those users.
 * @param  users [users]
 * @return loc   [the center of the coordinates of the users]
 */
var getCenter = function(users){
    var total = {x:0, y:0};
    var loc = {x:0 , y: 0};

    for (var i = 0; i < users.length; i++){
        total.x += users[i].x;
        total.y += users[i].y;
    }
    loc.x = total.x/users.length;
    loc.y = total.y/users.length;
    return loc;
}