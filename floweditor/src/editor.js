
/**
 * GeoFlowEditor class
 */
var GeoFlowEditor = function (canvasID, divContainerID, showNodeDlgFunc) {
  // Enable ECMAScript "strict" operation for this function. See more:
  //   http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
  "use strict";

  var
    self = this,
    __canvasID = canvasID,
    __containerID = divContainerID,
    __needResize = false,
    __mapCanvas = null,
    __divContainer = null,
    __offsetX = 0,
    __offsetY = 0,
    __pos_x_id = "@pos_x",
    __pos_y_id = "@pos_y",
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

  this._imgPath = __get_script_path("/script/") + "img/";
  this.flowChart = new esri2.GeoFlow(this);
  this.showNodeDlg = showNodeDlgFunc;
  this.nodeState = new esri2.GeoFlow.Node.EditState(null);
  this.readOnly = false;

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
  this.getMapCanvas = function () {
    return __mapCanvas;
  };

  //@onLoad
  __add_event(window, 'load', function(){
    if (__not_null(__beforeLoad)) {
      __beforeLoad(__beforeLoadParam);
    }

    // do initialization
    self.onLoad();
  });

  this.onLoad = function () {
    __divContainer = __get_elem(__containerID);
    if (__browser.firefox || __browser.chrome){
      if (__divContainer.style.position != "absolute"){
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

    // pre-load all images
    var imagesLib = new esri2.Common.ImageLoader(
      function (imgState){
        if (imgState.loader.allReady()){
          __log("all images loaded successfully");
          __createFlowChart(__mapCanvas, imagesLib);

          if (__not_null(__afterLoad)) {
            __log("GeoFlowEditor: __afterLoad");
            __afterLoad(__afterLoadParam);
          }
        }
      },
      null
    );

    var NodeTypes = esri2.GeoFlow.NodeTypes;

    // load icons
    //
    var imgPath = this._imgPath;

    imagesLib.addImage("esri_logo", imgPath + "esri_logo.png");
    imagesLib.addImage("status_legend", imgPath + "status_legend.png");

    imagesLib.addImage(NodeTypes.BkgndGrid, imgPath+NodeTypes.BkgndGrid+".png");
    imagesLib.addImage(NodeTypes.BkgndGrid+"_", imgPath+NodeTypes.BkgndGrid+"_.png");

    imagesLib.addImage(NodeTypes.LinkCutter, imgPath+NodeTypes.LinkCutter+".png");

    imagesLib.addImage(NodeTypes.NodeEditName, imgPath+NodeTypes.NodeEditName+".png");
    imagesLib.addImage(NodeTypes.NodeEditName+"_", imgPath+NodeTypes.NodeEditName+"_.png");

    imagesLib.addImage(NodeTypes.NodeDropName, imgPath+NodeTypes.NodeDropName+".png");
    imagesLib.addImage(NodeTypes.NodeDropName+"_", imgPath+NodeTypes.NodeDropName+"_.png");

    // load node icons
    //
    imgPath = this._imgPath + "node/";
    imagesLib.addImage(NodeTypes.NodeAssignment, imgPath+NodeTypes.NodeAssignment+".png");
    imagesLib.addImage(NodeTypes.NodeAssignment+"_", imgPath+NodeTypes.NodeAssignment+"_.png");

    imagesLib.addImage(NodeTypes.NodeDispatch, imgPath+NodeTypes.NodeDispatch+".png");
    imagesLib.addImage(NodeTypes.NodeDispatch+"_", imgPath+NodeTypes.NodeDispatch+"_.png");
    
    imagesLib.addImage(NodeTypes.NodeGeometry, imgPath+NodeTypes.NodeGeometry+".png");
    imagesLib.addImage(NodeTypes.NodeGeometry+"_", imgPath+NodeTypes.NodeGeometry+"_.png");

    imagesLib.addImage(NodeTypes.NodeGpAsync, imgPath+NodeTypes.NodeGpAsync+".png");
    imagesLib.addImage(NodeTypes.NodeGpAsync+"_", imgPath+NodeTypes.NodeGpAsync+"_.png");

    imagesLib.addImage(NodeTypes.NodeGpSync, imgPath+NodeTypes.NodeGpSync+".png");
    imagesLib.addImage(NodeTypes.NodeGpSync+"_", imgPath+NodeTypes.NodeGpSync+"_.png");

    imagesLib.addImage(NodeTypes.NodeDefaultVal, imgPath+NodeTypes.NodeDefaultVal+".png");
    imagesLib.addImage(NodeTypes.NodeDefaultVal+"_", imgPath+NodeTypes.NodeDefaultVal+"_.png");

    imagesLib.addImage(NodeTypes.NodeFeature, imgPath+NodeTypes.NodeFeature+".png");
    imagesLib.addImage(NodeTypes.NodeFeature+"_", imgPath+NodeTypes.NodeFeature+"_.png");

    imagesLib.addImage(NodeTypes.NodePubInput, imgPath+NodeTypes.NodePubInput+".png");
    imagesLib.addImage(NodeTypes.NodePubInput+"_", imgPath+NodeTypes.NodePubInput+"_.png");

    imagesLib.addImage(NodeTypes.NodePubOutput, imgPath+NodeTypes.NodePubOutput+".png");
    imagesLib.addImage(NodeTypes.NodePubOutput+"_", imgPath+NodeTypes.NodePubOutput+"_.png");

    // load port images
    //
    imgPath = this._imgPath + "port/";

    imagesLib.addImage(NodeTypes.NodeInPort, imgPath+NodeTypes.NodeInPort+".png");
    imagesLib.addImage(NodeTypes.NodeInPort+"_", imgPath+NodeTypes.NodeInPort+"_.png");

    imagesLib.addImage(NodeTypes.NodeOutPort, imgPath+NodeTypes.NodeOutPort+".png");
    imagesLib.addImage(NodeTypes.NodeOutPort+"_", imgPath+NodeTypes.NodeOutPort+"_.png");

    imagesLib.addImage(NodeTypes.OutPortSel, imgPath+NodeTypes.OutPortSel+".png");
    imagesLib.addImage(NodeTypes.OutPortUnsel, imgPath+NodeTypes.OutPortUnsel+".png");
    imagesLib.addImage(NodeTypes.OutPortLinked, imgPath+NodeTypes.OutPortLinked+".png");

    imagesLib.addImage(NodeTypes.InPortSel, imgPath+NodeTypes.InPortSel+".png");
    imagesLib.addImage(NodeTypes.InPortUnsel, imgPath+NodeTypes.InPortUnsel+".png");
    imagesLib.addImage(NodeTypes.InPortLinked, imgPath+NodeTypes.InPortLinked+".png");

    imagesLib.loadAll();
  };

  function __createFlowChart(mapCanvas, imagesLib){
    mapCanvas.bkgndImage = imagesLib.getImageState(esri2.GeoFlow.NodeTypes.BkgndGrid);

    // add esri_logo.png widget
    var logo = mapCanvas.addWidget("esri_logo");
    logo.setImage(imagesLib.getImageState("esri_logo"), 65, 36, "right-bottom");
    logo.visible = false;

    var legend = mapCanvas.addWidget("status_legend");
    legend.setImage(imagesLib.getImageState("status_legend"), 144, 143, "left-top");
    legend.visible = false;

    mapCanvas.resizeMap(__divContainer.offsetWidth, __divContainer.offsetHeight);
    self.flowChart.init(mapCanvas, imagesLib);

    // add events
    mapCanvas.onKeyPressed = function (e, mapCanvas) {
      var letterPressed = String.fromCharCode(e.keyCode);
      __log(letterPressed);
    };

    mapCanvas.onMouseDown = function (e, mapCanvas) {
      self.getMousePos(e);
      self.flowChart.invokeEventHandler(e, mapCanvas);
    };

    mapCanvas.onMouseUp = function (e, mapCanvas) {
      self.getMousePos(e);
      self.flowChart.invokeEventHandler(e, mapCanvas);
    };

    mapCanvas.onMouseMove = function (e, mapCanvas) {
      self.getMousePos(e);
      __outputMousePos(e);
      self.flowChart.invokeEventHandler(e, mapCanvas);
    };

    mapCanvas.onMouseOver = function (e, mapCanvas) {
      self.getMousePos(e);
      self.flowChart.invokeEventHandler(e, mapCanvas);
    };

    mapCanvas.onMouseOut = function (e, mapCanvas) {
      self.getMousePos(e);
      self.flowChart.invokeEventHandler(e, mapCanvas);
    };

    mapCanvas.onMouseClick = function (e, mapCanvas) {
      self.getMousePos(e);
      self.flowChart.invokeEventHandler(e, mapCanvas);
    };

    // add drag&drop support to canvas
    var canvasObj = mapCanvas.canvas; // =document.querySelector('#_canvasMain');

    __add_event(canvasObj, 'dragover', function (e) {
      if (e.preventDefault) {
        e.preventDefault(); // allows us to drop
      }
      e.dataTransfer.dropEffect = 'copy';
      return false;
    });

    __add_event(canvasObj, 'drop', function (e) {
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting
      }
      // insert node into flow chart
      self.getMousePos(e);

      var newNode = self.flowChart.createNode(null, e.dataTransfer.getData('Text'), e._x, e._y);
      if (__not_null(newNode)) {
        self.refresh();
      }
    });
  }

  this.resizeCanvas = function (w, h) {
    if (__not_null(__mapCanvas) && __not_null(__divContainer)) {
      var cx = __divContainer.offsetWidth,
          cy = __divContainer.offsetHeight;
      if (__not_null(w) && __not_null(h)) {
        cx = w;
        cy = h;
      }
      if (cx !== __mapCanvas.width || cy !== __mapCanvas.height) {
        __log("GeoFlowEditor.resizeCanvas: ", cx, cy);
        __mapCanvas.resizeMap(cx, cy);
        this.refresh();
      }
    }
  };
};

GeoFlowEditor.prototype.updateAll = function () {
  this.flowChart.layerNode.updateBound();
  this.flowChart.layerLink.updateBound();
  this.flowChart.mapCanvas.refreshAll();
};

GeoFlowEditor.prototype.updateNode = function (node, nodeJSON, nodeURL) {
  if (__not_null(node)) {
    // update node by nodeJSON
    __log("GeoFlowEditor.updateNode: ", node.toString(), nodeURL);

    this.nodeState.currentNode = node;
    this.nodeState.nodeJSON = nodeJSON;
    this.nodeState.nodeURL = nodeURL;

    switch (node.getTypeName()) {
    case esri2.GeoFlow.NodeTypes.NodeAssignment:
      GeoFlowEditor.updateNodeAssignment(node);
      break;
    case esri2.GeoFlow.NodeTypes.NodeDefaultVal:
      GeoFlowEditor.updateNodeDefaultVal(node);
      break;
    case esri2.GeoFlow.NodeTypes.NodePubOutput:
      GeoFlowEditor.updateNodePubOutput(node);
      break;
    case esri2.GeoFlow.NodeTypes.NodePubInput:
      GeoFlowEditor.updateNodePubInput(node);
      break;
    default:
      this.nodeState.update();
    }
    this.flowChart.mapCanvas.refreshAll();
  }
  else if (__not_null(nodeJSON)) {
    // update job nodes status
    __log("GeoFlowEditor.updateNode: ", JSON.stringify(nodeJSON));
    var flowJobId, flowJob;
    for (flowJobId in nodeJSON) {
      flowJob = nodeJSON[flowJobId];
      this.flowChart.updateState(flowJobId, flowJob);
    }
    this.flowChart.mapCanvas.refreshAll();
  }
};

GeoFlowEditor.prototype.exportJSON = function (opt_validate) {
  var jsonString = this.flowChart.toJsonString(opt_validate);
  return jsonString; // JSON.parse(jsonStr);
};

GeoFlowEditor.prototype.importJSON = function (json) {
  this.removeAll();
  if (__not_null(json)) {
    this.flowChart.loadJSON(json);
  }
  this.refresh();
};

// used in try{} catch(e){...}
GeoFlowEditor.prototype.validateFlow = function () {
  this.flowChart.validate();
};

GeoFlowEditor.prototype.enableWidget = function (name, visible) {
  var mapCanvas = this.getMapCanvas();
  mapCanvas.widgetItem(name).visible = (visible? true : false);
};

GeoFlowEditor.prototype.refresh = function () {
  this.flowChart.mapCanvas.refreshAll();
};

GeoFlowEditor.prototype.removeAll = function () {
  this.flowChart.clear();
  this.refresh();
};

GeoFlowEditor.prototype.getScaleFactor = function () {
  return this.flowChart.mapCanvas.scaleFactor;
};

GeoFlowEditor.prototype.setScaleFactor = function (newFactor) {
  this.flowChart.mapCanvas.scaleFactor = newFactor;
};

GeoFlowEditor.prototype.createNodeList = function (ul) {
  var li, el, txt, nodeId, nodeType, img,
      nodeList = esri2.GeoFlow.NodeTypes.nodes,
      imgPath = this._imgPath;

  __log("NOTE: see nodetypes.js to find Configuration for drawing geoflow node, link,...");

  // clear all childs
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  // fill in node types
  for (nodeId in nodeList) {
    nodeType = nodeList[nodeId];

    li = document.createElement("dt"); // li
    ul.appendChild(li);

    el = document.createElement("a");
    
    img = document.createElement("img");
    __log("fill node list: ", nodeType.nodeIcon);
    img.src = imgPath + nodeType.nodeIcon;

    txt = document.createTextNode(nodeId);
    el.appendChild(img);
    el.appendChild(txt);
    el.href = "#";

    this.setNodeDraggable(el, nodeId);

    li.appendChild(el);
  }
};

GeoFlowEditor.prototype.setNodeDraggable = function (el, nodeId) {
  el.setAttribute('draggable', 'true');
  el.id=nodeId;

  __add_event(el, 'dragstart', function (e) {
    e.dataTransfer.effectAllowed = 'copy';   // only dropEffect='copy' will be dropable
    e.dataTransfer.setData('Text', this.id); // required otherwise doesn't work
  });
};

GeoFlowEditor.prototype.initNodeDialog = function (dlgParam, geoNode) {
  dlgParam.init(this, geoNode);

  switch (geoNode.getTypeName()) {
  case esri2.GeoFlow.NodeTypes.NodeGpSync:
    dlgParam.content = GeoFlowEditor.getGpSyncDlgContent(geoNode);
    return true;

  case esri2.GeoFlow.NodeTypes.NodeGpAsync:
    dlgParam.content = GeoFlowEditor.getGpAsyncDlgContent(geoNode);
    return true;

  case esri2.GeoFlow.NodeTypes.NodePubInput:
    dlgParam.content = GeoFlowEditor.getPubInputDlgContent(geoNode);
    dlgParam.setButtons(1, 0, 0);
    dlgParam.width = 400;
    dlgParam.height = 300;
    return true;

  case esri2.GeoFlow.NodeTypes.NodePubOutput:
    dlgParam.content = GeoFlowEditor.getPubOutputDlgContent(geoNode);
    dlgParam.setButtons(1, 1, 0);
    dlgParam.width = 400;
    dlgParam.height = 300;
    return true;

  case esri2.GeoFlow.NodeTypes.NodeGeometry:
    dlgParam.content = GeoFlowEditor.getGeometryDlgContent(geoNode);
    return true;

  case esri2.GeoFlow.NodeTypes.NodeFeature:
    dlgParam.content = GeoFlowEditor.getFeatureDlgContent(geoNode);
    return true;

  case esri2.GeoFlow.NodeTypes.NodeDefaultVal:
    dlgParam.content = GeoFlowEditor.getDefaultValDlgContent(geoNode);
    return true;

  case esri2.GeoFlow.NodeTypes.NodeDispatch:
    dlgParam.content = GeoFlowEditor.getDispatchDlgContent(geoNode);
    return true;

  case esri2.GeoFlow.NodeTypes.NodeAssignment:
    dlgParam.content = GeoFlowEditor.getAssignmentDlgContent(geoNode);
    return true;
  }
  return false;
};

