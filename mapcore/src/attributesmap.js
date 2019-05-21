/**
 * $AttributesMap class
 *    attribute: key=>value pair
 */
var AttributesMap = function () {
  // The derived class from this must has a definition as follow:
  // this.__map = {};
};

AttributesMap.prototype = {
  getAttributesCount : function () {
    var cnt = 0, key;
    for (key in this.__map) {
      cnt++;
    }
    return cnt;
  },

  getAttributeName : function (at) {
    var k, i = 0;
    for (k in this.__map) {
      if (i++===at) {
        return k;
      }
    }
    return null;
  },

  getAttributeAt : function (at) {
    var k, i = 0;
    for (k in this.__map) {
      if (i++===at) {
        return this.__map[k];
      }
    }
  },

  getAttribute : function (attName, failReturn) {
    var val = this.__map[attName];
    if (val===null) {
      return failReturn;
    }
    return val;
  },

  addAttribute : function (attName, attrValue) {
    if (__is_empty(attName)) {
      return null;
    }
    var oldValue = this.__map[attName];
    this.__map[attName] = attrValue;
    return oldValue;
  },

  removeAttribute : function (attName) {
    delete(this.__map[attName]);
  },

  clearAttributes : function () {
    this.__map = null;
    this.__map = {};
  }
};

