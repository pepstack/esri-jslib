/**
 * esri2.geoflow.js
 */
(function(p, q){
  __using_script( __get_script_path(p)+q );
})('/esri2.geoflow.js', 'esri2.map.js');

/**
 * jslint browser: true,
 * onevar: true,
 * undef: true,
 * nomen: true,
 * bitwise: true,
 * regexp: true,
 * newcap: true,
 * immed: true,
 * strict: true,
 * global window: false,
 * jQuery: false,
 * console: false
 */
(function(window, undefined) {
// Enable ECMAScript "strict" operation for this function.
// See more:
//   http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more
"use strict";

// Predefinitions
var
  TRUE = true,
  FALSE = false,
  NULL = null,
  ERRINDEX = -1;

var __indent_spc = "    ";

var __quot_str = function (s) {
  return ("\"" + s + "\"");
};

