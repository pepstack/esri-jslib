/**
 * RectType class
 *   2D rectangle struct used internally
 */
var RectType = function (x1, y1, x2, y2) {
  this._init(x1, y1, x2, y2);
};

RectType.prototype._init = function (x1, y1, x2, y2) {
  this.xmin = Math.min (x1, x2);
  this.ymin = Math.min (y1, y2);
  this.xmax = Math.max (x1, x2);
  this.ymax = Math.max (y1, y2);

  Object.defineProperty(this, 'valid', {
    get: function () {
      return (this.width >= 0 && this.height >= 0);
    }
  });

  Object.defineProperty(this, 'width', {
    get: function () {
      return (this.xmax - this.xmin);
    }
  });

  Object.defineProperty(this, 'height', {
    get: function () {
      return (this.ymax - this.ymin);
    }
  });

  Object.defineProperty(this, 'area', {
    get: function () {
      if (!this.valid) {
        return 0.0;
      }
      return (this.width * this.height);
    }
  });

  Object.defineProperty(this, 'length', {
    get: function () {
      if (!this.valid) {
        return 0.0;
      }
      return 2*(this.width + this.height);
    }
  });

  Object.defineProperty(this, 'center', {
    get: function () {
      return new PointType((this.xmin+this.xmax)*0.5, (this.ymin+this.ymax)*0.5);
    }
  });
};

// methods:
//
RectType.prototype.toString = function () {
  return "RectType class";
};

RectType.prototype.toXml = function (dig) {
  var d = (__is_null(dig)? FIXED_DIG : dig);
  return "<xmin>"+this.xmin.toFixed(d)+"</xmin><ymin>"+this.ymin.toFixed(d)+
         "</ymin><xmax>"+this.xmax.toFixed(d)+"</xmax><ymax>"+this.ymax.toFixed(d)+"</ymax>";
};

RectType.prototype.clone = function (/*const*/rc) {
  this.xmin = rc.xmin;
  this.ymin = rc.ymin;
  this.xmax = rc.xmax;
  this.ymax = rc.ymax;
};
  
RectType.prototype.clear = function () {
  this.xmin = 0.0;
  this.ymin = 0.0;
  this.xmax = 0.0;
  this.ymax = 0.0;
};

RectType.prototype.offset = function (dx, dy) {
  this.xmin+=dx;
  this.xmax+=dx;
  this.ymin+=dy;
  this.ymax+=dy;
};

RectType.prototype.ptInRect = function (x, y) {
  return (x>=this.xmin && x <this.xmax && y>=this.ymin && y <this.ymax);
};

RectType.prototype.inflate = function (dx, dy) {
  this.xmin -= Math.abs(dx);
  this.xmax += Math.abs(dx);
  this.ymin -= Math.abs(dy);
  this.ymax += Math.abs(dy);
};

RectType.prototype.intersect = function (subj) {
  this.xmin = Math.max(subj.xmin, this.xmin);
  this.ymin = Math.max(subj.ymin, this.ymin);
  this.xmax = Math.min(subj.xmax, this.xmax);
  this.ymax = Math.min(subj.ymax, this.ymax);
  return this.valid;
};

RectType.prototype.union = function (subj) {
  this.xmin = Math.min(subj.xmin, this.xmin);
  this.ymin = Math.min(subj.ymin, this.ymin);
  this.xmax = Math.max(subj.xmax, this.xmax);
  this.ymax = Math.max(subj.ymax, this.ymax);
};

RectType.prototype.spawn = function () {
  return new RectType(this.xmin, this.ymin, this.xmax, this.ymax);
};

