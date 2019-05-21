/**
 * PointType class
 *   2D point struct only used internally
 */
var PointType = function (x, y) {
  this.x = x;
  this.y = y;
};

PointType.prototype = {
  toString : function () {
    return "PointType Class";
  },

  distance : function (p) {
    return Math.sqrt((this.x-p.x)*(this.x-p.x)+(this.y-p.y)*(this.y-p.y));
  },

  distanceSq : function (p) {
    return ((this.x-p.x)*(this.x-p.x)+(this.y-p.y)*(this.y-p.y));
  },

  distanceGd : function (p) {
    return Math.abs(this.x-p.x) + Math.abs(this.y-p.y);
  },

  offset : function (dx, dy) {
    this.x += dx;
    this.y += dy;
  },

  toXml : function (dig) {
    var d = (__is_null(dig)? 3 : dig);
    return "<x>"+this.x.toFixed(d)+"</x><y>"+this.y.toFixed(d)+"</y>";
  },

  clone : function (/*const*/pt) {
    this.x = pt.x;
    this.y = pt.y;
  },

  spawn : function () {
    return new PointType(this.x, this.y);
  }
};

