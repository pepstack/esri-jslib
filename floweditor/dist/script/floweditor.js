/******************************************************************************
 * floweditor.js
 *
 * Version: 0.0.1pre
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
 * floweditor.js
 *   required: esri2.utility.js
 */
(function(p, q){
  __using_script( __get_script_path(p)+q );
})('/floweditor.js', 'esri2.geoflow.js');


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

/**
 * GPServicesList Demo
 *   these should be implemented by caller
 */
GeoFlowEditor.GPServicesList = {
  "GpSync": [
    {
      "name": "Create Drive Time Polygons",
      "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons"
    },
    {
      "name": "Population Summary",
      "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/GPServer/PopulationSummary"
    },
    {
      "name": "Profile Service",
      "url": "http://sampleserver2.arcgisonline.com/ArcGIS/rest/services/Elevation/ESRI_Elevation_World/GPServer/ProfileService"
    },
    {
      "name": "Viewshed",
      "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed"
    }
  ],
  "GpAsync": [
    {
      "name": "ERG By Chemical",
      "url": "http://sampleserver2.arcgisonline.com/ArcGIS/rest/services/PublicSafety/EMModels/GPServer/ERGByChemical"
    },
    {
      "name": "ERG By Placard",
      "url": "http://sampleserver2.arcgisonline.com/ArcGIS/rest/services/PublicSafety/EMModels/GPServer/ERGByPlacard"
    },
    {
      "name": "Extract Data Task",
      "url": "http://sampleserver4.arcgisonline.com/ArcGIS/rest/services/HomelandSecurity/Incident_Data_Extraction/GPServer/Extract%20Data%20Task"
    },
    {
      "name": "Strip Map 3Sheet Profile",
      "url": "http://sampleserver4.arcgisonline.com/ArcGIS/rest/services/Arcpy/ArcpyMapping/GPServer/StripMap3SheetProfile"
    }
  ]
};

/**
 * GeoFlowEditor.NodeDialogParam class
 */
GeoFlowEditor.NodeDialogWidth = 570;
GeoFlowEditor.NodeDialogHeight = 360;

GeoFlowEditor.__divNodeState = "__divNodeState"; // DO NOT change it!
GeoFlowEditor.__serviceURLs = "__serviceURLs"; // DO NOT change it!

GeoFlowEditor.NodeDialogParam = function (divID) {
  this.dlgDIV = __get_elem(divID);
  this.dlgSelector = "#"+divID;
  this.autoOpen = true;
  this.content = "";
  this.width = GeoFlowEditor.NodeDialogWidth;
  this.height = GeoFlowEditor.NodeDialogHeight;
  this.title = "";
  this.buttons = {};
};

GeoFlowEditor.NodeDialogParam.prototype.init = function (flowEditor, geoNode) {
  GeoFlowEditor.instance = flowEditor;

  this.autoOpen = true;  
  this.content = "";
  this.width = GeoFlowEditor.NodeDialogWidth;
  this.height = GeoFlowEditor.NodeDialogHeight;

  this.thisNode = geoNode;
  this.title = geoNode.getTitle() + (flowEditor.readOnly? " (Read only)" : "");

  this.buttons = {};
  if (flowEditor.readOnly) {
    this.buttons.Close = GeoFlowEditor.NodeDialogParam.onClose;
  }
  else {
    this.buttons.Ok = GeoFlowEditor.NodeDialogParam.onOk;
    this.buttons.Cancel = GeoFlowEditor.NodeDialogParam.onCancel;
    this.buttons.Apply = GeoFlowEditor.NodeDialogParam.onApply;
  }
};

GeoFlowEditor.NodeDialogParam.prototype.updateDlg = function () {
  this.dlgDIV.innerHTML = this.content;
};

GeoFlowEditor.NodeDialogParam.prototype.showDlg = function () {
  $(this.dlgSelector).dialog(this);

  var divOut = __get_elem(GeoFlowEditor.__divNodeState);
  if (__not_null(divOut)) {
    var sel = __get_elem(GeoFlowEditor.__serviceURLs);
    if (__not_null(sel)) {
      if (__not_null(sel.options)) {
        for (var i=0; i<sel.options.length; i++) {
          if (sel.options[i].text==this.thisNode.serviceName) {
            sel.selectedIndex = i;
            divOut.innerHTML = this.thisNode.getServiceState();
            break;
          }
        }
      }
      else if (sel.value==this.thisNode.serviceName) {
        divOut.innerHTML = this.thisNode.getServiceState();
      }
    }
  }

  this.disableButton("Ok", "Apply", "Cancel");
};

GeoFlowEditor.NodeDialogParam.prototype.disableButton = function () {
  var btns = Array.prototype.slice.call(arguments);
  if (btns.length===0) {
    return;
  }

  $(this.dlgSelector).parent().find("button").each(function() {
    var btnName = $(this).text();
    for (var i=0; i<btns.length; i++) {
      if (btns[i]==btnName) {
        $(this).attr('disabled', true).addClass("ui-button-disabled");
      }
    }
  });
};

GeoFlowEditor.NodeDialogParam.prototype.enableButton = function () {
  var btns = Array.prototype.slice.call(arguments);
  if (btns.length===0) {
    return;
  }
  $(this.dlgSelector).parent().find("button").each(function() {
    var btnName = $(this).text();
    for (var i=0; i<btns.length; i++) {
      if (btns[i]==btnName) {
        $(this).attr('disabled', false).removeClass("ui-button-disabled");
      }
    }
  });
};

GeoFlowEditor.NodeDialogParam.prototype.isButtonDisabled = function (btnName) {
  //??TODO:
  return false;
};

GeoFlowEditor.NodeDialogParam.prototype.setButtons = function (btnOk, btnCancel, btnApply) {
  this.buttons = {};  
  if (btnOk===1) {
    this.buttons.Ok = GeoFlowEditor.NodeDialogParam.onOk;
  }
  if (btnCancel===1) {
    this.buttons.Cancel = GeoFlowEditor.NodeDialogParam.onCancel;
  }
  if (btnApply===1) {
    this.buttons.Apply = GeoFlowEditor.NodeDialogParam.onApply;
  }
};

GeoFlowEditor.NodeDialogParam.onClose = function () {
  $(this).dialog("close");
};

GeoFlowEditor.NodeDialogParam.onOk = function () {
  if (!dlgParam.isButtonDisabled("Apply")) {
    GeoFlowEditor.NodeDialogParam.onApply();
  }
  $(this).dialog("close");
};

GeoFlowEditor.NodeDialogParam.onCancel = function () {
  $(this).dialog("close");
};

GeoFlowEditor.NodeDialogParam.onApply = function () {
  try{
    GeoFlowEditor.instance.updateNode(dlgParam.thisNode, dlgParam.nodeJSON, dlgParam.nodeURL);
    var divState = __get_elem(GeoFlowEditor.__divNodeState);
    dlgParam.thisNode.setServiceState(divState.name, divState.innerHTML);
    dlgParam.disableButton("Apply");

    // change dialog title
    $(dlgParam.dlgSelector).dialog('option', 'title', dlgParam.thisNode.getTitle());
  }
  catch(e) {
    __log("GeoFlowEditor.NodeDialogParam.onApply exception: ", e.message);
  }
};

/**
 * GeoFlowEditor functions class
 *   these should be implemented by caller
 */
GeoFlowEditor.instance = null;  // GeoFlowEditor instance
GeoFlowEditor.nodeDialog = null;

GeoFlowEditor.getParamsHTML = function (parameters, paramType) {
  var html="";
  for (var i=0; i<parameters.length; i++) {
    var param = parameters[i];
    if (param.direction===paramType) {
      html += "<br/><span style='margin-left:20px; font-size:9pt'><b>"+param.displayName+"</b></span>"+
        "<ul style='padding-left:40px; list-style-type:circle; width:auto; min-height:0; margin:0;'>"+
          "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+param.dataType+"</li>"+
          "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+param.parameterType+"</li>";
          if (__not_null(param.description)) {
            html += "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+param.description+"</li>";
          }
      html += "</ul>";
    }
  }
  return html;
};

GeoFlowEditor.getNodeHTML = function (nodeURL, data) {
  var html =
    "<p><a href='javascript:void(0);' onclick='window.open(\""+nodeURL+"\");return false;'>"+
    "<span style='color:green;margin-left:0px;font-size:11pt;'><strong>"+data.displayName+"</strong></span></a></p>";

    if (__not_null(data.description)) {
      html += "<ul style='padding-left:40px; list-style-type:circle; width:auto; min-height:0; margin:0;'>"+
                "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+data.description+"</li>"+
              "</ul>";
    }

    html +=
    "<p/><strong>Input Parameters:</strong></p>"+
      GeoFlowEditor.getParamsHTML(data.parameters, "esriGPParameterDirectionInput")+
    "<p/><strong>Output Parameters:</strong></p>"+
      GeoFlowEditor.getParamsHTML(data.parameters, "esriGPParameterDirectionOutput")+
    "<p/>"+
    "<p>"+
      "<a href='javascript:void(0);' onclick='window.open(\""+data.helpUrl+"\");return false;'>"+
      "<span style='color:green;margin-left:0px;font-size:11pt'><strong>Help</strong></span></a>"+
    "</p>";
  return html;
};

GeoFlowEditor.ajaxGetNodeJSON = function (svcName, nodeURL, divOutput) {
  $.ajax({
    url: nodeURL,
    dataType: 'jsonp', // cross domain using: jsonp
    timeout: 6000,
    data: {f:"json", pretty:"true"},
    success: function(data){
      dlgParam.nodeJSON = data;
      dlgParam.nodeURL = nodeURL;
      divOutput.name = svcName;
      divOutput.innerHTML = GeoFlowEditor.getNodeHTML(nodeURL, data);
      dlgParam.enableButton("Ok", "Cancel", "Apply");
    },
    error: function(data){
      var errMsg = "<h3>Error to get URL:<h3>"+"<p><a href='"+nodeURL+"'>"+nodeURL+"</a></p>";
      errMsg += "<p>"+data.statusText+"</p>";
      divOutput.name = svcName;
      divOutput.innerHTML = errMsg;    
    }
  });
};

GeoFlowEditor.refreshNodeURL = function (nodeTypeName, urlID, outputID) {
  var elUrl = __get_elem(urlID),
      elOut = __get_elem(outputID),
      selOpt;

  switch(nodeTypeName) {
  case esri2.GeoFlow.NodeTypes.NodeGpSync:
  case esri2.GeoFlow.NodeTypes.NodeGpAsync:
    selOpt = elUrl.options[elUrl.selectedIndex];
    GeoFlowEditor.ajaxGetNodeJSON(selOpt.text, selOpt.value, elOut);
    break;

  case esri2.GeoFlow.NodeTypes.NodePubInput:
  case esri2.GeoFlow.NodeTypes.NodePubOutput:
    break;

  case esri2.GeoFlow.NodeTypes.NodeGeometry:
    selOpt = elUrl.options[elUrl.selectedIndex];
    dlgParam.nodeJSON = esri2.GeoFlow.Node.Geometry.operations[selOpt.value];
    dlgParam.nodeURL = dlgParam.nodeJSON.url + "/" + dlgParam.nodeJSON.name;
    elOut.name = selOpt.text;
    elOut.innerHTML = GeoFlowEditor.getNodeHTML(dlgParam.nodeURL, dlgParam.nodeJSON);
    dlgParam.enableButton("Ok", "Cancel", "Apply");
    break;

  case esri2.GeoFlow.NodeTypes.NodeFeature:
    // send to server to test node json
    var nodeURL = elUrl.value;
    $.ajax({
      url: nodeURL,
      dataType: 'jsonp', // cross domain using: jsonp
      timeout : 6000,
      data: {f:"json", pretty:"true"},
      success: function(data){
        dlgParam.nodeURL = nodeURL;
        var queryJSON = esri2.GeoFlow.Node.Feature.operations.query;

        for (var p=0; p<queryJSON.parameters.length; p++) {
          if (queryJSON.parameters[p].name==="inSR" || queryJSON.parameters[p].name==="outSR") {
            try {
              queryJSON.parameters[p].defaultValue = "\""+data.extent.spatialReference.wkid+"\"";
            }
            catch (e) {
              queryJSON.parameters[p].defaultValue = "\"\"";
            }          
          }
        }
        queryJSON.name = data.name;
        queryJSON.displayName = data.type +": "+queryJSON.name;

        dlgParam.nodeJSON = queryJSON; // from client config
        dlgParam.nodeJSON.url = nodeURL; // ---replaced by user input---

        elOut.name = nodeURL;
        elOut.innerHTML = GeoFlowEditor.getNodeHTML(dlgParam.nodeURL, dlgParam.nodeJSON);
        dlgParam.enableButton("Ok", "Cancel", "Apply");
      },
      error: function(data){
        var errMsg = "<h3>Error to get:<h3>"+"<p><a href='"+nodeURL+"'>"+nodeURL+"</a></p>";
        errMsg += "<p>"+data.statusText+"</p>";
        elOut.name = nodeURL;
        elOut.innerHTML = errMsg;
      }
    });
    break;
  }
};

GeoFlowEditor.getNodeStatusHTML = function (geoNode) {
  var divHTML = "";
  if (!geoNode.isDefaultStatus()) {
    divHTML = 
      "<div style='padding-left:10px; border:3px solid "+geoNode.getStatusColor()+";'>"+
        "JobStatus: "+geoNode.execStatus+
        "<br />Message: "+geoNode.errMessage+
      "</div>";
  }
  return divHTML;
};

GeoFlowEditor.getGpSyncDlgContent = function (geoNode) {
  var urls = GeoFlowEditor.GPServicesList[esri2.GeoFlow.NodeTypes.NodeGpSync];
  if (__is_null(urls)) {
    throw new Error("GeoFlowEditor.GPServicesList: GpSync not found");
  }

  var i, li, html;
  html = "<p>service URL:"+
           "<select id='__serviceURLs'>";
             
  for (i=0; i<urls.length; i++) {
    li = urls[i];
    html +=  "<option value='" + li.url + "'>" + li.name + "</option>";
  }
  html +=  "</select>"+
             "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
               esri2.GeoFlow.NodeTypes.NodeGpSync+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getGpAsyncDlgContent = function (geoNode) {
  var urls = GeoFlowEditor.GPServicesList[esri2.GeoFlow.NodeTypes.NodeGpAsync];
  if (__is_null(urls)) {
    throw new Error("GeoFlowEditor.GPServicesList: GpAsync not found");
  }
  var i, li, html;
  html = "<p>service URL:"+
           "<select id='__serviceURLs'>";
  for (i=0; i<urls.length; i++) {
    li = urls[i];
    html +=  "<option value='" + li.url + "'>" + li.name + "</option>";
  }
  html +=  "</select>"+
             "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
               esri2.GeoFlow.NodeTypes.NodeGpAsync+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getPubInputDlgContent = function (geoNode) {
  var outPort = geoNode.getOutPort(1);
  var html =
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<table>"+
      "<tr><td>Input Name:</td><td>"+geoNode.name+"</td></tr>"+
      "<tr><td>Data Type:</td><td>"+outPort.dataType+"</td></tr>"+
      "<tr><td>Default Value:</td><td>"+outPort.defaultValue+"</td></tr>"+
    "</table>";
  return html;
};

GeoFlowEditor.getPubOutputDlgContent = function (geoNode) {
  var inPort = geoNode.getInPort(1);
  var html =
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<table>"+
      "<tr><td>Output Name:</td><td>"+geoNode.name+"</td></tr>"+
      "<tr><td>Data Type:</td><td>"+inPort.dataType+"</td></tr>"+
      "<tr><td>Default Value:</td><td>"+inPort.defaultValue+"</td></tr>"+
      "<tr><td>Callout URL:</td><td>"+
        "<input id='__calloutURL' type='text' size='40' maxlength='1200' value='"+
          geoNode.typedNode.callout+"' oninput='GeoFlowEditor.checkInputValue(\""+
          esri2.GeoFlow.NodeTypes.NodePubOutput+"\", \"__calloutURL\");' />"+
        "</td></tr>"+
    "</table>";
  return html;
};

GeoFlowEditor.getGeometryDlgContent = function (geoNode) {
 var i, li, html, opId, op,
     operations = esri2.GeoFlow.Node.Geometry.operations;

  html = "<p>service URL:"+
           "<select id='__serviceURLs'>";
  for (opId in operations) {
    op = operations[opId];
    if (op.enabled) {
      html += "<option value='"+opId+"'>" + op.displayName + "</option>";
    }
  }
  html +=  "</select>";
  html +=  "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
             esri2.GeoFlow.NodeTypes.NodeGeometry+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getFeatureDlgContent = function (geoNode) {
  var html;
  // FeatureDemoURL = http://10.112.18.110:6080/arcgis/rest/services/GeoFlow/pm25_usa/FeatureServer/0
  html = "<p>"+
           "<input id='__serviceURLs' type='text' size='60' maxlength='1200' value='"+
           geoNode.url+
           "'/>"+
           "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
              esri2.GeoFlow.NodeTypes.NodeFeature+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getDispatchDlgContent = function (geoNode) {
  var i, html = "";
  html +=
    "<p><span style='color:green;margin-left:0px;font-size:11pt;'><strong>"+geoNode.displayName+"</strong></span></p>"+
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<p/><strong>Inputs:</strong></p>";

  var numInPorts = geoNode.getInPort();
  for (i=1; i<=numInPorts; i++) {
    var inPort = geoNode.getInPort(i);
    if (i!==1) {
      html += "<br/>";
    }
    html += "<span style='margin-left:20px; font-size:9pt'><b>"+inPort.displayName+"</b></span>";
      var inPort2 = inPort.getLinkedPort();
      if (__not_null(inPort2)) {
        html += "<span style='margin-left:20px; font-size:9pt'>("+inPort2.parentNode.getTitle()+")</span>";
      }
      html += "<br/><span style='margin-left:40px; font-size:9pt'>"+inPort.dataType+"</span>";    
  }

  html +=
    "<p/><strong>Outputs:</strong></p>";

  var numOutPorts = geoNode.getOutPort();
  for (i=1; i<numOutPorts; i++) {
    var outPort = geoNode.getOutPort(i);
    if (i!==1) {
      html += "<br/>";
    }
    html += "<span style='margin-left:20px; font-size:9pt'><b>"+outPort.displayName+"</b></span>";
    var outPort2 = outPort.getLinkedPort();
    if (__not_null(outPort2)) {
      html += "<span style='margin-left:20px; font-size:9pt'>("+outPort2.parentNode.getTitle()+")</span>";
    }
    html += "<br/><span style='margin-left:40px; font-size:9pt'>"+outPort.dataType+"</span>";
  }
  return html;
};

GeoFlowEditor.getDefaultValDlgContent = function (geoNode) {
  var html = "";
  html += 
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<table>";

  var num = geoNode.getOutPort();
  for (var i = 1; i< num; i++) {
    var port = geoNode.getOutPort(i);
    html += 
      "<tr>"+
        "<td>"+port.displayName+":</td>"+
        "<td><textarea rows='3' cols='40' style='resize:none;' id='"+port.name+"' oninput='GeoFlowEditor.checkInputValue(\""+
        esri2.GeoFlow.NodeTypes.NodeDefaultVal+"\",\""+port.name+"\");'>"+
        port.defaultValue+
        "</textarea></td>"+
        "<td>("+port.dataType+")</td>"+
      "</tr>";
  }

  html +=
    "</table>";

  if (num===1) {
    html = "<p>No link found with this node</p>";
  }
  return html;
};

GeoFlowEditor.getAssignmentDlgContent = function (geoNode) {
  var html;
  html = "<p>Description:</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><input id='assignment_desc' type='text' size='60' "+ 
         (GeoFlowEditor.instance.readOnly? "readonly='true' " : " ") +
            "maxlength='1200' value='"+
            geoNode.typedNode.description+
            "' oninput='GeoFlowEditor.checkInputValue(\""+
            esri2.GeoFlow.NodeTypes.NodeAssignment+
            "\", \"assignment_desc\");' />"+
         "</p>";
  return html;
};

GeoFlowEditor.checkInputValue = function (nodeType, inputID) {
  var inp = __get_elem(inputID);
  __log(inp.value);

  //??TODO: check inp.value
  if (nodeType===esri2.GeoFlow.NodeTypes.NodeAssignment) {
    dlgParam.thisNode.setServiceState(inputID, inp.value);
    dlgParam.enableButton("Ok", "Cancel", "Apply");
  }
  else if (nodeType===esri2.GeoFlow.NodeTypes.NodeDefaultVal){
    dlgParam.enableButton("Ok", "Cancel", "Apply");
  }
  else if (nodeType===esri2.GeoFlow.NodeTypes.NodePubOutput) {
    dlgParam.enableButton("Ok", "Cancel");
  }
};

GeoFlowEditor.updateNodeAssignment = function (geoNode) {
  geoNode.typedNode.description = geoNode.getServiceState();
};

GeoFlowEditor.updateNodeDefaultVal = function (geoNode) {
  var num = geoNode.getOutPort();
  for (var i = 1; i< num; i++) {
    port = geoNode.getOutPort(i);
    port.defaultValue = __get_elem(port.name).value;
    __log(port.name + " = " + port.defaultValue);
    geoNode.typedNode.updateOutPort(port.getNextLink());
  }
};

GeoFlowEditor.updateNodePubOutput = function (geoNode) {
  geoNode.typedNode.setCallout(__get_elem("__calloutURL").value);
};

GeoFlowEditor.updateNodePubInput = function (geoNode) {
};
/**
 * end of floweditor.js
 */
