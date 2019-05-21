/**
 * GeoLink class
 */
var GeoLink = function (id, fromPort, toPort) {
  this._init(id, fromPort, toPort);
};

GeoLink.create = function (linkId, fromPort, toPort) {
  // validate ports
  if (__is_null(fromPort) || __is_null(toPort) || fromPort===toPort) {
    return null;
  }
  if (fromPort.type===toPort.type) {
    __log("GeoLink.create failed: port types are same");
    return null;
  }
  if (__not_null(fromPort.getNextLink())) {
    __log("GeoLink.create failed: fromPort has link");
    return null;
  }
  if (__not_null(toPort.getNextLink())) {
    __log("GeoLink.create failed: toPort has link");
    return null;
  }
  if (fromPort.parentNode === toPort.parentNode) {
    __log("GeoLink.create failed: cannot link node to itself");
    return null;
  }
  if (fromPort.type==="IN") {
    return new GeoLink(linkId, toPort, fromPort);
  }
  else {
    return new GeoLink(linkId, fromPort, toPort);
  }
};

GeoLink.removeFromLayer = function (layer, link) {
  layer.removeAt(link.tagShape);
  layer.removeAt(link.fromPtShape);
  layer.removeAt(link.toPtShape);
};

GeoLink.insertIntoLayer = function (layer, link) {
  layer.addShapes(link.tagShape, link.toPtShape, link.fromPtShape);
};

GeoLink.prototype._init = function (id, fromPort, toPort) {
  this.id = id;

  this.fromPort = fromPort; // typeof GeoPort
  this.fromNode = fromPort.parentNode;
  this.fromPort.attachLink(this);

  this.toPort = toPort;
  this.toNode = toPort.parentNode;
  this.toPort.attachLink(this);

  this.tagShape = null;                       // linkShape: Bezier Curve
  this.fromPtShape = new esri2.Map.Shape();   // OutPort MapPoint Shape
  this.toPtShape = new esri2.Map.Shape();     // InPort MapPoint Shape
};

GeoLink.prototype.toString = function () {
  return "GeoLink class";
};

GeoLink.prototype.isValid = function () {
  return __not_null(this.tagShape);
};

GeoLink.prototype.detachPorts = function () {
  this.fromPort.detachLink(this);
  this.toPort.detachLink(this);
};

GeoLink.prototype.update = function (mapCanvas) {
  var fromPt = this.fromPort.getPoint(mapCanvas);
  var toPt = this.toPort.getPoint(mapCanvas);

  if (__is_null(this.tagShape)) {
    this.tagShape = new esri2.Map.Shape();
  }
  if (fromPt.x > toPt.x) {
    this.tagShape.createBezier(fromPt, toPt, 
      new esri2.Map.Point(fromPt.x, toPt.y),
      new esri2.Map.Point(toPt.x, fromPt.y));
  } 
  else {
    this.tagShape.createBezier(fromPt, toPt);
  }

  this.tagShape.tag = this; // GeoLink

  this.fromPtShape.createPoint(fromPt.x, fromPt.y, 0);
  this.toPtShape.createPoint(toPt.x, toPt.y, 0);
  this.fromPtShape.symbol = mapCanvas.getAttribute(NodeTypes.OutPortLinked);
  this.toPtShape.symbol = mapCanvas.getAttribute(NodeTypes.InPortLinked);

  return this.tagShape;
};

GeoLink.prototype.ignoredNode = function () {
  if (!this.isValid()) {
    return true;
  }

  var fromType = this.fromNode.getTypeName();
  var toType = this.toNode.getTypeName();
  var ret = ( fromType===NodeTypes.NodeDefaultVal ||
      fromType===NodeTypes.NodePubInput ||
      fromType===NodeTypes.NodePubOutput ||
      toType===NodeTypes.NodeDefaultVal ||
      toType===NodeTypes.NodePubInput ||
      toType===NodeTypes.NodePubOutput );
  return ret;
};

GeoLink.prototype.toJsonString = function () {
  var json = "";

  json += __indent_spc;
  json += "{\n";

  // fromNodeId
  json += __indent_spc+__indent_spc;
  json += __quot_str("fromKnotId");
  json += ":";
  json += __quot_str(this.fromNode.id);
  json += ",\n";

  // fromPortName
  json += __indent_spc+__indent_spc;
  json += __quot_str("fromPortName");
  json += ":";
  json += __quot_str(this.fromPort.name);
  json += ",\n";

  // toNodeId
  json += __indent_spc+__indent_spc;
  json += __quot_str("toKnotId");
  json += ":";
  json += __quot_str(this.toNode.id);
  json += ",\n";

  // toPortName
  json += __indent_spc+__indent_spc;
  json += __quot_str("toPortName");
  json += ":";
  json += __quot_str(this.toPort.name);
  json += "\n";

  json += __indent_spc;
  json += "}";
  return json;
};

