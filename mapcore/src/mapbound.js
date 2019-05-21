/**
 * MapBound class
 */
var MapBound = function (points) {
  this._init(points);
};

MapBound.prototype._init = function (points) {
  this.xmin = this.ymin = this.zmin = 0.0;
  this.xmax = this.ymax = this.zmax = 0.0;
  this.createFromPoints(points);
  
  //@valid
  Object.defineProperty(this, 'valid', {
    get: function () {
      return (this.xmax >= this.xmin && 
              this.ymax >= this.ymin && 
              this.zmax >= this.zmin);
    }
  });
  
  //@width
  Object.defineProperty(this, 'width', {
    get: function () {
      return this.xmax - this.xmin;
    }
  });

  //@height
  Object.defineProperty(this, 'height', {
    get: function () {
      return this.ymax - this.ymin;
    }
  });

  //@area
  Object.defineProperty(this, 'area', {
    get: function () {
      return this.width*this.height;
    }
  });

  //@length
  Object.defineProperty(this, 'length', {
    get: function () {
      return 2*(this.width+this.height);
    }
  });

  //@rect return a copy of (xmin, ymin, xmax, ymax)
  Object.defineProperty(this, 'rect', {
    get: function () {
      return new RectType(this.xmin, this.ymin, this.xmax, this.ymax);
    }
  });
};

MapBound.prototype.toString = function () {
  return "MapBound class";
};

// update bound by points
MapBound.prototype.createFromPoints = function (points, opt_np) {
  if (__is_null(points) || points.length===0) {
    this.clear();
    return;
  }
  var np = points.length;
  if (__not_null(opt_np) && opt_np < np) {
    np = opt_np;
  }
  var i = 1,
      p = points[0];
  this.xmin = this.xmax = p.x;
  this.ymin = this.ymax = p.y;
  this.zmin = this.zmax = p.z;

  for (; i<np; i++) {
    p = points[i];
    if (this.xmin > p.x) {
      this.xmin = p.x;
    }
    if (this.xmax < p.x) {
      this.xmax = p.x;
    }
    if (this.ymin > p.y) {
      this.ymin = p.y;
    }
    if (this.ymax < p.y) {
      this.ymax = p.y;
    }
    if (this.zmin > p.z) {
      this.zmin = p.z;
    }
    if (this.zmax < p.z) {
      this.zmax = p.z;
    }
  }
};

MapBound.prototype.createFromRect = function (rect) {
  if (__not_null(rect)) {
    this.xmin = rect.xmin;
    this.ymin = rect.ymin;
    this.xmax = rect.xmax;
    this.ymax = rect.ymax;
  }
};

MapBound.prototype.clone = function (src) {
  this.xmin = src.xmin;
  this.ymin = src.ymin;
  this.zmin = src.zmin;
  this.xmax = src.xmax;
  this.ymax = src.ymax;
  this.zmax = src.zmax;
};

MapBound.prototype.spawn = function () {
  var obj = new MapBound();
  obj.clone(this);
  return obj;    
};

MapBound.prototype.clear = function () {
  this.xmin = this.ymin = this.zmin = 0.0;
  this.xmax = this.ymax = this.zmax = 0.0;
};

MapBound.prototype.offset = function (dx, dy, dz) {
  this.xmax += dx;
  this.ymax += dy;
  this.zmax += (__is_null(dz)? 0: dz);
  this.xmin += dx;
  this.ymin += dy;
  this.zmin += (__is_null(dz)?0:dz);
};

MapBound.prototype.toXml = function (dig) {
  var d = (__is_null(dig)? FIXED_DIG : dig);
  return "<xmin>"+this.xmin.toFixed(d)+"</xmin><ymin>"+this.ymin.toFixed(d)+
         "</ymin><xmax>"+this.xmax.toFixed(d)+"</xmax><ymax>"+this.ymax.toFixed(d)+
         "</ymax><zmin>"+this.zmin.toFixed(d)+"</zmin><zmax>"+this.zmax.toFixed(d)+"</zmax>";
};

MapBound.prototype.union = function (dstBound) {
  this.xmin = Math.min(this.xmin, dstBound.xmin);
  this.ymin = Math.min(this.ymin, dstBound.ymin);
  this.zmin = Math.min(this.zmin, dstBound.zmin);
  this.xmax = Math.max(this.xmax, dstBound.xmax);
  this.ymax = Math.max(this.ymax, dstBound.ymax);
  this.zmax = Math.max(this.zmax, dstBound.zmax);
};

MapBound.prototype.toRectShape = function () {
  var shape = new MapShape();
  shape.type = "RECT";
  shape.points[0] = new MapPoint(this.xmin, this.ymin, this.zmin);
  shape.points[1] = new MapPoint(this.xmax, this.ymax, this.zmax);
  shape.undateBound();
  return shape;
};

