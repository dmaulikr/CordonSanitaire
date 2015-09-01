// Global Variables
var DEFAULT_DURATION = 45;
var DEFAULT_DELAY_START_GAME = 10;
var NUM_REQUIRED_PLAYERS = 5;
var DEFAULT_GAME_PADDING = 10;

// map limits
// BOSTON
//var zoomLevel = 14;
//var LAT_MIN = 42.354485;
//var LAT_MAX = 42.365140;
//var LON_MIN = -71.069870;
//var LON_MAX = -71.051245;

// SPAIN
//var zoomLevel = 5;
//var LAT_MIN = 37.666429;
//var LAT_MAX = 42.650122;
//var LON_MIN = -8.173828;
//var LON_MAX = -0.988770;

// NYC
var zoomLevel = 12;
var LAT_MIN = 40.704204;
var LAT_MAX = 40.829535;
var LON_MIN = -74.096729;
var LON_MAX = -73.834258;


//Salt Lake City, UTAH
var zoomLevel = 14;
var LAT_MIN = 40.741535;
var LAT_MAX = 40.771507;
var LON_MIN = -111.905365;
var LON_MAX = -111.876698;

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