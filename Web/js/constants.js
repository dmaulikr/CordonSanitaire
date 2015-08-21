// Global Variables
var DEFAULT_DURATION = 45;
var DEFAULT_DELAY_START_GAME = 10;
var NUM_REQUIRED_PLAYERS = 5;

// map limits
// BOSTON
var LAT_MIN = 42.354485;
var LAT_MAX = 42.365140;
var LON_MIN = -71.069870;
var LON_MAX = -71.051245;

// NYC
//40.704204;
//40.829535;
//-74.096729;
//-73.834258;

var LAT_CENTER = (LAT_MAX + LAT_MIN)/2;
var LON_CENTER = (LON_MAX + LON_MIN)/2;

// types for player status
var TypeEnum = {
  INFECTIOUS: "infectious",
  HEALED:     "healed",
  ACTIVE:     "active",
  PASSIVE:    "passive",
  TRAPPED:    "casualty" // older naming:  casualty
};