/**
 * esri2.map.js
 *   required: esri2.utility.js
 */

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
// Enable ECMAScript "strict" operation for this function. See more:
//   http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Predefinitions, DONOT change below:
var
  TRUE = true,
  FALSE = false,
  NULL = null,
  ERRINDEX = -1  
;

// You CAN change below default values:
//
var
  FIXED_DIG = 2,
  PIXEL_SIZE = 3
;

