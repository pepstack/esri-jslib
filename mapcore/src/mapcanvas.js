/**
 * MapCanvas class
 */
var MapCanvas = function (canvasID) {
  this._init(canvasID);
};

MapCanvas.prototype = new AttributesMap();

MapCanvas.eventDispatcher = function (e, theMapCanvas, handler) {
  if (__not_null(handler)) {
    handler(e, theMapCanvas);
  }
};

MapCanvas.prototype.getVersion = function () {
  return '@VERSION'; // replaced by version.txt after make
};

MapCanvas.prototype.supportCanvas = function () {
  return (__not_null(this.canvas) && __not_null(this.__canvasContext));
};

// get layer by index or name
MapCanvas.prototype.item = function (at) { // at: 0-based index or name
  var id = parseInt(at, 10);
  if (isNaN(id)) {
    // find by name
    var index = this.layers.find(at);
    if (index === ERRINDEX) {
      return null;
    }
    else {
      return this.layers.getVal(index);
    }
  }
  else if (id>=0 && id<this.layers.size()) {
    return this.layers.getVal(id);
  }
  else {
    throw new Error("MapCanvas: invalid layer index");
  }
};

// get layer by index or name
MapCanvas.prototype.layerItem = function (at) { // at: 0-based index or name
  var id = parseInt(at, 10);
  if (isNaN(id)) {
    // find by name
    var index = this.layers.find(at);
    if (index === ERRINDEX) {
      return null;
    }
    else {
      return this.layers.getVal(index);
    }
  }
  else if (id>=0 && id<this.layers.size()) {
    return this.layers.getVal(id);
  }
  else {
    throw new Error("MapCanvas: invalid layer index");
  }
};

// get widget by index or name
MapCanvas.prototype.widgetItem = function (at) { // at: 0-based index or name
  var id = parseInt(at, 10);
  if (isNaN(id)) {
    // find by name
    var index = this.widgets.find(at);
    if (index === ERRINDEX) {
      return null;
    }
    else {
      return this.widgets.getVal(index);
    }
  }
  else if (id>=0 && id<this.widgets.size()) {
    return this.widgets.getVal(id);
  }
  else {
    throw new Error("MapCanvas: invalid widget index");
  }
};

MapCanvas.prototype.addLayer = function (name, opt_tag) {
  var newLayer = new MapLayer(name, opt_tag);
  this.layers.insert(name, newLayer);
  return newLayer;
};

MapCanvas.prototype.addWidget = function (name, opt_tag) {
  var newWidget = new MapWidget(name, opt_tag);
  this.widgets.insert(name, newWidget);
  return newWidget;
};

MapCanvas.prototype.getDataBound = function () {
  var db = new MapBound();
  db.createFromRect(this.__viewport.fullDataRect);
  return db;
};

MapCanvas.prototype.getViewDataBound = function () {
  var vdb = new MapBound();
  vdb.createFromRect(this.__viewport.viewDataRect);
  return vdb;
};

// view pos to map point
MapCanvas.prototype.toMapPoint = function (viewX, viewY) {
  return this.__viewport.vp2dp(viewX, viewY);
};

// map point to view pos
MapCanvas.prototype.toViewPos = function (mapX, mapY) {
  return this.__viewport.dp2vp(mapX, mapY);
};

MapCanvas.prototype.resizeMap = function (newWidth, newHeight) {
  if (newWidth!=this.canvas.width || newHeight!=this.canvas.height) {
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.__backend.width = this.canvas.width;
    this.__backend.height = this.canvas.height;
    this.__surface.width = this.canvas.width;
    this.__surface.height = this.canvas.height;
    this.__viewport.setViewRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

MapCanvas.prototype._drawWidgets = function (context, width, height) {
  var nw = parseInt(this.widgets.size(), 10);
  while (nw-- > 0){
    this.widgetItem(nw)._draw(context, width, height);
  }
};

MapCanvas.prototype.eraseBkgnd = function (opt_bFlushBackend) {
  this.__surfaceContext.fillStyle = this.bkgndColor;
  this.__canvasContext.fillStyle = this.bkgndColor;

  if (__is_null(this.__bkgndPattern)) {
    if (__not_null(this.__bkgndImageState) && this.__bkgndImageState.ready) {
      this.__bkgndPattern = this.__surfaceContext.createPattern(this.__bkgndImageState.image, "repeat");
    }
  }

  if (__not_null(this.__bkgndPattern)) {
    this.__surfaceContext.fillStyle = this.__bkgndPattern;
    this.__canvasContext.fillStyle = this.__bkgndPattern;
  }

  this.__surfaceContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

  this._drawWidgets(this.__surfaceContext, this.canvas.width, this.canvas.height);

  // when opt_bFlushBackend is null, do flush backend
  if (__is_null(opt_bFlushBackend) || __is_true(opt_bFlushBackend)) {
    // flush backend
    this.__backendContext.fillStyle = "#000000";
    this.__backendContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
};

MapCanvas.prototype.updateBound = function (opt_fixBound) {
  if (__not_null(opt_fixBound)) {
    this.__viewport.setDataRect(opt_fixBound.xmin, opt_fixBound.ymin, opt_fixBound.xmax, opt_fixBound.ymax);
  }
  else {
    var n = this.layers.size();
    if (n > 0) {
      var brc = this.item(0).bound.spawn();
      while (n-- > 1) {
        brc.union(this.item(n).bound);
      }
      this.__viewport.setDataRect(brc.xmin, brc.ymin, brc.xmax, brc.ymax);
    }
  }
};

MapCanvas.prototype.panView = function (vx1, vy1, vx2, vy2) {
  this.__viewport.panViewPos(vx1, vy1, vx2, vy2);
};

MapCanvas.prototype.zoomAll = function (times/*1.0*/) {
  this.__viewport.zoomAll(times);
};

MapCanvas.prototype.zoomIn = function (x, y) {
  this.__viewport.zoomAt(x, y, 2.0);
};

MapCanvas.prototype.zoomOut = function (x, y) {
  this.__viewport.zoomAt(x, y, 0.5);
};

MapCanvas.prototype.zoomExtent = function (x1, y1, x2, y2) {
  __log("zoomExtent by MapPoint: ", x1, y1, x2, y2);
  var vp1 = this.toViewPos(x1, y1);
  var vp2 = this.toViewPos(x2, y2);
  __log("zoomExtent by ViewPos: ", vp1.x, vp1.y, vp2.x, vp2.y);
  this.__viewport.zoomBox(vp1.x, vp1.y, vp2.x, vp2.y);
};

MapCanvas.prototype.zoomResolution = function (resolution) {
  this.__viewport.setResolution(resolution);
};

MapCanvas.prototype.centerAt = function (x, y) {
  var vp = this.__viewport.dp2vp(x, y);
  this.__viewport.centerAt(vp.x, vp.y);
};

MapCanvas.prototype.exportMap = function (wnd, opt_width, opt_height) {
  var w = __is_empty(opt_width)? this.canvas.width: opt_width;
  var h = __is_empty(opt_height)? this.canvas.height: opt_height;
  wnd.open(this.canvas.toDataURL(), this.__canvasID,
      "left=0,top=0,width="+w+",height="+h+",toolbar=0,resizable=0");
};

MapCanvas.prototype.getPixelColor = function (x, y) {
  var pix = this.__canvasContext.getImageData(x, y, 1, 1).data;
  var r = pix[0]>>0;
  var g = pix[1]<<8;
  var b = pix[2]<<16;
  var a = pix[3]<<24;
  return (r|g|b|a);
};

MapCanvas.prototype.refreshAll = function () {
  __log("MapCanvas.refreshAll()");
  this.refresh(true);
};

MapCanvas.prototype.refresh = function (withBackend, obj) {
  //__log("MapCanvas.refresh: ", withBackend);
  this.eraseBkgnd(withBackend);

  var di = new DrawInfo(this.__surface, this.__surfaceContext, this.__viewport);
  if (withBackend) {
    di.saveBackend(this.__backend, this.__backendContext);
  }
  // draw all layers into surface
  var numLayers = parseInt(this.layers.size(), 10);
  if (numLayers>0) {
    while (numLayers-- > 0){
      di.layerIndex = numLayers;
      this.item(numLayers)._draw(di);
      di.layerIndex = null;
    }
  }
  if (withBackend) {
    di.restoreBackend(this.__backend, this.__backendContext);
  }

  // draw tracking layer into canvas
  di.setDrawContext(this.canvas, this.__canvasContext);
  this.__canvasContext.drawImage(this.__surface, 0, 0); // copy surface to canvas
  this.trackingLayer._draw(di);

  // draw info windows into canvas
  //??TODO
};

MapCanvas.prototype.refreshTrackingLayer = function (obj) {
  var di = new DrawInfo(this.canvas, this.__canvasContext, this.__viewport);
  this.__canvasContext.drawImage(this.__surface, 0, 0); // copy surface to canvas
  this.trackingLayer._draw(di);
};

MapCanvas.prototype.panningCanvas = function (x1, y1, x2, y2) {
  this.__canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.__canvasContext.drawImage(this.__surface, x2-x1, y2-y1); // copy surface to canvas
};

MapCanvas.prototype.fastHitTest = function (vx, vy, event) {
  var p = this.__backendContext.getImageData(vx, vy, 1, 1).data;
  if (p[0]!==0) {
    var hit = new ShapeTrace(this);
    if ( hit.init(p[0]-1, p[1]-1, (p[2]===0? null : (p[2]-1))) ) {
      // __log(hit.toXml());
      if (__not_null(event)) {
        if (__not_null(hit.shape.eventHandler)) {
          // __log("fastHitTest: shape.eventHandler =>");
          hit.shape.eventHandler(event, this, hit.shape, hit);
        }
        if (__not_null(hit.symbolShape) && __not_null(hit.symbolShape.eventHandler)) {
          // __log("fastHitTest: symbolShape.eventHandler =>");
          hit.symbolShape.eventHandler(event, this, hit.symbolShape, hit);
        }
      }
      return hit;
    }
    else {
      this.refreshAll();
    }
  }
  return null;
};

MapCanvas.prototype.setCursor = function (style, e) {
  if (__not_null(e)) {
    e.preventDefault();
    e.stopPropagation();
  }
  this.canvas.style.cursor=style;
};

MapCanvas.prototype.drawPoint_onClick = function (vx, vy) {
  if (this.opState==="opDrawPoint") {
    __log("drawPoint_onClick");
    var layer = this.getAttribute(this.opState+"Layer");
    var point = layer.addShape();
    var pt = this.toMapPoint(vx, vy);
    this.addAttribute("lastpoint", pt); //??temp code
    point.createPoint(pt.x, pt.y, pt.z);
    point.symbol = this.getAttribute("$point");
    layer.updateBound();
    this.refresh(true, pt);
  }
};

MapCanvas.prototype.drawLine_onClick = function (vx, vy) {
  if (this.opState==="opDrawLine") {
    __log("drawLine_onClick");
    var polyline = this.getAttribute(this.opState);
    if (__is_null(polyline)) {
      polyline = this.trackingLayer.addShape();
      polyline.createLine();
      this.addAttribute(this.opState, polyline);
    }
    var pt = this.toMapPoint(vx, vy);
    polyline.points.push(pt);
    polyline.updateBound();
    this.refreshTrackingLayer(polyline);
  }
};

MapCanvas.prototype.drawLine_onMouseMove = function (vx, vy) {
  if (this.opState==="opDrawLine") {
    var polyline = this.getAttribute(this.opState);
    if (__not_null(polyline) && polyline.points.length>0) {
      var pt = this.toMapPoint(vx, vy);
      polyline.points.push(pt);
      polyline.updateBound();
      this.refreshTrackingLayer(polyline);
      polyline.points.pop();
    }
  }
};

MapCanvas.prototype.drawLine_onDblClick = function (vx, vy) {
  if (this.opState==="opDrawLine") {
    __log("drawLine_onDblClick");
    // end draw line
    var polyline = this.getAttribute(this.opState);
    this.removeAttribute(this.opState);
    if (__not_null(polyline)) {
      this.trackingLayer.removeAt(polyline);
      this.trackingLayer.updateBound();
       
      if (polyline.valid) {
        polyline.selectable = true;
        var layer = this.getAttribute(this.opState+"Layer");
        layer.addShape(polyline);
        layer.updateBound();
      }
      this.refresh(true, polyline);
    }
  }
};
  
MapCanvas.prototype.drawPolygon_onClick = function (vx, vy) {
  if (this.opState==="opDrawPolygon") {
    __log("drawPolygon_onClick");
    var polygon = this.getAttribute(this.opState);
    if (__is_null(polygon)) {
      polygon = this.trackingLayer.addShape();
      polygon.createPolygon();
      this.addAttribute(this.opState, polygon);
    }
    var pt = this.toMapPoint(vx, vy);
    polygon.points.push(pt);
    polygon.updateBound();
    this.refreshTrackingLayer(polygon);
  }
};

MapCanvas.prototype.drawPolygon_onMouseMove = function (vx, vy) {
  if (this.opState==="opDrawPolygon") {
    var polygon = this.getAttribute(this.opState);
    if (__not_null(polygon)) {
      // ensure we have clicked at less 1 point
      if (polygon.points.length>=1) {
        var pt = this.toMapPoint(vx, vy);
        polygon.points.push(pt); // add current pt
        polygon.points.push(polygon.points[0]); // add first pt to enclose it
        polygon.updateBound();
        this.refreshTrackingLayer(polygon);
        polygon.points.pop();
        polygon.points.pop();
      }
    }
  }
};

MapCanvas.prototype.drawPolygon_onDblClick = function (vx, vy) {
  if (this.opState==="opDrawPolygon") {
    __log("drawPolygon_onDblClick");
    // end draw polygon
    var polygon = this.getAttribute(this.opState);
    this.removeAttribute(this.opState);
    if (__not_null(polygon)) {
      this.trackingLayer.removeAt(polygon);
      this.trackingLayer.updateBound();
      if (polygon.points.length >= 3) {
        polygon.points.push(polygon.points[0]);
        if (polygon.valid) {
          var layer = this.getAttribute(this.opState+"Layer");
          polygon.selectable = true;
          layer.addShape(polygon);
          layer.updateBound();
        }
      }
      this.refresh(true, polygon);
    }
  }
};

MapCanvas.prototype.drawRect_onClick = function (vx, vy) {
  if (this.opState==="opDrawRect" || this.opState==="opZoomBox") {
    __log("drawRect_onClick");
    var rect = this.getAttribute(this.opState);
    if (__is_null(rect)) {
      rect = this.trackingLayer.addShape();
      rect.createRect();
      this.addAttribute(this.opState, rect);
    }
    if (rect.points.length<2) {
      var pt = this.toMapPoint(vx, vy);
      rect.points.push(pt);
      rect.updateBound();
    }
    if (rect.points.length===2) {
      this.addAttribute(this.opState, null);
      this.trackingLayer.removeAt(rect);
      this.trackingLayer.updateBound();
      if (this.opState==="opDrawRect") {
        var layer = this.getAttribute(this.opState+"Layer");
        layer.addShape(rect);
        layer.updateBound();
      }
      else {
        __log(this.opState);
        var pt1 = rect.points[0];
        var pt2 = rect.points[1];
        this.zoomExtent(pt1.x, pt1.y, pt2.x, pt2.y);
      }
      this.refresh(true, rect);
    }
  }
};

MapCanvas.prototype.drawRect_onMouseMove = function (vx, vy) {
  if (this.opState==="opDrawRect" || this.opState==="opZoomBox") {
    __log("drawRect_onMouseMove");
    var rect = this.getAttribute(this.opState);
    if (__not_null(rect)) {
      if (rect.points.length===1) {
        var pt = this.toMapPoint(vx, vy);
        rect.points.push(pt); // add current pt
        rect.updateBound();
        this.refreshTrackingLayer(rect);
        rect.points.pop();          
      }
    }    
  }
};

MapCanvas.prototype._init = function (canvasID) {
  this.__map = {}; // used by AttributesMap

  var self = this;

  this.__canvasID = canvasID;
  this.canvas = __get_elem(this.__canvasID);
  this.__canvasContext = this.canvas.getContext("2d");
  this.__viewport = new Viewport(new RectType(0, 0, this.canvas.width, this.canvas.height),
                                 new RectType(0, 0, this.canvas.width, this.canvas.height), 1.0);

  // check canvas
  if (__is_null(this.canvas) || __is_null(this.__canvasContext)) {
    throw "MapCanvas: canvas 2d not supported.";
  }

  // backend for hit-testing
  this.__backend = document.createElement("canvas");
  this.__backend.width = this.canvas.width;
  this.__backend.height = this.canvas.height;
  this.__backendContext = this.__backend.getContext("2d");

  // surface for layers drawing NOT including tracking layer
  this.__surface = document.createElement("canvas");
  this.__surface.width = this.canvas.width;
  this.__surface.height = this.canvas.height;
  this.__surfaceContext = this.__surface.getContext("2d");

  Object.defineProperty(this, 'width', {
    get: function () {
      return this.canvas.width;
    },
    set: function (val) {
      this.canvas.width = val;
    }
  });

  Object.defineProperty(this, 'height', {
    get: function () {
      return this.canvas.height;
    },
    set: function (val) {
      this.canvas.height = val;
    }
  });

  // Data
  //
  this.opState = "opNone";

  this.trackingLayer = new MapLayer("__tracking_layer__");

  this.layers = new PairArray();

  this.widgets = new PairArray();

  this.bkgndColor = "#FFFFFF";

  this.__bkgndImageState = null;
  this.__bkgndPattern = null;

  Object.defineProperty(this, 'bkgndImage', {
    get: function () {
      return this.__bkgndImageState;
    },
    set: function (imgState) {
      this.__bkgndPattern = null;
      this.__bkgndImageState = imgState;
      try {
        if (__not_null(this.__bkgndImageState) && this.__bkgndImageState.ready) {
          this.__bkgndPattern = this.__canvasContext.createPattern(this.__bkgndImageState.image, "repeat");
        }
      }
      catch (e) {
        this.__bkgndImageState = null;
        this.__bkgndPattern = null;        
      }
    }
  });

  // Events Listening
  //
  Object.defineProperty(this, 'onKeyPressed', {
    set: function (fn) {
      //?? this.canvas.addEventListener
      window.addEventListener('keyup', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);
      }, true);
    }
  });

  Object.defineProperty(this, 'onMouseClick', {
    set: function (fn) {
      this.canvas.addEventListener('click', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);

        self.drawRect_onClick(e._x, e._y);
        self.drawPoint_onClick(e._x, e._y);
        self.drawLine_onClick(e._x, e._y);
        self.drawPolygon_onClick(e._x, e._y);
      }, false);
    }
  });

  Object.defineProperty(this, 'onMouseDblClick', {
    set: function (fn) {
      this.canvas.addEventListener('dblclick', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);

        self.drawLine_onDblClick(e._x, e._y);
        self.drawPolygon_onDblClick(e._x, e._y);
      }, false);
    }
  });

  Object.defineProperty(this, 'onMouseMove', {
    set: function (fn) {
      this.canvas.addEventListener('mousemove', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);

        self.drawRect_onMouseMove(e._x, e._y);
        self.drawLine_onMouseMove(e._x, e._y);
        self.drawPolygon_onMouseMove(e._x, e._y);
      }, false);
    }
  });

  Object.defineProperty(this, 'onMouseWheel', {
    set: function (fn) {
      this.canvas.addEventListener('mousewheel', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);
      }, false);
    }
  });

  Object.defineProperty(this, 'onMouseDown', {
    set: function (fn) {
      this.canvas.addEventListener('mousedown', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);
      }, false);
    }
  });

  Object.defineProperty(this, 'onMouseUp', {
    set: function (fn) {
      this.canvas.addEventListener('mouseup', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);
      }, false);
    }
  });

  Object.defineProperty(this, 'onMouseOver', {
    set: function (fn) {
      this.canvas.addEventListener('mouseover', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);
      }, false);
    }
  });

  Object.defineProperty(this, 'onMouseOut', {
    set: function (fn) {
      this.canvas.addEventListener('mouseout', function(e) {
        MapCanvas.eventDispatcher(e, self, fn);
      }, false);
    }
  });
};

