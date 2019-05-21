/**
 * MapPoint class
 */
var MapPoint = function (x, y, z_) {
  this._init(x, y, z_);
};

MapPoint.prototype = {
  _init : function (x, y, z_) {
    this.x = x;
    this.y = y;
    this.z = __is_null(z_)? 0: z_;
  },

  clear : function () {
    this.x = this.y = this.z = 0;
  },

  clone : function (src) {
    this.x = src.x;
    this.y = src.y;
    this.z = src.z;
  },

  spawn : function () {
    return new MapPoint(this.x, this.y, this.z);    
  },

  distance : function (next) {
    var dx = this.x-next.x;
    var dy = this.y-next.y;
    var dz = this.z-next.z;
    return Math.sqrt(dx*dx+dy*dy+dz*dz);
  },

  same : function(pt) {
    return (this.x===pt.x && this.y===pt.y && this.z===pt.z);
  },

  offset : function (dx, dy, dz) {
    this.x += dx;
    this.y += dy;
    this.z += dz;
  },

  toString : function () {
    return "MapPoint class";
  },

  toXml : function (dig) {
    var d = (__is_null(dig)? FIXED_DIG : dig);
    return "<x>"+this.x.toFixed(d)+"</x><y>"+this.y.toFixed(d)+"</y><z>"+this.z.toFixed(d)+"</z>";
  }
};

