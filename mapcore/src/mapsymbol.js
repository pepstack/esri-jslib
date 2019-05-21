/**
 * MapSymbol class
 */
var MapSymbol = function (name, opt_tag) {
  this._init(name, opt_tag);
};

MapSymbol.UnitSys = function (scaleFactor) {
  this.pixelUnit = true;
  this.scaleFactor = scaleFactor;
  this.baseX = 0;
  this.baseY = 0;  
};

MapSymbol.prototype = new AttributesMap();

MapSymbol.prototype._init = function (name, opt_tag) {
  this.__map = {}; // used by AttributesMap

  this.name = name;
  this.tag = opt_tag;

  this.shapes = [];

  this.bound = new MapBound();
  this.render = new MapRender("__default__"); // default render
  this.visible = true;

  this.symbolMaxDataUnit = 0.0;
  this.symbolMaxViewUnit = 0;

  // true for pixel unit; false for data unit
  this.symbolUnit = new MapSymbol.UnitSys(1);

  this._parentObj = null;  // MapShape

  Object.defineProperty(this, 'parent', {
    get: function () {
      return this._parentObj;
    }
  });
};

MapSymbol.prototype.toString = function () {
  return "MapSymbol class";
};

MapSymbol.prototype._getDrawRect = function (di) {
  var num = this.shapes.length;
  var shp;
  var vrc = null;
  while (num-->0) {
    shp = this.shapes[num];
    if (__is_null(vrc)) {
      vrc = shp._getDrawRect(di, this.symbolUnit);
    }
    else {
      vrc.union(shp._getDrawRect(di, this.symbolUnit));
    }
  }
  return vrc;
};

// Draw Symbol
//
MapSymbol.prototype._isDraw = function (di, atShape) {
  if (!this.visible) {
    return false;
  }
  if (atShape.type != "POINT") {
    throw ("MapSymbol._isDraw: only point symbol supported");
  }
  if (this.shapes.length === 0) {
    return false;
  }
  //?TODO:
  return true;
};

// draw symbol at shape position: atShape
MapSymbol.prototype._draw = function (di, atShape) {
  if (!this._isDraw(di, atShape)) {
    return;
  }
  // only support point symbol now
  var numPoints = parseInt(atShape.points.length, 10);
  var numShapes = parseInt(this.shapes.length, 10);

  var saved = di.saveRender(this.render);
  var at = 0,
      n;
  for (; at<numPoints; at++) {
    n = numShapes;

    // symbolAtPoint specifies point where we draw symbol shapes
    var symbolAtPoint = atShape.points[at];

    while (n-- > 0){
      // draw symbol shapes at symbolAtPoint
      di.symbolShapeIndex = n;
      this.shapes[n]._draw(di, symbolAtPoint, this.symbolUnit);
      di.symbolShapeIndex = null;
    }
  }
  di.restoreRender(this.render, saved);
};

MapSymbol.prototype.item = function (at) {
  var id = parseInt(at, 10);
  if (isNaN(id) || id<0 || id>=this.shapes.length) {
    throw ("invalid index");
  }
  else {
    return this.shapes[id];
  }    
};

MapSymbol.prototype.findShapeIndex = function (obj) {
  var n = this.shapes.length;
  while (n-- > 0) {
    if (this.shapes[n] === obj) {
      return n;
    }
  }
  return ERRINDEX;
};

MapSymbol.prototype.addShape = function (shape) {
  var newShape = __is_null(shape)? (new MapShape()) : shape;
  this.shapes.push(newShape);
  newShape.id = this.shapes.length;
  newShape._parentObj = this;
  return newShape;
};

MapSymbol.prototype.addShapeFront = function (shape) {
  var newShape = __is_null(shape)? (new MapShape()) : shape;
  this.shapes.unshift(newShape);
  newShape.id = this.shapes.length;
  newShape._parentObj = this;
  return newShape;
};

MapSymbol.prototype.addShapes = function () {
  var i = 0,
      args = Array.prototype.slice.call(arguments),
      len = args.length;
  for (; i<len; i++) {
    this.addShape(args[i]);
  }
};

MapSymbol.prototype.addShapesFront = function () {
  var args = Array.prototype.slice.call(arguments),
      len = args.length;
  while (len-- > 0) {
    this.addShapeFront(args[len]);
  }
};

MapSymbol.prototype.removeAt = function (at) {
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

MapSymbol.prototype.removeAll = function () {
  var num = this.shapes.length;
  while (num-->0) {
    this.shapes[num]._parentObj = null;
  }
  this.shapes.splice(0);
};

MapSymbol.prototype.findShape = function (key, val) {
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

MapSymbol.prototype._updateSymbolMax = function (symbolUnit, extent) {
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

MapSymbol.prototype.updateBound = function () {
  var num = this.shapes.length;
  if (num > 0) {
    this.bound.clone(this.shapes[0].bound);
  }
  while (num-->1) {
    this.bound.union(this.shapes[num].bound);
  }
};

