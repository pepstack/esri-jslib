/**
 * AgisMapSrv
 */
function AgisMapSrv (url, data) {
  this.url = url;
  this.data = data;

  this.toString = function () {
    return "AgisMapService";
  };

  this.__maxCachedTiles = 256;
  this.__cachedTiles = new esri2.Common.PairArray();

  // should get from spatialReference: wkid
  this.__earthRadius = 6370984.25867762; // meter
  this.__inchFactor = 247.36950028266;    // 2*PI*100/2.54 in.
}

/**
 * MapCtl class:
 *   do not using any deps
 */
function MapCtl (canvasID, divContainerID) {
  var self = this;
  var
    __canvasID = canvasID,
    __containerID = divContainerID,
    __needResize = false,
    __mapCanvas = null,
    __divContainer = null,
    __browser = null,
    __offsetX = 0,
    __offsetY = 0,
    __pos_x_id = "_pos_x",
    __pos_y_id = "_pos_y",
    __pos_x = null,
    __pos_y = null,
    __map_x_id = "_map_x",
    __map_y_id = "_map_y",  
    __map_x = null,
    __map_y = null,
    __beforeLoad = null,
    __beforeLoadParam = null,
    __afterLoad = null,
    __afterLoadParam = null
  ;
  function __init() {
    __divContainer = __get_elem(__containerID);
    __browser = __get_browser();
    if (__browser.firefox||__browser.chrome){
      if (__divContainer.style.position !== "absolute"){
        __needResize = true;
      }
    }
    __pos_x = __get_elem(__pos_x_id);
    __pos_y = __get_elem(__pos_y_id);
    __map_x = __get_elem(__map_x_id);
    __map_y = __get_elem(__map_y_id);
    // create map canvas
    __mapCanvas = new esri2.Map(__canvasID);
    __mapCanvas.bkgndColor = "#fff";
    __mapCanvas.resizeMap(__divContainer.offsetWidth, __divContainer.offsetHeight);
  }
  function __getMousePosX(e) {
    if (__browser.firefox && e.layerX) {
      return e.layerX - __offsetX;
    }
    else {
      return e.offsetX; //-__offsetX;
    }
  }
  function __getMousePosY(e) {
    if (__browser.firefox && e.layerY) {
      return e.layerY - __offsetY;
    }
    else {
      return e.offsetY; //-__offsetY;
    }
  }
  function __outputMousePos(e) {
    if (__mapCanvas){
      if (__pos_x && __pos_y){
        __pos_x.value = e._x;
        __pos_y.value = e._y;
      }
      if (__map_x && __map_y){
        var pt = __mapCanvas.toMapPoint(e._x, e._y);
        __map_x.value = pt.x;
        __map_y.value = pt.y;
      }
    }
  }
  this.getMousePos = function (e) {
    // Get the mouse position relative to the canvas element
    if (__needResize) {
      __offsetX = __divContainer.offsetLeft;
      __offsetY = __divContainer.offsetTop;
    }
    e._x = __getMousePosX(e);
    e._y = __getMousePosY(e);
  };
  this.setMousePosSink = function (_pos_x, _pos_y, _map_x, _map_y) {
    __pos_x_id = _pos_x;
    __pos_y_id = _pos_y;
    __map_x_id = _map_x;
    __map_y_id = _map_y;
  };
  this.setOnBeforeLoad = function (func, param) {
    __beforeLoadParam = param;
    __beforeLoad = func;
  };
  this.setOnAfterLoad = function (func, param) {
    __afterLoad = func;
    __afterLoadParam = param;
  };
  // getMapCanvas
  this.getMapCanvas = function () {
    return __mapCanvas;  
  };
  //@onLoad
  __add_event(window, 'load', function(){
    if (__not_null(__beforeLoad)) {
      __beforeLoad(__beforeLoadParam);
    }
    // do initialization
    self.onInit();

    if (__not_null(__afterLoad)) {
      __afterLoad(__afterLoadParam);
    }
  });

  this.imagesLib = null;

  // Add your codes below this line:
  //
  var
    __url = null,
    __idLevel = 0,
    __maxCachedTiles = 256,
    __cachedTiles = new esri2.Common.PairArray(),

    // should get from spatialReference: wkid
    __earthRadius = 6370984.25867762, // meter
    __inchFactor = 247.36950028266    // 2*PI*100/2.54 in.
  ;

  this.posInCanvas = function (vx, vy) {
    return (vx>0 && vx < __mapCanvas.width) && (vy>0 && vy < __mapCanvas.height);
  };

  // FireFox
  this.onMouseWheel = function (e) {
    this.getMousePos(e);
    var vx = e._x, vy = e._y;
    __log(vx, vy);
    if (this.posInCanvas(vx, vy)) {
      e.preventDefault();
      e.stopPropagation();
      if (__is_null(__mapCanvas.getAttribute("totalLevels"))) {
        return;
      }
      if (e.detail === -3) { // zoomIn
        __idLevel = self.zoomLevel(++__idLevel, vx, vy);
      }
      else if (e.detail === 3) { // zoomOut
        __idLevel = self.zoomLevel(--__idLevel, vx, vy);          
      }
    }
  };

  this.onInit = function () {
    __init();

    __mapCanvas.onMouseClick = 
      function (e, mapCanvas) {
        self.getMousePos(e);
        
      };

    __mapCanvas.onMouseDblClick =
      function (e, mapCanvas) {
        self.getMousePos(e);
        // assign a empty implementation function to onMouseDblClick
        // indicates we want to use the default processing of MapCanvas
      };

    __mapCanvas.onMouseDown = 
      function (e, mapCanvas) {
        self.getMousePos(e);

        mapCanvas.setCursor("move", e);
        mapCanvas.addAttribute("_pan_map", false);
        mapCanvas.addAttribute("_lbtn_down", true);          
        mapCanvas.addAttribute("_pos_x", e._x);
        mapCanvas.addAttribute("_pos_y", e._y);          
        if (__is_null(mapCanvas.fastHitTest(e._x, e._y, e))) {
          // hit nothing, begin panning canvas 
          mapCanvas.addAttribute("_pan_map", true);
          mapCanvas.addAttribute("_pan_shape", null);
        }
      };

    __mapCanvas.onMouseUp = 
      function (e, mapCanvas) {
        self.getMousePos(e);
        mapCanvas.addAttribute("_lbtn_down", false);
        mapCanvas.setCursor("default");

        var currShape = mapCanvas.addAttribute("_pan_shape", null);
        if (__not_null(currShape)) {
          var layer = mapCanvas.addAttribute("_pan_shape_layer", null);
          mapCanvas.trackingLayer.removeAt(currShape);
          layer.addShape(currShape);
          layer.updateBound();
          mapCanvas.refresh(true, currShape);
        }
        else if (mapCanvas.getAttribute("_pan_map")) {
          mapCanvas.addAttribute("_pan_map", false);
          var x1 = mapCanvas.getAttribute("_pos_x");
          var y1 = mapCanvas.getAttribute("_pos_y");
          mapCanvas.panView(x1, y1, e._x, e._y);
          var lvl = mapCanvas.getAttribute("level:"+__idLevel);
          if (__not_null(lvl)) {
            __fetchLevelTiles(lvl);
          }
          //mapCanvas.refresh(true);
        }
      };

    __mapCanvas.onMouseMove = 
      function (e, mapCanvas) {
        self.getMousePos(e);
        __outputMousePos(e);

        var x1, y1;
        var currShape = mapCanvas.getAttribute("_pan_shape");
        if (__not_null(currShape)) {
          x1 = mapCanvas.getAttribute("_pos_x");
          y1 = mapCanvas.getAttribute("_pos_y");
          mapCanvas.addAttribute("_pos_x", e._x);
          mapCanvas.addAttribute("_pos_y", e._y);
          var pt1 = mapCanvas.toMapPoint(x1, y1);
          var pt2 = mapCanvas.toMapPoint(e._x, e._y);
          currShape.offset(pt2.x-pt1.x, pt2.y-pt1.y);
          mapCanvas.trackingLayer.updateBound();
          mapCanvas.refreshTrackingLayer(currShape);
        }
        else if (mapCanvas.getAttribute("_pan_map")) {
          self.opState = "";
          x1 = mapCanvas.getAttribute("_pos_x");
          y1 = mapCanvas.getAttribute("_pos_y");
          mapCanvas.addAttribute("_pos_x", e._x);
          mapCanvas.addAttribute("_pos_y", e._y);
          mapCanvas.panView(x1, y1, e._x, e._y);
          mapCanvas.refresh(false);
        }
        else {
          if (__is_null(mapCanvas.fastHitTest(e._x, e._y, e))) {
            mapCanvas.setCursor("default");
          }
        }
      };

    __mapCanvas.onMouseWheel = 
      function (e, mapCanvas) {
        e.preventDefault();
        e.stopPropagation();
        if (__is_null(mapCanvas.getAttribute("totalLevels"))) {
          return;
        }
        self.getMousePos(e);
        __log(e.type);
        if (e.wheelDelta > 0) {
          // zoomIn
          __idLevel = self.zoomLevel(++__idLevel, e._x, e._y);
        }
        else if (e.wheelDelta < 0) {
          // zoomOut
          __idLevel = self.zoomLevel(--__idLevel, e._x, e._y);          
        }
      };
  };

  // init arcgisonline map
  this.addMapService = function (mapSrv) {
    __url = mapSrv.url;
    var data = mapSrv.data;

    var tileInfo = data.tileInfo; // data['tileInfo'];
    var tileSizeX = tileInfo.rows; // tileInfo['rows']; // vertical pixels of tile
    var tileSizeY = tileInfo.cols; // tileInfo['cols']; // horizontal pixels of tile
    var dpi = tileInfo.dpi; // tileInfo['dpi'];
    var originX = tileInfo.origin.x; // tileInfo['origin']['x'];
    var originY = tileInfo.origin.y; // tileInfo['origin']['y'];
    var lods = tileInfo.lods; // tileInfo['lods'];
    var fullExtent = data.fullExtent; // data['fullExtent'];
    var spRef_wkid = fullExtent.spatialReference.wkid; // fullExtent['spatialReference']['wkid'];
    var fullWidthIn = __earthRadius * __inchFactor;
    var fullHeightIn = __earthRadius * __inchFactor*0.5;

    __mapCanvas.addAttribute('spatialReference', spRef_wkid);
    __mapCanvas.addAttribute('earthRadius', __earthRadius);
    __mapCanvas.addAttribute('fullExtent', fullExtent);
    __mapCanvas.addAttribute('fullWidthIn', fullWidthIn);
    __mapCanvas.addAttribute('fullHeightIn', fullHeightIn);
    __mapCanvas.addAttribute('tileSizeX', tileSizeX);
    __mapCanvas.addAttribute('tileSizeY', tileSizeY);
    __mapCanvas.addAttribute('totalLevels', lods.length);

    var idLevel=0, lvl, lvlInfo, numTilesX, numTilesY, layer;
    for (lvl in lods) {
      lvlInfo = lods[lvl];
      numTilesX = Number(fullWidthIn/lvlInfo.scale*dpi/tileSizeY+0.1).toFixed(0); // horizontal tiles number      
      numTilesY = Number(fullHeightIn/lvlInfo.scale*dpi/tileSizeX+0.1).toFixed(0); // vertical tiles number

      // add layers
      layer = __mapCanvas.addLayer("level:"+idLevel, "tiles: ", numTilesX, numTilesY);
      layer.addAttribute("numTilesX", numTilesX);
      layer.addAttribute("numTilesY", numTilesY);

      //layer.addAttribute("resolution", lvlInfo.resolution); // degree per pixel
      // var degPerPixelX = (fullExtent.xmax-fullExtent.xmin)/(numTilesX*tileSizeX);
      // var degPerPixelY = (fullExtent.ymax-fullExtent.ymin)/(numTilesY*tileSizeY);
      // degPerPixelX==degPerPixelY==lvlInfo.resolution
      //__log(lvlInfo.resolution);
      //__log("add layer: ", layer.name, "tiles: ", layer.getAttribute("numTilesX"), layer.getAttribute("numTilesY"));

      lvlInfo.layer = layer;
      __mapCanvas.addAttribute("level:"+idLevel, lvlInfo);
      idLevel++;
    }

    __mapCanvas.updateBound(fullExtent);
    __mapCanvas.zoomAll();

    var rect = __mapCanvas.dataBound.rect;
    var pt = rect.center;
    __mapCanvas.centerAt(pt.x, pt.y);
    var pos = __mapCanvas.toViewPos(pt.x, pt.y);

    __idLevel = self.zoomLevel(0, pos.x, pos.y);
  };

  // tile:
  //  +------------> x
  //  | 0,0 | 0,1
  //  |-----+-----
  //  | 1,0 | 1,1
  //y v
  function __calcTilesRect (rcFullData, rcViewData, tileUnitX, tileUnitY, numTilesX, numTilesY) {
    var tileX1 = Math.floor((rcViewData.xmin-rcFullData.xmin)/tileUnitX)-1;
    var tileX2 = Math.ceil((rcViewData.xmax-rcFullData.xmin)/tileUnitX)+1;
    var tileY1 = Math.floor((rcFullData.ymax-rcViewData.ymax)/tileUnitY)-1;
    var tileY2 = Math.ceil((rcFullData.ymax-rcViewData.ymin)/tileUnitY)+1;

    if (tileX1<0) {
      tileX1 = 0;
    }
    if (tileY1<0) {
      tileY1 = 0;
    }
    if (tileX2>numTilesX) {
      tileX2 = numTilesX;
    }
    if (tileY2>numTilesY) {
      tileY2 = numTilesY;
    }
    return new esri2.Common.RectType(tileX1, tileY1, tileX2, tileY2);
  }
  
  function __getTileRect (rcFullData, tileUnitX, tileUnitY, x, y) {
    return new esri2.Common.RectType(
            rcFullData.xmin+x*tileUnitX,      // xmin
            rcFullData.ymax-(y+1)*tileUnitY,  // ymin
            rcFullData.xmin+(x+1)*tileUnitX,  // xmax
            rcFullData.ymax-y*tileUnitY);     // ymax
  }

  function __removeUnusedTiles (layer, trc) {
    if (__cachedTiles.size() < __maxCachedTiles) {
      return;
    }
    var num = __cachedTiles.size();
    var tileName, tileRect;
    while (num-- > 0) {
      tileName = __cachedTiles.getKey(num);
      tileRect = __cachedTiles.getVal(num);
      if (tileRect.parent !== layer) {
        // drop the shape not belongs to current layer
        //__log("remove a tile on other layer: ", tileRect.parent.name);
        __cachedTiles.erase(tileName);
        tileRect.parent.removeAt(tileRect);
        if (__cachedTiles.size() < __maxCachedTiles) {
          return;
        }
      }
    }
    if (__cachedTiles.size() < __maxCachedTiles) {
      return;
    }
    //tileRC
    num = 0;

    var x, y, p1, p2;
    while (__cachedTiles.size() >= __maxCachedTiles) {
      if (num++ === __maxCachedTiles) {
        console.assert(false && "should never run to this");
        return;
      }

      tileName = __cachedTiles.getKey(0); // "/tile/1/2/3"
      tileRect = __cachedTiles.getVal(0);
      console.assert(tileRect.parent===layer);
      
      // get row and col from tileName: /tile/row/col
      p1 = tileName.indexOf("/", 6)+1;
      p2 = tileName.indexOf("/", p1);
      x = tileName.substring(p1, p2);
      y = tileName.substr(p2+1);
      if (x < trc.xmin || x >= trc.xmax || y < trc.ymin || y >= trc.ymax) {
        //__log("remove tile on current layer: ", layer.name, tileName);
        __cachedTiles.erase(tileName);
        tileRect.parent.removeAt(tileRect);
        if (__cachedTiles.size() < __maxCachedTiles) {
          return;
        }
      }          
    }
  }

  function __addCachedTile (layer, imgState) {
    var id = __cachedTiles.find(imgState.name);
    var rectShape;
    if (id === ERRINDEX) {
      rectShape = layer.addShape();
      var imgRect = imgState.param;
      rectShape.createRectXY(imgRect.xmin, imgRect.ymin, imgRect.xmax, imgRect.ymax);
      rectShape.image = imgState.image;
      __cachedTiles.insert(imgState.name, rectShape);
      layer.updateBound();
    }
    else {
      // title shape already exists
      rectShape = __cachedTiles.getVal(id);
      if (layer.findShape(rectShape)===-1) {
        layer.addShape(rectShape);
        layer.updateBound();
      }
    }
  }

  function __fetchLevelTiles (lvl) {
    // find viewed tiles by viewDataBound and load them
    var tilePixelsX = __mapCanvas.getAttribute("tileSizeX");
    var tilePixelsY = __mapCanvas.getAttribute("tileSizeY");
    var tileUnitX = tilePixelsX * lvl.resolution;
    var tileUnitY = tilePixelsY * lvl.resolution;

    var rcFullData = __mapCanvas.getDataBound();
    var rcViewData = __mapCanvas.getViewDataBound();
    var trc = __calcTilesRect(rcFullData, rcViewData, tileUnitX, tileUnitY,
                lvl.layer.getAttribute("numTilesX"), lvl.layer.getAttribute("numTilesY"));

    if (trc.valid) {
      var imageLib = new esri2.Common.ImageLoader(
        function (imgState) {
          var mapCanvas = imgState.loader.param;
          var imageRect = imgState.param;
          //__log("image loaded: ", imgState.name, imageRect.toXml(4));

          __removeUnusedTiles(lvl.layer, trc);
          __addCachedTile(lvl.layer, imgState);
          mapCanvas.refresh(false, imageRect);

          if (imgState.loader.allReady()) {
            //__log("all images loaded");
          }
        },
        __mapCanvas
      ); // -- imageLib --

      var x, y, name;
      for (x=trc.xmin; x<trc.xmax; x++) {
        for (y=trc.ymin; y<trc.ymax; y++) {
          name = "/tile/"+lvl.level+"/"+y+"/"+x;
          //__log("url: ", __url+name);
          var tileImageRect = __getTileRect(rcFullData, tileUnitX, tileUnitY, x, y);
          var id = __cachedTiles.find(name);
          if (id === ERRINDEX) {
            //__log("========addImage: ", name);
            imageLib.addImage(name, __url+name, tileImageRect);
          }
          else {
            //__log(name, " image has already existed");
            __mapCanvas.refresh(false, tileImageRect);
          }
        }
      }
      imageLib.loadAll();
    }
  }

  this.zoomLevel = function (idLevel, vx, vy) {
    if (idLevel<0) {
      return 0;
    }
    var totalLevels = __mapCanvas.getAttribute("totalLevels");
    if (idLevel>=totalLevels) {
      return totalLevels-1;
    }
    var id, lvl;
    for (id=0; id<totalLevels; id++) {
      lvl = __mapCanvas.getAttribute("level:"+id);
      lvl.layer.visible = (id === idLevel);
    }
    lvl = __mapCanvas.getAttribute("level:"+idLevel);

    var pt0 = __mapCanvas.toMapPoint(vx, vy);

    __mapCanvas.zoomResolution(lvl.resolution);

    var vp1 = __mapCanvas.toViewPos(pt0.x, pt0.y);
    
    __mapCanvas.panView(vp1.x, vp1.y, vx, vy);

    // find viewed tiles by viewDataBound and load them
    __fetchLevelTiles(lvl);

    // __mapCanvas.refresh(false);
    return idLevel;
  };
}
