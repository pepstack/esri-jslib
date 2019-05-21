/**
 * ShapeTrace class
 * ??TODO: this class should be deprecated
 */
var ShapeTrace = function (mapCanvas) {
  this.__init(mapCanvas);
};

ShapeTrace.prototype.__init = function (mapCanvas) {
  // public:
  this.mapCanvas = mapCanvas;

  // private:
  this.__layerIndex = null; // can be null
  this.__shapeIndex = null;
  this.__symbolShapeIndex = null;

  this.__layer = null;
  this.__shape = null;
  this.__symbol = null;
  this.__symbolShape = null;

  //@valid
  Object.defineProperty(this, 'valid', {
    get: function () {
      if (__is_null(this.__layer) || __is_null(this.__shapeIndex) || __is_null(this.__shape)) {
        return false;
      }
      if (__is_null(this.__symbol)) {
        return true;
      }
      // this.__symbol!==null
      return (__not_null(this.__symbolShapeIndex) && __not_null(this.__symbolShape));
    }
  });

  //@layer
  Object.defineProperty(this, 'layer', {
    get: function () {
      return this.__layer;
    }
  });

  //@shape
  Object.defineProperty(this, 'shape', {
    get: function () {
      return this.__shape;
    }
  });

  //@symbol
  Object.defineProperty(this, 'symbol', {
    get: function () {
      return this.__symbol;
    }
  });

  //@symbolShape
  Object.defineProperty(this, 'symbolShape', {
    get: function () {
      return this.__symbolShape;
    }
  });
};

ShapeTrace.prototype.init = function (layerIndex, shapeIndex, symbolShapeIndex) {
  this.__layerIndex = layerIndex;
  if (__not_null(this.__layerIndex)) {
    this.__layer = this.mapCanvas.item(this.__layerIndex);
  }

  if (__not_null(this.__layer)) {
    this.__shapeIndex = shapeIndex;
    if (__not_null(this.__shapeIndex)) {
      this.__shape = this.__layer.shapes[this.__shapeIndex];
    }
    if (__not_null(this.__shape)) {
      this.__symbolShapeIndex = symbolShapeIndex;
      if (__not_null(this.__symbolShapeIndex)) {
        this.__symbol = this.__shape.symbol;
        if (__not_null(this.__symbol)) {
          this.__symbolShape = this.__symbol.shapes[this.__symbolShapeIndex];
        }
      }
    }
  }

  return this.valid;
};

ShapeTrace.prototype.toXml = function () {
  var xml = "<shapeTrace>\n";
  xml += "  <layerIndex>"+this.__layerIndex+"</layerIndex>\n";
  xml += "  <shapeIndex>"+this.__shapeIndex+"</shapeIndex>\n";
  if (this.__symbol !== null) {
    xml += "  <symbolName>"+this.__symbol.name+"</symbolName>\n";
    xml += "  <symbolShapeIndex>"+this.__symbolShapeIndex+"</symbolShapeIndex>\n";
  }
  xml += "</shapeTrace>";
  return xml;
};

