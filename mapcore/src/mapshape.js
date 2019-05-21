/**
 * MapShape class
 */
var MapShape = function (opt_tag) {
  this._init(opt_tag); 
};

MapShape.prototype = new AttributesMap();

MapShape.prototype._init = function (opt_tag) {
  this.__map = {}; // used by AttributesMap

  this.id = 0;
  this.tag = opt_tag;
  this.points = []; // new Array(0);
  this.bound = new MapBound(this.points);

  // {NULL, POINT, LINE, POLYGON, CIRCLE, ARC, CIRCLE3P, ARC3P, RECT, ROUNDRECT, BEZIER}
  this.type = "NULL";
  this.visible = true;
  this.selectable = false;  // default is unselectable
  this._parentObj = null;   // MapLayer or MapSymbol
  this.__symbol = null;     // MapSymbol for symbolizing shape
  this.namedRenders = null; // PairArray: all renders with name for draw shape
  this.renderName = null;   // string: specify which render to use
  this.eventHandler = null; // = function (e, mapCanvas, thisObject, trace) {}

  //@parent
  Object.defineProperty(this, 'parent', {
    get: function () {
      return this._parentObj;
    }
  });

  //@symbol
  Object.defineProperty(this, 'symbol', {
    get: function () {
      return this.__symbol;
    },
    set: function (symb) {
      if (__not_null(this.__symbol)) {
        this.__symbol._parentObj = null;
      }
      this.__symbol = symb;
      if (__not_null(this.__symbol)) {
        this.__symbol._parentObj = this;
      }
    }
  });

  //@avgPoint
  Object.defineProperty(this, 'avgPoint', {
    get: function () {
      var np = this.points.length;
      var
          x = 0,
          y = 0,
          z = 0,
          v,
          i;

      for(i=0; i<np; i++) {
        v = this.points[i];
        x += v.x;
        y += v.y;
        z += v.z;
      }
      if (np===0) {
        np = 1;
      }
      return new MapPoint(x/np, y/np, z/np);
    }
  });

  //@area
  Object.defineProperty(this, 'area', {
    get: function () {
      switch (this.type) {
      case "POLYGON":
        return __get_polygon_area__(this.points);
      case "CIRCLE":
        var r = this.points[0].distance(this.points[1]);
        return Math.PI*r*r;
      case "RECT":
        return (this.points[1].x-this.points[0].x)*(this.points[1].y-this.points[0].y);
      }
      //??TODO:
      return 0.0;
    }
  });

  //@length
  Object.defineProperty(this, 'length', {
    get: function () {
      switch (this.type) {
      case "POLYGON":
      case "LINE":
        return __get_polyline_length__(this.points);
      case "CIRCLE":
        var r = this.points[0].distance(this.points[1]);
        return 2*Math.PI*r;
      case "ARC":
        //??TODO:
        return 0;
      case "RECT":
        return 2*((this.points[1].x-this.points[0].x)+(this.points[1].y-this.points[0].y));
      case "CIRCLE3P": //??TODO:
        break;
      case "ARC3P":
        //??TODO:
        break;
      }
      return 0.0;
    }
  });

  //@valid
  Object.defineProperty(this, 'valid', {
    get: function () {
      switch (this.type) {
      case "POLYGON":
        return (this.points.length>=4);
      case "LINE":
        return (this.points.length>=2);
      case "RECT":
      case "CIRCLE":
        return (this.points.length===2);
      case "ARC":
      case "CIRCLE3P":
      case "ARC3P":
        return (this.points.length===3);
      case "ROUNDRECT":
        return (this.points.length===4);
      case "POINT":
        return (this.points.length>=1);
      }
      return false;
    }
  });
};

MapShape.prototype._updateCircleBound = function () {
  this.bound.clear();
  var centerPt = this.points[0];
  var edgePt = this.points[1];
  var radius = centerPt.distance(edgePt);
  var dZ = Math.abs(centerPt.z - edgePt.z);
  this.bound.xmin = centerPt.x - radius;
  this.bound.xmax = centerPt.x + radius;
  this.bound.ymin = centerPt.y - radius;
  this.bound.ymax = centerPt.y + radius;
  this.bound.zmin = centerPt.z - dZ;
  this.bound.zmax = centerPt.z + dZ;
};

MapShape.prototype._updateCircle3pBound = function () {
  //??TODO:
};

MapShape.prototype._updateArc3pBound = function () {
  //??TODO:
};

MapShape.prototype.updateBound = function () {
  switch (this.type) {
  case "CIRCLE":
    this._updateCircleBound();
    break;
  case "ARC":
    this._updateArcBound();
    break;
  case "CIRCLE3P":
    this._updateCircle3pBound();
    break;
  case "ARC3P":
    this._updateArc3pBound();
    break;
  case "RECT":
  case "ROUNDRECT":
    this.bound.createFromPoints(this.points, 2);
    break;
  default:
    this.bound.createFromPoints(this.points);
    break;
  }
};
  
MapShape.prototype._getDrawRect = function (di, opt_symbolUnit) {
  var isPixelUnit = (__not_null(opt_symbolUnit) && opt_symbolUnit.pixelUnit);
  var shpVrc = isPixelUnit ? this.bound.rect : di.viewport.drc2vrc(this.bound.rect);

  if (__not_null(this.symbol)) {
    var symVrc = this.symbol._getDrawRect(di);
    if (__not_null(symVrc)) {
      shpVrc.xmin += symVrc.xmin;
      shpVrc.ymin += symVrc.ymin;
      shpVrc.xmax += symVrc.xmax;
      shpVrc.ymax += symVrc.ymax;
    }
  }
  else {
    var w = parseInt(di.context.lineWidth, 10);
    if (!isNaN(w)) {
      shpVrc.inflate(w, w);
    }
  }
  return shpVrc;
};

// Creation of Shape
//
MapShape.prototype.createPoint = function (x, y, z) {
  this.clearPoints();
  this.type = "POINT";
  this.points[0] = new MapPoint(x, y, z);
  this.updateBound();
};

MapShape.prototype.createMultiPoints = function (points) {
  this.clearPoints();
  this.type = "POINT";
  if (__not_null(points)) {
    var p, i;
    for (i = 0; i < points.length; i++) {
      p = points[i];
      this.points[i] = new MapPoint(p.x, p.y, p.z);
    }
    this.updateBound();
  }
};

MapShape.prototype.createLine = function (points) {
  this.clearPoints();
  this.type = "LINE";
  if (__not_null(points)) {
    var p, i;
    for (i = 0; i < points.length; i++) {
      p = points[i];
      this.points[i] = new MapPoint(p.x, p.y, p.z);
    }
    this.updateBound();
  }
};

MapShape.prototype.createLineSeg = function (p1, p2) {
  this.clearPoints();
  this.type = "LINE";
  if (__not_null(p1)) {
    this.points[0] = p1;
    this.points[1] = p2;
    this.updateBound();
  }
};

MapShape.prototype.createPolygon = function (points) {
  this.clearPoints();
  this.type = "POLYGON";
  if (__not_null(points)) {
    var p, i;
    for (i = 0; i < points.length; i++) {
      p = points[i];
      this.points[i] = new MapPoint(p.x, p.y, p.z);
    }
    if (!this.points[0].same(p)) {
      // ensure the start point is same with the end
      this.points.push(this.points[0]);
    }
    this.updateBound();
  }
};

MapShape.prototype.createCircle = function (centerPt, edgePt) {
  this.clearPoints();
  this.type = "CIRCLE";
  if (__not_null(centerPt)) {
    this.points[0] = new MapPoint(centerPt.x, centerPt.y, centerPt.z);
    this.points[1] = new MapPoint(edgePt.x, edgePt.y, edgePt.z);
    this._updateCircleBound();
  }
};

MapShape.prototype.createCircleXY = function (centerX, centerY, radius) {
  this.clearPoints();
  this.type = "CIRCLE";
  if (__not_null(centerX)) {
    this.points[0] = new MapPoint(centerX, centerY, 0);
    this.points[1] = new MapPoint(centerX+radius, centerY, 0);
    this._updateCircleBound();
  }
};

MapShape.prototype.createArc = function (centerPt, edgePt, startAngleDeg, endAngleDeg, isCCW) {
  this.clearPoints();
  this.type = "ARC";
  if (__not_null(centerPt)) {
    this.points[0] = new MapPoint(centerPt.x, centerPt.y, centerPt.z);
    this.points[1] = new MapPoint(edgePt.x, edgePt.y, edgePt.z);
    this.points[2] = new MapPoint(Math.PI*startAngleDeg/180.0,
                                  Math.PI*endAngleDeg/180.0,
                                  ((__is_null(isCCW) || isCCW)? 1 : 0));
    this._updateCircleBound();
  }
};

MapShape.prototype.createRect = function (p1, p2) {
  this.clearPoints();
  this.type = "RECT";
  if (__not_null(p1)) {
    this.points[0] = new MapPoint(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.min(p1.z, p2.z));
    this.points[1] = new MapPoint(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y), Math.max(p1.z, p2.z));
    this.updateBound();
  }
};
  
MapShape.prototype.createRectXY = function (x1, y1, x2, y2) {
  this.clearPoints();
  this.type = "RECT";
  if (__not_null(x1)) {
    this.points[0] = new MapPoint(Math.min(x1, x2), Math.min(y1, y2), 0);
    this.points[1] = new MapPoint(Math.max(x1, x2), Math.max(y1, y2), 0);
    this.updateBound();
  }
};

MapShape.prototype.createRectXYZ = function (x1, y1, z1, x2, y2, z2) {
  this.clearPoints();
  this.type = "RECT";
  if (__not_null(x1)) {
    this.points[0] = new MapPoint(Math.min(x1, x2), Math.min(y1, y2), Math.min(z1, z2));
    this.points[1] = new MapPoint(Math.max(x1, x2), Math.max(y1, y2), Math.max(z1, z2));
    this.updateBound();
  }
};

//
//  r1 ---- r2
//  |        |
//  |        |
//  r3 ---- r4
//
MapShape.prototype.createRoundRect = function (p1, p2, radius, r2, r3, r4) {
  if (__is_null(radius)) {
    return this.createRect(p1, p2);
  }

  this.clearPoints();
  this.type = "ROUNDRECT";
  if (__not_null(p1)) {
    this.points[0] = new MapPoint(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.min(p1.z, p2.z));
    this.points[1] = new MapPoint(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y), Math.max(p1.z, p2.z));
    this.updateBound();
    var R = (__not_null(radius)? radius : 0);
    this.points[2] = new MapPoint(R, (__not_null(r2)? r2:R), 0);
    this.points[3] = new MapPoint((__not_null(r3)? r3:R), (__not_null(r4)? r4:R), 0);
  }
};

MapShape.prototype.createRoundRectXY = function (x1, y1, x2, y2, radius, r2, r3, r4) {
  if (__is_null(radius)) {
    return this.createRectXY(x1, y1, x2, y2);
  }

  this.clearPoints();
  this.type = "ROUNDRECT";
  if (__not_null(x1)) {
    this.points[0] = new MapPoint(Math.min(x1, x2), Math.min(y1, y2), 0);
    this.points[1] = new MapPoint(Math.max(x1, x2), Math.max(y1, y2), 0);
    this.updateBound();
    var R = (__not_null(radius)? radius : 0);
    this.points[2] = new MapPoint(R, (__not_null(r2)? r2:R), 0);
    this.points[3] = new MapPoint((__not_null(r3)? r3:R), (__not_null(r4)? r4:R), 0);
  }
};

MapShape.prototype.createBezier = function (start, end, ctrl1, ctrl2) {
  this.clearPoints();
  this.type = "BEZIER";
  if (__not_null(start)) {
    this.points[0] = new MapPoint(start.x, start.y, 0);
    this.points[1] = new MapPoint(end.x, end.y, 0);
    if (__is_null(ctrl1) || __is_null(ctrl2)) {
      this.points[2] = new MapPoint(end.x, start.y, 0);
      this.points[3] = new MapPoint(start.x, end.y, 0);
    }
    else {
      this.points[2] = new MapPoint(ctrl1.x, ctrl1.y, 0);
      this.points[3] = new MapPoint(ctrl2.x, ctrl2.y, 0);
    }
    this.updateBound();
  }
};

MapShape.prototype.createCircle3p = function (startPt, midPt, endPt) {
  this.clearPoints();
  this.type = "CIRCLE3P";
  if (__not_null(startPt)) {
    //??TODO:
     
  }
};

MapShape.prototype.createArc3p = function (startPt, midPt, endPt) {
  this.clearPoints();
  this.type = "ARC3P";
  if (__not_null(startPt)) {
    //??TODO:
      
  }
};

MapShape.prototype.offset = function (dx, dy, dz) {
  if (this.type=="ARC") {
    this.points[0].offset(dx, dy, dz);
    this.points[1].offset(dx, dy, dz);
  }
  else {
    var p;
    var z = (__is_null(dz)? 0 : dz);
    for (var i = 0; i < this.points.length; i++) {
      p = this.points[i];
      p.x += dx;
      p.y += dy;
      p.z += z;
    }
  }
  this.bound.offset(dx, dy, dz);
};

MapShape.prototype.getRect = function (di) {
  //???
};

// Draw Shape
//
MapShape.prototype._drawPoint = function (di, symbolAtPt, symbolUnit) {
  if (__not_null(this.symbol)) {
    this.symbol._draw(di, this);
    return;
  }

  di.beginShape(this.selectable);
  // draw point as a cross
  var i = 0;
  var num = this.points.length;
  while (i < num) {
    var vp = di.toViewPos(this.points[i], symbolAtPt, symbolUnit);
    di.context.moveTo(vp.x-PIXEL_SIZE, vp.y);
    di.context.lineTo(vp.x+PIXEL_SIZE, vp.y);
    di.context.moveTo(vp.x, vp.y-PIXEL_SIZE-di.context.lineWidth/2);
    di.context.lineTo(vp.x, vp.y+PIXEL_SIZE+di.context.lineWidth/2);
    i++;
  }
  di.endShape();
};

MapShape.prototype._drawLine = function (di, symbolAtPt, symbolUnit) {
  var num = parseInt(this.points.length, 10);
  if (num < 2) {
    return;
  }
  di.beginShape(this.selectable);

  var vp = di.toViewPos(this.points[0], symbolAtPt, symbolUnit);
  di.context.moveTo(vp.x, vp.y);
  var i = 0;
  while (++i < num) {
    vp = di.toViewPos(this.points[i], symbolAtPt, symbolUnit);
    di.context.lineTo(vp.x, vp.y);
  }

  di.endShape(); //??TODO
};

MapShape.prototype._drawPolygon = function (di, symbolAtPt, symbolUnit) {
  var num = parseInt(this.points.length, 10);
  if (num < 4) {
    this._drawLine(di, symbolAtPt, symbolUnit);
    return;
  }
  di.beginShape(this.selectable);

  var vp = di.toViewPos(this.points[0], symbolAtPt, symbolUnit);
  di.context.moveTo(vp.x, vp.y);
  var i = 0;
  while (++i < num) {
    vp = di.toViewPos(this.points[i], symbolAtPt, symbolUnit);
    di.context.lineTo(vp.x, vp.y);
  }

  di.endShape();
};

MapShape.prototype._drawRect = function (di, symbolAtPt, symbolUnit) {
  if (this.points.length !== 2) {
    throw ("MapShape._drawRect: points number error");
  }
  di.beginShape(this.selectable);

  var vp1 = di.toViewPos(this.points[0], symbolAtPt, symbolUnit);
  var vp2 = di.toViewPos(this.points[1], symbolAtPt, symbolUnit);

  var rect = new RectType(vp1.x, vp1.y, vp2.x, vp2.y);
  var text = this.getAttribute(di.getTextAttrName());

  di.drawRect(rect, text);
};

MapShape.prototype._drawRoundRect = function (di, symbolAtPt, symbolUnit) {
  if (this.points.length !== 4) {
    throw ("MapShape._drawRoundRect: points number error");
  }
  di.beginShape(this.selectable);

  var vp1 = di.toViewPos(this.points[0], symbolAtPt, symbolUnit);
  var vp2 = di.toViewPos(this.points[1], symbolAtPt, symbolUnit);

  var r1 = di.toViewLength(this.points[2].x, symbolUnit);
  var r2 = di.toViewLength(this.points[2].y, symbolUnit);
  var r3 = di.toViewLength(this.points[3].x, symbolUnit);
  var r4 = di.toViewLength(this.points[3].y, symbolUnit);

  var rect = new RectType(vp1.x, vp1.y, vp2.x, vp2.y);

  di.drawRoundRect(rect, r1, r2, r3, r4);
};

MapShape.prototype._drawCircle = function (di, symbolAtPt, symbolUnit) {
  if (this.points.length !== 2) {
    throw ("MapShape._drawCircle: points number error");
  }
  di.beginShape(this.selectable);

  var center = di.toViewPos(this.points[0], symbolAtPt, symbolUnit);
  var edgept = di.toViewPos(this.points[1], symbolAtPt, symbolUnit);
  var radius = center.distance(edgept);

  di.drawCircle(center.x, center.y, radius);

  di.endShape();
};

MapShape.prototype._drawBezier = function (di, symbolAtPt, symbolUnit) {
  if (this.points.length !== 4) {
    throw ("MapShape._drawBeizer: points number error");
  }
  di.beginShape(this.selectable);
  var start = di.toViewPos(this.points[0], symbolAtPt, symbolUnit);
  var end = di.toViewPos(this.points[1], symbolAtPt, symbolUnit);
  var cp1 = di.toViewPos(this.points[2], symbolAtPt, symbolUnit);
  var cp2 = di.toViewPos(this.points[3], symbolAtPt, symbolUnit);
  di.drawBezier(start, end, cp1, cp2);
  di.endShape();
};

MapShape.prototype._drawCircle3p = function (di, symbolAtPt, symbolUnit) {
  if (this.points.length !== 3) {
    throw ("MapShape._drawCircle: points number error");
  }
  di.beginShape(this.selectable);
  //??TODO:
  
  di.endShape();
};

MapShape.prototype._drawArc = function (di, symbolAtPt, symbolUnit) {
  if (this.points.length !== 3) {
    throw ("MapShape._drawArc: points number error");
  }
  di.beginShape(this.selectable);

  var center = di.toViewPos(this.points[0], symbolAtPt, symbolUnit);
  var edgept = di.toViewPos(this.points[1], symbolAtPt, symbolUnit);
  var radius = center.distance(edgept);
  var startAngle = this.points[2].x;
  var endAngle = this.points[2].y;
  var ccw = (this.points[2].z > 0? true :false);
  di.context.arc(center.x, center.y, radius, startAngle, endAngle, ccw);

  di.endShape();
};

MapShape.prototype._drawArc3p = function (di, symbolAtPt, symbolUnit) {
  if (this.points.length !== 3) {
    throw ("MapShape._drawArc3p: points number error");
  }
  di.beginShape(this.selectable);
  //??TODO:
    
  di.endShape();
};

MapShape.prototype.__isDraw = function (di, symbolShape) {
  if (this.type=="NULL" || !this.visible) {
    return false;
  }
  if (__is_null(this.points) || this.points.length === 0) {
    return false;
  }
  if (__not_null(symbolShape)) {
    return true;
  }
  var drawRect = this._getDrawRect(di);
  var ret = drawRect.intersect(di.clipView);
  return ret;
};

// MapShape._draw
MapShape.prototype._draw = function (di, symbolAtPt, symbolUnit) {
  if (!this.__isDraw(di, symbolAtPt)) {
    return;
  }
  if (this.renderName==="__all__" && this.getRendersCount()>0) {
    var numRdrs = this.getRendersCount();
    var i;
    for (i=0; i<numRdrs; i++) {
      this._drawByRender(di, this.namedRenders.getVal(i), symbolAtPt, symbolUnit);
    }
  }
  else {
    this._drawByRender(di, this.currentRender(), symbolAtPt, symbolUnit);
  }
};

MapShape.prototype._drawByRender = function (di, render, symbolAtPt, symbolUnit) {
  var saved = di.saveRender(render);
  switch (this.type) {
  case "POINT":
    this._drawPoint(di, symbolAtPt, symbolUnit);
    break;
  case "LINE":
    this._drawLine(di, symbolAtPt, symbolUnit);
    break;
  case "POLYGON":
    this._drawPolygon(di, symbolAtPt, symbolUnit);
    break;
  case "RECT":
    this._drawRect(di, symbolAtPt, symbolUnit);
    break;
  case "ROUNDRECT":
    this._drawRoundRect(di, symbolAtPt, symbolUnit);
    break;
  case "CIRCLE":
    this._drawCircle(di, symbolAtPt, symbolUnit);
    break;
  case "CIRCLE3P":
    this._drawCircle3p(di, symbolAtPt, symbolUnit);
    break;
  case "ARC":
    this._drawArc(di, symbolAtPt, symbolUnit);
    break;
  case "ARC3P":
    this._drawArc3p(di, symbolAtPt, symbolUnit);
    break;
  case "BEZIER":
    this._drawBezier(di, symbolAtPt, symbolUnit);
    break;
  }
  di.restoreRender(render, saved);
};

MapShape.prototype.toString = function () {
  return "MapShape Class";
};

MapShape.prototype.getRendersCount = function () {
  if (__is_null(this.namedRenders)) {
    return 0;
  }
  return this.namedRenders.size();
};

MapShape.prototype.addRender = function (name, opt_tag) {
  if (__is_empty(name)) {
    throw ("MapShape.addRender: render must have a name");
  }
  if (__is_null(this.namedRenders)) {
    this.namedRenders = new PairArray();
  }  
  var at = this.namedRenders.find(name);
  if (at===ERRINDEX) {
    var render = new MapRender(name, opt_tag);
    this.namedRenders.insert(render.name, render);
    return render;
  }
  else {
    return this.namedRenders.getVal(at);
  }
};

MapShape.prototype.currentRender = function () {
  if (__is_null(this.namedRenders) || this.namedRenders.size()===0) {
    return null;
  }
  if (__is_null(this.renderName)) {
    return this.namedRenders.getVal(0);
  }
  var at = this.namedRenders.find(this.renderName);
  if (at === ERRINDEX) {
    return null;
  }
  return this.namedRenders.getVal(at);
};

MapShape.prototype.useDefaultRender = function () {
  this.renderName = "__default__";
  return this.addRender(this.renderName);
};

MapShape.prototype.useAllRender = function () {
  this.renderName = "__all__";
};

// get point item by index
MapShape.prototype.item = function (i) { // i: 0-based
  return this.points[i];
};

MapShape.prototype.clearPoints = function () {
  this.type = "NULL";
  this.points = [];
  this.updateBound();
};

MapShape.prototype.clone = function (src) {
  this.clearPoints();
  this.clearAttributes();
  this.id = src.id;
  this.tag = src.tag;
  this.points = new Array(src.points.length);
  var i;
  for (i=0; i<src.points.length; i++) {
    this.points[i] = src.points[i].spawn();
  }
  this.bound = src.bound.spawn();
  this.type = src.type;
  this.visible = src.visible;
  this.selectable = src.selectable;
  this.namedRenders = src.namedRenders;
  this.renderName = src.renderName;
  this.symbol = src.symbol;
  // copy attributes
  var num = src.getAttributesCount();
  for (i=0; i<num; i++) {
    this.addAttribute(src.attributes.getKey(i), src.attributes.getVal(i));
  }
};

MapShape.prototype.spawn = function () {
  var newShape = new MapShape();
  newShape.clone(this);
  return newShape;
};

