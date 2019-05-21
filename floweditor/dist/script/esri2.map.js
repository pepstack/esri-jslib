/******************************************************************************
 * esri2.map.js
 *
 * Version: 0.0.1
 *
 * Copyright (c) 2011-2012 Esri
 *
 * All rights reserved under the copyright laws of the United States.
 * You may freely redistribute and use this software, with or
 * without modification, provided you include the original copyright
 * and use restrictions.  See use restrictions in the file:
 * <install location>/License.txt
 *
 * Last Date: 
 *****************************************************************************/
 /**
 * esri2.map.js
 *   required: esri2.utility.js
 */

/**
 * jslint browser: true,
 * onevar: true,
 * undef: true,
 * nomen: true,
 * bitwise: true,
 * regexp: true,
 * newcap: true,
 * immed: true,
 * strict: true,
 * global window: false,
 * jQuery: false,
 * console: false
 */
(function(window, undefined) {
// Enable ECMAScript "strict" operation for this function. See more:
//   http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Predefinitions, DONOT change below:
var
  TRUE = true,
  FALSE = false,
  NULL = null,
  ERRINDEX = -1  
;

// You CAN change below default values:
//
var
  FIXED_DIG = 2,
  PIXEL_SIZE = 3
;

/**
 * $AttributesMap class
 *    attribute: key=>value pair
 */
var AttributesMap = function () {
  // The derived class from this must has a definition as follow:
  // this.__map = {};
};

AttributesMap.prototype = {
  getAttributesCount : function () {
    var cnt = 0, key;
    for (key in this.__map) {
      cnt++;
    }
    return cnt;
  },

  getAttributeName : function (at) {
    var k, i = 0;
    for (k in this.__map) {
      if (i++===at) {
        return k;
      }
    }
    return null;
  },

  getAttributeAt : function (at) {
    var k, i = 0;
    for (k in this.__map) {
      if (i++===at) {
        return this.__map[k];
      }
    }
  },

  getAttribute : function (attName, failReturn) {
    var val = this.__map[attName];
    if (val===null) {
      return failReturn;
    }
    return val;
  },

  addAttribute : function (attName, attrValue) {
    if (__is_empty(attName)) {
      return null;
    }
    var oldValue = this.__map[attName];
    this.__map[attName] = attrValue;
    return oldValue;
  },

  removeAttribute : function (attName) {
    delete(this.__map[attName]);
  },

  clearAttributes : function () {
    this.__map = null;
    this.__map = {};
  }
};

/**
 * ImageLoader
 *   HTML5 preload images
 */
var ImageLoader = function (afterLoadFunc, opt_param) {
  this._init(afterLoadFunc, opt_param);
};

ImageLoader.prototype = new AttributesMap();

ImageLoader.prototype._init = function (afterLoadFunc, opt_param) {
  this.__map = {};  // used by AttributesMap
  this.onImageLoad = afterLoadFunc; // function (imgState)
  this.param = opt_param;
  this.readyCount = 0;
};

ImageLoader.prototype.toString = function () {
  return "ImageLoader class";
};

ImageLoader.prototype.addImage = function (imgName, imgSrc, opt_param) {
  __log("add image: ", imgName, "=>", imgSrc);
  this.addAttribute(imgName, new ImageLoader.ImageState(imgName, imgSrc, this, opt_param));
};

ImageLoader.prototype.getImagesCount = function () {
  return this.getAttributesCount();
};

ImageLoader.prototype.loadAll = function () {
  var i = 0,
      num = this.getImagesCount(),
      imgState;

  for (; i<num; i++) {
    imgState = this.getAttributeAt(i);
    imgState._doLoad();
  }
};

ImageLoader.prototype.allReady = function () {
  return (this.getImagesCount()==this.readyCount);
};

ImageLoader.prototype.getImageState = function (name) {
  return this.getAttribute(name);
};

ImageLoader.prototype.getImage = function (name) {
  var imgState = this.getImageState(name);
  if (__not_null(imgState) && imgState.ready) {
    return imgState.image;
  }
  return null;
};

ImageLoader.ImageState = function (name, imgSrc, imageLoader, opt_param) {
  this.name = name;
  this.ready = false;
  this.imgSrc = imgSrc;
  this.param = opt_param;
  this.loader = imageLoader;
  this.image = new Image();
};

ImageLoader.ImageState.prototype._doLoad = function () {
  this.image.addEventListener('load', ImageLoader.ImageState.onReady(this), false);
  this.image.src = this.imgSrc;
};

ImageLoader.ImageState.onReady = function (imgState) {
  return function () {
    imgState.ready = true;
    imgState.loader.readyCount++;

    __log("image loaded: ", imgState.name, "<=", imgState.imgSrc);
    if (__not_null(imgState.loader.onImageLoad)) {
      imgState.loader.onImageLoad(imgState);
    }
  };
};

/**
 * MapWidget class
 */
var MapWidget = function (name, opt_tag) {
  this._init(name, opt_tag);
};

MapWidget.prototype = {
  _init : function (name, opt_tag) {
    this.name = name;
    this.tag = opt_tag;
    this.visible = true;
    this.imageState = null;
  },

  setImage : function (imageState, cx, cy, pos) {
    this.imageState = imageState;
    this.cx = cx;
    this.cy = cy;
    this.position = pos;
  },

  _draw : function (context, canvasWidth, canvasHeight) {
    if (this.visible) {
      __log("MapWidget._draw: ", this.name);
      if (this.position==="right-bottom") {
        context.drawImage(this.imageState.image, canvasWidth-this.cx, canvasHeight-this.cy);
      }
      else if (this.position==="left-top") {
        context.drawImage(this.imageState.image, 0, 0);
      }
    }
  }
};

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
  return '0.0.1'; // replaced by version.txt after make
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

/**
 * MapRender class
 */
var MapRender = function (name, tag) {
  this._init(name, tag);
};

MapRender.prototype._init = function (name, tag) {
  this.name = name; // unique name used to identify a render in renders
  this.tag = tag;
  this.enabled = true;

  //@globalAlpha = (1.0=completely opaque; 0.0=completely transparent)
  this.globalAlpha = 1.0;

  //@globalCompositeOperation = (copy|destination-atop|destination-in|destination-out|destination-over|
  //   lighter|source-atop|source-in|source-out|source-over|xor)
  this.globalCompositeOperation = "source-over";
    
  this.strokeStyle = "#FF0000"; // line color value, set =null for not drawing line
  this.fillStyle = "#00FF00";   // fill color value, set =null for not filling color
  this.fillImage = null;        // fill pattern image

  this.lineCap = "square";      // {butt|round|square}
  this.lineJoin = "miter";      // {miter|bevel|round}
  this.lineWidth = 3;           // default = 1.0
  this.miterLimit = 10;

  this.textStyle = "#000";
  this.textAttrName = null;     // specify the attribute of shape needed to draw text
  this.textAlign = "left";      // {center|start|end|left|right}
  this.textBaseline = "top";    // {top|hanging|middle|alphabetic|ideographic|bottom}

  this.fontStyle = "normal";    // {normal|italic|oblique|inherit}
  this.fontWeight = "400";      // {normal|bold|bolder|lighter|100|...|900|inherit|auto}
  this.fontSize = "10pt";
  this.fontFace = "Times New Roman";

  // gradient
  this.linearGradient = null;
  this.radialGradient = null;

  this.shadowBlur = 0; // 8 is perfect
  this.shadowColor = "#000";
  this.shadowOffsetX = 0;
  this.shadowOffsetY = 0;

  //@font
  Object.defineProperty(this, 'font', {
    get: function () {
      return (this.fontStyle+" "+this.fontWeight+" "+this.fontSize+" "+ this.fontFace);
    }
  });
};

MapRender.prototype.validateProp = function (prop) {
  return (__not_empty(prop) && prop!="undefined");
};

MapRender.prototype.setContext = function (context) {
  context.textAlign = this.textAlign;
  context.textBaseline = this.textBaseline;
  context.lineCap = this.lineCap;
  context.lineJoin = this.lineJoin;
  context.lineWidth = this.lineWidth;
  context.miterLimit = this.miterLimit;
  context.font = this.font;
  context.globalAlpha = this.globalAlpha;
  context.globalCompositeOperation = this.globalCompositeOperation;
  if (this.validateProp(this.strokeStyle)) {
    context.strokeStyle = this.strokeStyle;
  }
  if (this.validateProp(this.fillStyle)) {
    context.fillStyle = this.fillStyle;
  }
  context.textAlign = this.textAlign;
  context.textBaseline = this.textBaseline;  
  context.lineCap = this.lineCap;
  context.lineJoin = this.lineJoin;
  context.lineWidth = this.lineWidth;
  context.miterLimit = this.miterLimit;
  context.font = this.font;
  context.shadowBlur = this.shadowBlur;
  context.shadowColor = this.shadowColor;
  context.shadowOffsetX = this.shadowOffsetX;
  context.shadowOffsetY = this.shadowOffsetY;      
};

MapRender.prototype.setStroke = function (color, width, cap, join) {
  this.strokeStyle = color;
  this.lineWidth = __not_null(width)? width : 0;
  this.lineCap = __not_null(cap)? cap : "square";
  this.lineJoin = __not_null(join)? join : "miter";
};

MapRender.prototype.setFill = function (color, image) {
  this.fillStyle = color;
  this.fillImage = image;
};

MapRender.prototype.setText = function (color, attrName, align, baseline) {
  this.textStyle = __not_null(color)? color : "#000";
  this.textAttrName = attrName;  
  this.textAlign = __not_null(align)? align : "left";
  this.textBaseline = __not_null(baseline)? baseline: "top";
};

MapRender.prototype.setFont = function (style, weight, size, face) {
  this.fontStyle = __not_null(style)? style: "normal";
  this.fontWeight = __not_null(weight)? weight: "400";
  this.fontSize = __not_null(size)? size: "10pt";
  this.fontFace = __not_null(face)? face: "Times New Roman";
};

MapRender.prototype.setShadow = function (blur, color, offsetX, offsetY) {
  if (__not_null(blur)) {
    this.shadowBlur = blur;
    this.shadowColor = color;
    this.shadowOffsetX = offsetX;
    this.shadowOffsetY = offsetY;
  }
  else {
    this.shadowBlur = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
  }
};

MapRender.prototype.setLinearGradient = function () {
  var args = Array.prototype.slice.call(arguments);
  if (args.length>2) {
    this.linearGradient = new MapRender.LinearGradient(args[0][0], args[0][1]);
    if (this.linearGradient.isValid()) {
      for (var i=1; i<args.length; i++) {
        this.linearGradient.addColorStop(args[i][0], args[i][1]);
      }
    }
  }
};

/**
 * MapRender.RadialGradient
 * ??TODO:
 */
MapRender.RadialGradient = function () {
  this._init();
};

MapRender.RadialGradient.prototype._init = function () {
};

MapRender.RadialGradient.prototype.addColorStop = function (at, color) {
};

MapRender.RadialGradient.prototype.isValid = function () {
};

MapRender.RadialGradient.prototype.fillEnabled = function () {
};

MapRender.RadialGradient.prototype.strokeEnabled = function () {
};

MapRender.RadialGradient.prototype.createDrawStyle = function (context, circle) {
};
/**
 * MapRender.LinearGradient
 */
MapRender.LinearGradient = function (style, direction) {
  this._init(style, direction);
};

MapRender.LinearGradient.Directions = ['WE', 'EW', 'SN', 'NS', 'SWNE', 'NESW', 'NWSE', 'SENW'];
MapRender.LinearGradient.Styles = ['fill', 'stroke', 'both'];

MapRender.LinearGradient.prototype._init = function (style, direction) {
  var i;
  this.style = -1;
  this.direction = -1;

  for (i=0; i<MapRender.LinearGradient.Directions.length; i++) {
    if (MapRender.LinearGradient.Directions[i]===direction) {
      this.direction = i;
      break;
    }
  }

  for (i=0; i<MapRender.LinearGradient.Styles.length; i++) {
    if (MapRender.LinearGradient.Styles[i]===style) {
      this.style = i;
      break;
    }
  }

  this.colors = {};
};

MapRender.LinearGradient.prototype.addColorStop = function (at, color) {
  this.colors[at] = color;
};

MapRender.LinearGradient.prototype.isValid = function () {
  return (this.style!==-1 && this.direction!==-1);
};

MapRender.LinearGradient.prototype.fillEnabled = function () {
  return (this.style===0||this.style===2);
};

MapRender.LinearGradient.prototype.strokeEnabled = function () {
  return (this.style===1||this.style===2);
};

// (xmin,ymin) N
//       +----------+
//  W    |          |   E
//       |          |
//       +----------+ (xmax, ymax)
//             S
MapRender.LinearGradient.prototype.createDrawStyle = function (context, rect) {
  var at, grObj, x1, y1, x2, y2;

  switch (this.direction) {
  case 0:
    x1=rect.xmin;
    y1=rect.ymin;
    x2=rect.xmax;
    y2=rect.ymin;
    break;
  case 1:
    x1=rect.xmax;
    y1=rect.ymin;
    x2=rect.xmin;
    y2=rect.ymin;
    break;
  case 2:
    x1=rect.xmin;
    y1=rect.ymax;
    x2=rect.xmin;
    y2=rect.ymin;
    break;
  case 3:
    x2=rect.xmin;
    y2=rect.ymax;
    x1=rect.xmin;
    y1=rect.ymin;
    break;
  case 4:
    x1=rect.xmin;
    y1=rect.ymax;
    x2=rect.xmax;
    y2=rect.ymin;
    break;
  case 5:
    x2=rect.xmin;
    y2=rect.ymax;
    x1=rect.xmax;
    y1=rect.ymin;
    break;
  case 6:
    x1=rect.xmin;
    y1=rect.ymin;
    x2=rect.xmax;
    y2=rect.ymax;
    break;
  case 7:
    x2=rect.xmin;
    y2=rect.ymin;
    x1=rect.xmax;
    y1=rect.ymax;
    break;
  }

  grObj = context.createLinearGradient(x1, y1, x2, y2);

  // Add the color stops
  for (at in this.colors) {
    grObj.addColorStop(at, this.colors[at]);
  }

  return grObj;
};
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

/**
 * PairArray class
 *   key-value map array
 */
var PairArray = function () {
  this.__keymap = {}; // save indices to keys
  this.__keys = [];
  this.__vals = [];
};

PairArray.MaxSize = 10000;

PairArray.prototype = {
  toString : function () {
    return "PairArray class";
  },

  genKey : function () {
    var key = this.size();
    if (this.find(key)===ERRINDEX) {
      return key;
    }
    key = 0;
    while (key++ < PairArray.MaxSize) {
      if (this.find(key)===ERRINDEX) {
        return key;
      }
    }
    return null;
  },

  find : function (key) {
    var keyIdx = this.__keymap[key];
    return (__is_null(keyIdx)? ERRINDEX : keyIdx);
  },

  insert : function (key, value) {
    var keyIdx = this.find(key);
    if (keyIdx===ERRINDEX) {
      this.__keymap[key] = this.__keys.length;
      this.__keys.push(key);
      this.__vals.push(value);
    }
    else {
      this.__vals[keyIdx] = value;
    }
  },

  size : function () {
    return this.__keys.length;
  },

  getKey : function (at) {
    return this.__keys[at];
  },

  getVal : function (at) {
    return this.__vals[at];
  },

  setVal : function (at, value) {
    this.__vals[at] = value;
  },

  eraseAt : function (at) {
    if (at>=0 && at<this.size()) {
      var k,
          id,
          key = this.__keys[at];

      for (k in this.__keymap) {
        id = this.__keymap[k];
        if (id > at) {
          this.__keymap[k] = id-1;
        }
      }

      delete (this.__keymap[key]);
      this.__keys.splice(at, 1);
      return this.__vals.splice(at, 1);
    }
    return null;
  },

  erase : function (key) {
    return this.eraseAt(this.find(key));
  },

  clear : function () {
    this.__keymap = null;
    this.__keymap = {};
    this.__keys.splice(0);
    this.__vals.splice(0);
  }
};

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

/**
 * Viewport class
 *   transform coordinates between view and data systems
 *   by Liang_Zhang@esri.com
 */
var Viewport = function (view, data, ratio_xy) {
  this.__init(view, data, ratio_xy);
};

Viewport.prototype = {
  __init : function (view, data, ratio_xy) {
    this.__MinScale = 0.0000001;
    this.__MaxScale = 1000000.0;

    // View port in logical unit pixels
    this.__viewRect = new RectType (view.xmin, view.ymin, view.xmax, view.ymax);
    if (this.__viewRect.width < 1) {
      this.__viewRect.xmax = this.__viewRect.xmin+1;
    }
    if (this.__viewRect.height < 1) {
      this.__viewRect.ymax = this.__viewRect.ymin+1;
    }

    // Data rect in coordinates unit
    this.__dataRect = new RectType (data.xmin, data.ymin, data.xmax, data.ymax);
    if (this.__dataRect.width < this.__MinScale) {
      this.__dataRect.xmax = this.__dataRect.xmin + this.__MinScale;
    }
    if (this.__dataRect.height < this.__MinScale) {
      this.__dataRect.ymax = this.__dataRect.ymin + this.__MinScale;
    }

    // X_DPI/Y_DPI, default is 1.0. used when transformation
    this.__ratio = (__is_null(ratio_xy) || ratio_xy===0)? 1.0 : ratio_xy;

    // Viewport center point in logical unit
    this.__viewCP = this.__viewRect.center;

    // View data rect center which is same as viewCP
    this.__vdataCP = this.__dataRect.center;

    // current scale: view_rc/vdata_rc  (like: pixels/meter)
    this.__scale = 1.0;

    this.__setScale(this.__recalcScale()); // Set scale

    // retrieve current view pixel rect
    Object.defineProperty(this, 'viewRect', {
      get: function () {
        return this.__viewRect;
      }
    });

    // retrieve current full data rect
    Object.defineProperty(this, 'fullDataRect', {
      get: function () {
        return this.__dataRect.spawn();
      }
    });

    // retrieve current view data rect
    Object.defineProperty(this, 'viewDataRect', {
      get: function () {
        var w = this.__viewRect.width/this.__scale*0.5;
        var h = this.__viewRect.height/this.__scale*0.5;
        return new RectType(this.__vdataCP.x-w, this.__vdataCP.y-h, this.__vdataCP.x+w, this.__vdataCP.y+h);
      }
    });
  },

  __setScale : function (new_scale) {
    // Set current scale
    this.__scale = (new_scale < this.__MinScale )? this.__MinScale :
      (new_scale > this.__MaxScale? this.__MaxScale : new_scale);
  },

  __recalcScale : function () {
    // Recalc scale
    return Math.min(this.__viewRect.width / this.__dataRect.width,
                    this.__viewRect.height / this.__dataRect.height);
  },

  init : function (rcView, rcData, ratioXY) {
    this.__ratio = ratioXY;
    this.setViewRect(rcView.xmin, rcView.ymin, rcView.xmax, rcView.ymax);
    this.setDataRect(rcData.xmin, rcData.ymin, rcData.xmax, rcData.ymax);
  },

  setResolution : function (unitPerPixel) {
    this.__setScale (1.0/unitPerPixel);
  },

  panView : function (vpDX, vpDY) {
    // move view, only the center of view data center changed
    // vpDX and vpDY are offsets of vp
    this.__vdataCP.x -= (vpDX / this.__scale);
    this.__vdataCP.y += (vpDY / this.__scale);
  },

  panViewPos : function (fromX, fromY, toX, toY) {
    this.panView(toX-fromX, toY-fromY);
  },

  setViewRect : function (xmin, ymin, xmax, ymax) {
    // Set drawing view extent
    this.__viewRect = new RectType(xmin, ymin, xmax, ymax);
    this.__viewCP = this.__viewRect.center;
  },

  setDataRect : function (xmin, ymin, xmax, ymax) {
    // Set destination data extent
    this.__dataRect = new RectType(xmin, ymin, xmax, ymax);
    this.__vdataCP = this.__dataRect.center;
    this.__setScale(this.__recalcScale());
  },
  
  zoomAt : function (vpX, vpY, times/*1.0*/) {
    // zoom at given view position vp(x, y)
    var dp = this.vp2dp(vpX, vpY);
    this.zoom(times);
    var vp2 = this.dp2vp(dp.x, dp.y);
    this.panView(vpX-vp2.x, vpY-vp2.y);
  },

  zoomBox : function (vx, vy, vx2, vy2) {
    var NTIMES = 99.9999;
    // enlarge to 100 times
    var dw = ((vx-vx2)*NTIMES).toFixed(0);       // dw as sign flag
    var dh = (Math.abs(vy-vy2)*NTIMES).toFixed(0);    // always dh > 0
    this.centerAt((vx+vx2)*0.5, (vy+vy2)*0.5);
    if (dw < 0) { // zoom in
      this.__setScale(this.__scale*Math.min(-this.__viewRect.width*NTIMES/dw, this.__viewRect.height*NTIMES/dh));
    }
    else if (dw > 0) { // zoom out
      this.__setScale(this.__scale*Math.min(dw/this.__viewRect.width/NTIMES, dh/this.__viewRect.height/NTIMES));
    }
  },

  panViewData : function (dX, dY) {
    this.__vdataCP.x += dX;
    this.__vdataCP.y += dY;
  },

  centerAt : function (vpX, vpY) {
    // move viewport's center to pos
    this.__vdataCP = this.vp2dp(vpX, vpY);
  },

  zoom : function (times) { /*times = 1.0*/
    // zoom in or out view. times is scale, must be > 0
    if (__is_null(times)) {
      times=1.0;
    }
    this.__setScale(this.__scale*Math.abs(times));
  },

  zoomCenter : function (times/*1.0*/) {
    // Just like the above. the difference is it resets view data's center
    if (__is_null(times)) {
      times=1.0;
    }
    this.__setScale(this.__scale*Math.abs(times));
    this.__vdataCP = this.__dataRect.center;
  },

  zoomAll : function (times/*1.0*/) {
    // display all destination with times of given parameter
    if (__is_null(times)) {
      times=1.0;
    }
    this.__vdataCP = this.__dataRect.center;
    this.__setScale(times * this.__recalcScale());
  },

  dp2vp : function (dx, dy) {
    dx -= this.__vdataCP.x;
    dy -= this.__vdataCP.y;
    return new PointType(Math.round(this.__viewCP.x+this.__scale*dx),
                      Math.round((this.__viewCP.y-this.__scale*dy)/this.__ratio));
  },

  dp2vp_n : function (dataPtArray) {
    var np = dataPtArray.length;
    var viewPosArray = new Array(np);
    var pt;
    while(np-->0) {
      pt = dataPtArray[np];
      viewPosArray[np] = this.dp2vp(pt.x, pt.y);
    }
    return viewPosArray;
  },

  vp2dp : function (vx, vy) {
    // transform point from view to data
    return new PointType (this.__vdataCP.x + (vx-this.__viewCP.x) / this.__scale,
                         this.__vdataCP.y - (vy*this.__ratio-this.__viewCP.y) / this.__scale);
  },

  vp2dp_n : function (viewPosArray) {
    var np = viewPosArray.length;
    var dataPtArray = new Array(np);
    var  pos;
    while(np-->0) {
      pos = viewPosArray[np];
      dataPtArray[np] = this.vp2dp(pos.x, pos.y);
    }
    return dataPtArray;
  },

  vl2dl : function (view_len) {
    // view length(vl) to data length(dl)
    return view_len / this.__scale;
  },

  dl2vl : function (data_len) {
    // data length(dl) to view length(vl)
    return data_len * this.__scale;
  },

  drc2vrc : function (drc) {
    // ^         max         o------------->
    // |  --------+          |  min 
    // |  |       |          |   +--------|
    // |  |  drc  |    ==>   |   |   vrc  |
    // |  +--------          |   |        |
    // | min                 |   ---------+
    // o------------->       V           max
    var minPt = this.dp2vp(drc.xmin, drc.ymax);
    var maxPt = this.dp2vp(drc.xmax, drc.ymin);  
    return new RectType(minPt.x, minPt.y, maxPt.x, maxPt.y); // View Rect
  },

  vrc2drc : function (vrc) {
    var minPt = this.vp2dp(vrc.xmin, vrc.ymax);
    var maxPt = this.vp2dp(vrc.xmax, vrc.ymin);
    return new RectType(minPt.x, minPt.y, maxPt.x, maxPt.y); // Data Rect
  }
};

/**
 * bresenham.js
 *   implement bresenham algorithm for drawing shape
 * 2012/12/20 : Liang_Zhang@esri.com
 *
 * TODO: polygon, arc, roundrect, ...
 */
var Bresenham = function () {
};

/**
 * Bresenham's fill point
 */
Bresenham.drawPoint = function (drawContext, // Bresenham.DrawContext
  x, y,        // position of point
  size,        // size of point
  rgba)        // red = rgba[0], green = rgba[1], blue = rgba[2], alpha = rgba[3]
{
  if (size<=1) {
    drawContext.setPixel(x, y, rgba);
  }
  else {
    var u, v, w = Math.floor(size/2);
    for (u=x-w; u<x+w+1; u++) {
      for (v=y-w; v<y+w+1; v++) {
        drawContext.setPixel(u, v, rgba);
      }
    }
  }
};

/**
 * Bresenham's fill rectangle
 */
Bresenham.fillRect = function (drawContext,
  x1, y1, // point 1
  x2, y2, // point 2
  rgba) {
  var x0 = Math.min(x1, x2),
      y0 = Math.min(y1, y2),
      xm = Math.max(x1, x2),
      ym = Math.max(y1, y2);

  var x, y;
  for (x = x0; x < xm; x++) {
    for (y = y0; y < ym; y++) {
      drawContext.setPixel(x, y, rgba);
    }
  }
};

/**
 * Bresenham's draw rectangle
 */
Bresenham.strokeRect = function (drawContext,
  x1, y1,
  x2, y2,
  penWidth,
  rgba) {
  Bresenham.drawLine(drawContext, x1, y1, x1, y2, penWidth, rgba);
  Bresenham.drawLine(drawContext, x1, y2, x2, y2, penWidth, rgba);
  Bresenham.drawLine(drawContext, x2, y2, x2, y1, penWidth, rgba);
  Bresenham.drawLine(drawContext, x2, y1, x1, y1, penWidth, rgba);
};

/**
 * Bresenham's draw line algorithm
 */
Bresenham.drawLine = function (drawContext,
          x1, y1, // start point
          x2, y2, // send point
          penWidth,
          rgba) {
  x1 = Math.floor(x1+0.5);
  y1 = Math.floor(y1+0.5);
  x2 = Math.floor(x2+0.5);
  y2 = Math.floor(y2+0.5);

  var dx = Math.abs(x2 - x1),
      dy = Math.abs(y2 - y1),
      yy = 0,
      t;
  if (dx < dy) {
    yy = 1;
    t=x1; x1=y1; y1=t;
    t=x2; x2=y2; y2=t;
    t=dx; dx=dy; dy=t;
  }
  var ix = (x2 - x1) > 0 ? 1 : -1,
      iy = (y2 - y1) > 0 ? 1 : -1,
      cx = x1,
      cy = y1,
      n2dy = dy * 2,
      n2dydx = (dy - dx) * 2,
      d = dy * 2 - dx;
  if(yy==1) {
    while(cx != x2) {
      if(d < 0) {   
        d += n2dy;
      }
      else {
        cy += iy; 
        d += n2dydx;
      }
      Bresenham.drawPoint(drawContext, cy, cx, penWidth, rgba);
      cx += ix;
    }
  }
  else {   
    while(cx != x2) {    
      if(d < 0) {    
        d += n2dy;    
      }
      else {    
        cy += iy;    
        d += n2dydx;    
      }
      Bresenham.drawPoint(drawContext, cx, cy, penWidth, rgba);
      cx += ix;
    }
  }
};

/**
 * CubicBezier              _           _  _     _
 *                         |  1  0  0  0 || X0 Y0 |
 * [Xt, Yt] = [1 t t^2 t^3]| -3  3  0  0 || X1 Y1 |  t := [0, 1]
 *                         |  3 -6  3  0 || X2 Y2 |
 *                         |_-1  3 -3  1_||_X3 Y3_|
 * or:
 * P(t) = P0*(1-t)^3 + 3*P1*t*(1-t)^2 + 3*P2*t^2*(1-t) + P3*t^3;
 */
Bresenham.drawCubicBezier = function (drawContext,
          x0, y0,     // start point
          x1, y1,     // control point 1
          x2, y2,     // control point 2
          x3, y3,     // end point
          penWidth,
          rgba)       // color of pen
{
  var n = Math.abs(x3-x0) + Math.abs(y3-y0),
      d = 1.0/(n+1),
      t = d,
      x = x0,
      y = y0,
      Xt,
      Yt;

  var cubicBezier = (function(){
    return function(a, b, c, d, t) {
      return (a*(1-t)*(1-t)*(1-t) + 3*b*t*(1-t)*(1-t) + 3*c*t*t*(1-t) + d*t*t*t);
    };
  })();

  for (; t<1; t+=d) {
    Xt = cubicBezier(x0, x1, x2, x3, t);
    Yt = cubicBezier(y0, y1, y2, y3, t);
    if (Math.abs(Xt-x) + Math.abs(Yt - y) >= 1) {
      Bresenham.drawPoint(drawContext, x, y, penWidth, rgba);
      x = Xt;
      y = Yt;
    }
  }
  Bresenham.drawPoint(drawContext, x3, y3, penWidth, rgba);
};

/**
 * Bresenham's draw circle
 */
Bresenham.fillCircle = function (drawContext,
  centerX, centerY, radius, rgba) {
  var x = 0,
      y = radius,
      yi,
      d = 3 - 2 * radius;

  while (x <= y) {
    for (yi = x; yi <= y; yi ++) {
      drawContext._set_circle_8(centerX, centerY, x, yi, rgba);
    }
    if (d < 0) {
      d = d + 4 * x + 6;
    }
    else {
      d = d + 4 * (x - y);
      y--;
    }
    x++;
  }
};

Bresenham.strokeCircle = function (drawContext,
  centerX, centerY, radius, penWidth, rgba) {
  var x = 0,
      y = radius,
      d = 3 - 2 * radius;

  while (x <= y) {
    drawContext._set_circle_8_w(centerX, centerY, x, y, rgba, penWidth);
    if (d < 0) {
      d = d + 4 * x + 6;
    }
    else {
      d = d + 4 * (x - y);
      y--;
    }
    x++;
  }
};

/**
 * Bresenham.DrawContext
 *   draw pixel directly onto pixel array
 */
Bresenham.DrawContext = function (pixelArray, width, height, hasAlpha) {
  this._init(pixelArray, width, height);
};

Bresenham.DrawContext.prototype = {
  _init : function (pixelArray, width, height, hasAlpha) {
    this._pa = pixelArray;
    this._cx = width;
    this._cy = height;
    this._alpha = ((hasAlpha===null||hasAlpha===undefined)? false : hasAlpha);
  },

  _setRGB : function (x, y, r, g, b) {
    if (x>=0 && x<this._cx && y>=0 && y<this._cy) {
      y = (y*this._cx+x) * 4;
      this._pa[y] = r;
      this._pa[y+1] = g;
      this._pa[y+2] = b;
    }
  },

  _setRGBA : function (x, y, r, g, b, a) {
    if (x>=0 && x<this._cx && y>=0 && y<this._cy) {
      y = (y*this._cx+x) * 4;
      this._pa[y] = r;
      this._pa[y+1] = g;
      this._pa[y+2] = b;
      this._pa[y+3] = a;
    }
  },

  _get : function (x, y) {
    var rgba = [];
    if (x>=0 && x<this._cx && y>=0 && y<this._cy) {
      y = (y*this._cx+x) * 4;
      rgba.push(this._pa[y]);
      rgba.push(this._pa[y+1]);
      rgba.push(this._pa[y+2]);
      if (this._alpha) {
        rgba.push(this._pa[y+3]);
      }
      return rgba;
    }
    return null;
  },

  _set_circle_8 : function (xc, yc, x, y, rgba) {
    this.setPixel(xc+x, yc+y, rgba);
    this.setPixel(xc-x, yc+y, rgba);
    this.setPixel(xc+x, yc-y, rgba);
    this.setPixel(xc-x, yc-y, rgba);
    this.setPixel(xc+y, yc+x, rgba);
    this.setPixel(xc-y, yc+x, rgba);
    this.setPixel(xc+y, yc-x, rgba);
    this.setPixel(xc-y, yc-x, rgba);
  },

  _set_circle_8_w : function (xc, yc, x, y, rgba, penWidth) {
    var w = Math.floor(penWidth/2);
    if (w<1) {
      return this._set_circle_8(xc, yc, x, y, rgba);
    }
    else {
      var u, v;
      for (u=xc-w; u<xc+w+1; u++) {
        for (v=yc-w; v<yc+w+1; v++) {
          this._set_circle_8(u, v, x, y, rgba);
        }
      }
    }
  },

  getPixel : function (x, y) {
    x = Math.floor(x+0.5);
    y = Math.floor(x+0.5);
    return this._get(x, y);
  },

  setPixel : function (x, y, rgba) {
    x = Math.floor(x+0.5);
    y = Math.floor(y+0.5);
    if (this._alpha) {
      this._setRGBA(x, y, rgba[0], rgba[1], rgba[2], rgba[3]);
    }
    else {
      this._setRGB(x, y, rgba[0], rgba[1], rgba[2]);
    }
  }
};

/**
 * DrawInfo class
 *   drawing shape only used internally
 */
var DrawInfo = function (canvas, context, viewport) {
  this.__init(canvas, context, viewport);
};

DrawInfo.prototype = {
  __init : function (canvas, context, viewport) {
    // foreground canvas
    this.canvas   = canvas;
    this.context  = context;
    this.viewport = viewport;

    this.clipView = new RectType(0, 0, this.canvas.width, this.canvas.height); // viewed pixel rect
    this.clipData = this.viewport.viewDataRect;  // viewed data rect

    // public properties:
    //
    this.layerIndex = null;
    this.shapeIndex = null;
    this.symbolShapeIndex = null;

    // all valid renders in drawing stack, used only internally
    this.__renders = [];

    // current render for drawing, used only internally
    this.__current = null;
    this.__selectable = false;

    // background canvas for hit test
    this.__backend  = null;
    this.__backendContext = null;
    this.__backendImage = null;
    this.__backendData = null;
  },

  fillEnabled : function () {
    return (__not_null(this.__current) && this.__current.validateProp(this.__current.fillStyle));
  },

  strokeEnabled : function () {
    return (__not_null(this.__current) && this.__current.validateProp(this.__current.strokeStyle));
  },

  linearGradientEnabled : function (style) {
    if (__is_null(this.__current) || __is_null(this.__current.linearGradient)) {
      return false;
    }
    if (!this.__current.linearGradient.isValid()) {
      return false;
    }
    if (__is_null(style)) {
      return true;
    }
    return (this.__current.linearGradient.style===2 || this.__current.linearGradient.style===style);
  },

  getRGBA : function () {
    var rgba = [this.layerIndex+1, this.shapeIndex+1, (__is_null(this.symbolShapeIndex)? 0: this.symbolShapeIndex+1), 0];
    return rgba;
  },

  __validRender : function (render) {
    return (__not_null(this.context) && __not_null(render) && render.enabled);
  },

  saveBackend : function (backendCanvas, backendCanvasContext) {
    this.__backend = backendCanvas;
    this.__backendContext = backendCanvasContext;
    this.__backendImage = this.__backendContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.__backendData = this.__backendImage.data;
    this.__bresenhamDC = new Bresenham.DrawContext(this.__backendData, this.canvas.width, this.canvas.height, false);
  },

  restoreBackend : function () {
    this.__backendContext.putImageData(this.__backendImage, 0, 0);
    this.__backendImage = null;
    this.__backendData = null;
  },

  setDrawContext : function (canvas, context) {
    this.canvas = canvas;
    this.context = context;
  },

  getTextAttrName : function () {
    if (__not_null(this.__current) && this.__current.validateProp(this.__current.textAttrName)) {
      return this.__current.textAttrName;
    }
    else {
      return null;
    }
  },

  saveRender : function (render) {
    if (this.__validRender(render)) {
      if (this.__current !== render) {
        // ensure not saving repeated render
        this.__current = render;
        this.__renders.push(this.__current); // add after the end
        this.context.save();
        this.__current.setContext(this.context);
        return true;
      }
    }
    return false;
  },

  restoreRender : function (render, saved) {
    if (saved) {
      this._saved = false;
      var last = this.__renders.pop(); // remove the last
      if (this.__current===last) {
        var len = this.__renders.length;
        this.__current = (len===0? null : this.__renders[len-1]);
        this.context.restore();
      }
      else {
        throw ("DrawInfo.restore: illegal usage of this object");
      }
    }
  },

  toViewPos : function (p, symbolAtPt, symbolUnit) {
    if (__is_null(symbolAtPt)) {
      return this.viewport.dp2vp(p.x, p.y);
    }
    if (__is_null(symbolUnit) || !symbolUnit.pixelUnit) {
      // data unit to view unit
      return this.viewport.dp2vp(p.x+symbolAtPt.x, p.y+symbolAtPt.y);
    }
    // symbol unit is pixel unit
    var vp = this.viewport.dp2vp(symbolAtPt.x, symbolAtPt.y);
    vp.offset(p.x-symbolUnit.baseX, p.y-symbolUnit.baseY);
    return vp;
  },

  toViewLength : function (len, symbolUnit) {
    return (__is_null(symbolUnit) || !symbolUnit.pixelUnit)? this.viewport.dl2vl(len) : len;
  },

  beginShape : function (selectable) {
    this.__selectable = (__not_null(this.__backendData) && selectable===true);
    this.context.beginPath();
  },

  endShape : function () {
    if (this.fillEnabled()) {
      this.context.fill();
    }
    if (this.strokeEnabled()) {
      this.context.stroke();
    }
  },

  drawRoundRect : function (rc, R1, R2, R3, R4) {
    this.context.beginPath();
    this.context.moveTo(rc.xmin+R1, rc.ymin);
    this.context.lineTo(rc.xmax-R2, rc.ymin);
    if (R2>0) {
      this.context.arc(rc.xmax-R2, rc.ymin+R2, R2, Math.PI*1.5, Math.PI*2, false);
    }
    this.context.lineTo(rc.xmax, rc.ymax-R3);
    if (R3>0) {
      this.context.arc(rc.xmax-R3, rc.ymax-R3, R3, 0, Math.PI/2, false);
    }
    this.context.lineTo(rc.xmin+R4, rc.ymax);
    if (R4>0) {
      this.context.arc(rc.xmin+R4, rc.ymax-R4, R4, Math.PI/2, Math.PI, false);
    }
    this.context.lineTo(rc.xmin, rc.ymin+R1);
    if (R1>0) {
      this.context.arc(rc.xmin+R1, rc.ymin+R1, R1, Math.PI, Math.PI*1.5, false);
    }
    this.context.closePath();

    var oldStyle,
        gr = (this.linearGradientEnabled()? this.__current.linearGradient.createDrawStyle(this.context, rc): null);

    if (__not_null(gr) && this.__current.linearGradient.fillEnabled()) {
      // fill by linearGradient
      oldStyle = this.context.fillStyle;
      this.context.fillStyle = gr;
      this.context.fill();       
      this.context.fillStyle = oldStyle;
    }
    else if (this.fillEnabled()) {
      // fill by color
      this.context.fill();
    }

    if (__not_null(gr) && this.__current.linearGradient.strokeEnabled()) {
      // stroke by linearGradient
      oldStyle = this.context.strokeStyle;
      this.context.strokeStyle = gr;
      this.context.stroke();       
      this.context.strokeStyle = oldStyle;
    }
    else if (this.strokeEnabled()) {
      // stroke by color
      this.context.stroke();
    }

    //?? if (__not_null(this.__current.fillImage)) {
    //??   this.context.drawImage(this.__current.fillImage, rc.xmin, rc.ymin, rc.width, rc.height);
    //?? }

    if (this.__selectable) {
      var rgba = this.getRGBA();
      if (this.fillEnabled() || this.linearGradientEnabled(0) || __not_null(this.__current.fillImage)) {
        //TODO?? fillRoundRect
        Bresenham.fillRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, rgba);
      }
      if (this.strokeEnabled() || this.linearGradientEnabled(1)) {
        //TODO?? strokeRoundRect
        Bresenham.strokeRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, this.context.lineWidth, rgba);
      }
    }
  },

  drawCircle : function (centerX, centerY, radius) {
    this.context.arc(centerX, centerY, radius, 0, Math.PI*2, true);

    if (this.__selectable) {
      var rgba = this.getRGBA();
      if (this.fillEnabled()) {
        Bresenham.fillCircle(this.__bresenhamDC, centerX, centerY, radius, rgba);
      }
      if (this.strokeEnabled()) {
        Bresenham.strokeCircle(this.__bresenhamDC, centerX, centerY, radius, this.context.lineWidth, rgba);
      }
    }
  },

  drawBezier : function (start, end, cp1, cp2) {
    this.context.moveTo(start.x, start.y);
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    if (this.__selectable) {
      Bresenham.drawCubicBezier(this.__bresenhamDC,
        start.x, start.y, cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y,
        this.context.lineWidth+2, this.getRGBA());
    }
  },

  drawRect : function (rc, text) {
    var oldStyle,
        gr = (this.linearGradientEnabled()? this.__current.linearGradient.createDrawStyle(this.context, rc): null);

    if (__not_null(gr) && this.__current.linearGradient.fillEnabled()) {
      // fill by linearGradient
      oldStyle = this.context.fillStyle;
      this.context.fillStyle = gr;
      this.context.fill();       
      this.context.fillStyle = oldStyle;
    }
    else if (this.fillEnabled()) {
      // fill by color
      this.context.fillRect(rc.xmin, rc.ymin, rc.width, rc.height);
    }

    if (__not_null(gr) && this.__current.linearGradient.strokeEnabled()) {
      // stroke by linearGradient
      oldStyle = this.context.strokeStyle;
      this.context.strokeStyle = gr;
      this.context.stroke();       
      this.context.strokeStyle = oldStyle;
    }
    else if (this.strokeEnabled()) {
      // stroke by color
      this.context.strokeRect(rc.xmin, rc.ymin, rc.width, rc.height);
    }

    // draw rect image of render
    if (__not_null(this.__current.fillImage)) {
      this.context.drawImage(this.__current.fillImage, rc.xmin, rc.ymin, rc.width, rc.height);
    }

    // draw rect text
    if (__not_empty(text)) {
      this.drawText(text, rc);
    }

    if (this.__selectable) {
      var rgba = this.getRGBA();
      if (this.fillEnabled() || this.linearGradientEnabled(0) || __not_null(this.__current.fillImage)) {
        Bresenham.fillRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, rgba);
      }
      if (this.strokeEnabled() || this.linearGradientEnabled(1)) {
        Bresenham.strokeRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, this.context.lineWidth, rgba);
      }
    }
  },

  drawText : function (text, rect) {
    var textWidth = this.context.measureText(text).width;
    while (textWidth > rect.width && text.length>3) {
      text = text.slice(0, text.length-3);
      text += "..";
      textWidth = this.context.measureText(text).width;
    }

    var savedStyle = this.context.fillStyle;
    
    this.context.fillStyle = this.__current.textStyle;

    if (this.context.textAlign==="left") {
      this.context.fillText(text, rect.xmin, rect.ymin);
    }
    else if (this.context.textAlign==="right") {
      this.context.fillText(text, rect.xmax, rect.ymin);
    }
    else {
      this.context.fillText(text, (rect.xmin+rect.xmax)/2, rect.ymin);
    }

    this.context.fillStyle = savedStyle;
  }
};

/**
 * interfaces for map:
 */
window.esri2.Common = {};
window.esri2.Common.ImageLoader = ImageLoader;
window.esri2.Common.PairArray = PairArray;
window.esri2.Common.RectType = RectType;
window.esri2.Common.PointType = PointType;
window.esri2.Map = MapCanvas;
window.esri2.Map.Layer = MapLayer;
window.esri2.Map.Shape = MapShape;
window.esri2.Map.Point = MapPoint;
window.esri2.Map.Render = MapRender;
window.esri2.Map.Bound = MapBound;
window.esri2.Map.Symbol = MapSymbol;
}(window));

