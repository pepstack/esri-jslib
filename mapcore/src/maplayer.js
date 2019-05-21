/**
 * MapLayer class
 */
var MapLayer = function (name, opt_tag) {
  this._init(name, opt_tag);
};

MapLayer.prototype = new AttributesMap();

MapLayer.prototype._init = function (name, opt_tag) {
  this.__map = {}; // used by AttributesMap

  this.name = name;
  this.tag = opt_tag;

  this.shapes = [];

  this.bound = new MapBound();
  this.render = new MapRender("__default__"); // default render
  this.visible = true;

  this.symbolMaxDataUnit = 0.0;
  this.symbolMaxViewUnit = 0;
};

MapLayer.prototype.item = function (at) {
  var id = parseInt(at, 10);
  if (isNaN(id) || id<0 || id>=this.shapes.length) {
    throw ("invalid index");
  }
  else {
    return this.shapes[id];
  }    
};

MapLayer.prototype.findShapeIndex = function (obj) {
  var n = this.shapes.length;
  while (n-- > 0) {
    if (this.shapes[n] === obj) {
      return n;
    }
  }
  return ERRINDEX;
};

MapLayer.prototype.toString = function () {
  return "MapLayer class";
};

MapLayer.prototype.addShape = function (shape) {
  var newShape = __is_null(shape)? (new MapShape()) : shape;
  this.shapes.push(newShape);
  newShape.id = this.shapes.length;
  newShape._parentObj = this;
  return newShape;
};

MapLayer.prototype.addShapeFront = function (shape) {
  var newShape = __is_null(shape)? (new MapShape()) : shape;
  this.shapes.unshift(newShape);
  newShape.id = this.shapes.length;
  newShape._parentObj = this;
  return newShape;
};

MapLayer.prototype.addShapes = function () {
  var i = 0,
      args = Array.prototype.slice.call(arguments),
      len = args.length;
  for (; i<len; i++) {
    this.addShape(args[i]);
  }
};

MapLayer.prototype.addShapesFront = function () {
  var args = Array.prototype.slice.call(arguments),
      len = args.length;
  while (len-- > 0) {
    this.addShapeFront(args[len]);
  }
};

MapLayer.prototype.moveToFront = function (at) {
  var shp = this.removeAt(at);
  if (__not_null(shp)) {
    this.addShapeFront(shp);
  }
};

MapLayer.prototype.moveToBack = function (at) {
  var shp = this.removeAt(at);
  if (__not_null(shp)) {
    this.addShape(shp);
  }
};

MapLayer.prototype.removeAt = function (at) {
  var id = parseInt(at, 10);
  var shp = null;
  if (isNaN(id)) {
    // drop shape by reference
    var size = this.shapes.length;
    while (size-->0) {
      if (this.shapes[size]===at) {
        shp = this.shapes.splice(size, 1);
        shp._parentObj = null;
        return shp;
      }
    }
  }
  else {
    if (id>=0 && id<this.shapes.length) {
      shp = this.shapes.splice(id, 1);
      shp._parentObj = null;
      return shp;
    }
  }
  return null;
};

MapLayer.prototype.removeAll = function () {
  var num = this.shapes.length;
  while (num-->0) {
    this.shapes[num]._parentObj = null;
  }
  this.shapes.splice(0);
};

MapLayer.prototype.findShape = function (key, val) {
  var at = this.shapes.length;
  var valNot = val+"x";
  while (at-- > 0) {
    var shp = this.shapes[at];
    if (shp.getAttribute(key, valNot)===val) {
      return shp;
    }
  }
  return null;
};

MapLayer.prototype._updateSymbolMax = function (symbolUnit, extent) {
  if (symbolUnit.pixelUnit) {
    if (this.symbolMaxViewUnit < extent) {
      this.symbolMaxViewUnit = extent;
    }
  }
  else {
    if (this.symbolMaxDataUnit < extent) {
      this.symbolMaxDataUnit = extent;
    }
  }
};

MapLayer.prototype.updateBound = function () {
  var num = this.shapes.length;
  if (num > 0) {
    this.bound.clone(this.shapes[0].bound);
  }
  while (num-->1) {
    this.bound.union(this.shapes[num].bound);
  }
};

// Draw Layer
//
MapLayer.prototype._isDraw = function (di) {
  if (!this.visible) {
    return false;
  }

  if (this.shapes.length === 0) {
    return false;
  }

  //??TODO: other check...

  return true;
};

// MapLayer_draw
MapLayer.prototype._draw = function (di) {
  if (!this._isDraw(di)) {
    return;
  }
  // draw layer for display
  var i = 0,
      saved = di.saveRender(this.render),
      num = parseInt(this.shapes.length, 10);
  for (; i<num; i++){
    di.shapeIndex = i;
    this.shapes[i]._draw(di);
    di.shapeIndex = null;
  }
  di.restoreRender(this.render, saved);
};

