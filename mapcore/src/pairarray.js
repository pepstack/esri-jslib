/**
 * PairArray class
 *   key-value map array
 */
var PairArray = function () {
  this.__keymap = {}; // save indices to keys
  this.__keys = [];
  this.__vals = [];
};

PairArray.MaxSize = 10000;

PairArray.prototype = {
  toString : function () {
    return "PairArray class";
  },

  genKey : function () {
    var key = this.size();
    if (this.find(key)===ERRINDEX) {
      return key;
    }
    key = 0;
    while (key++ < PairArray.MaxSize) {
      if (this.find(key)===ERRINDEX) {
        return key;
      }
    }
    return null;
  },

  find : function (key) {
    var keyIdx = this.__keymap[key];
    return (__is_null(keyIdx)? ERRINDEX : keyIdx);
  },

  insert : function (key, value) {
    var keyIdx = this.find(key);
    if (keyIdx===ERRINDEX) {
      this.__keymap[key] = this.__keys.length;
      this.__keys.push(key);
      this.__vals.push(value);
    }
    else {
      this.__vals[keyIdx] = value;
    }
  },

  size : function () {
    return this.__keys.length;
  },

  getKey : function (at) {
    return this.__keys[at];
  },

  getVal : function (at) {
    return this.__vals[at];
  },

  setVal : function (at, value) {
    this.__vals[at] = value;
  },

  eraseAt : function (at) {
    if (at>=0 && at<this.size()) {
      var k,
          id,
          key = this.__keys[at];

      for (k in this.__keymap) {
        id = this.__keymap[k];
        if (id > at) {
          this.__keymap[k] = id-1;
        }
      }

      delete (this.__keymap[key]);
      this.__keys.splice(at, 1);
      return this.__vals.splice(at, 1);
    }
    return null;
  },

  erase : function (key) {
    return this.eraseAt(this.find(key));
  },

  clear : function () {
    this.__keymap = null;
    this.__keymap = {};
    this.__keys.splice(0);
    this.__vals.splice(0);
  }
};

