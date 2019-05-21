/******************************************************************************
 * esri2.geoflow.js
 *
 * Version: 0.0.1pre
 *
 * Copyright (c) 2012-2013 Esri
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
 * esri2.geoflow.js
 */
(function(p, q){
  __using_script( __get_script_path(p)+q );
})('/esri2.geoflow.js', 'esri2.map.js');

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
// Enable ECMAScript "strict" operation for this function.
// See more:
//   http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more
"use strict";

// Predefinitions
var
  TRUE = true,
  FALSE = false,
  NULL = null,
  ERRINDEX = -1;

var __indent_spc = "    ";

var __quot_str = function (s) {
  return ("\"" + s + "\"");
};


/**
 * nodetypes.js
 *   Drawing Nodes
 *   Configuration for drawing geoflow, node, link,...
 */
var NodeTypes = function () {
};

/**
 * GridSize controls all sizes of displaying nodes
 * 16, 24, 32
 */
NodeTypes.GridSize = 24;

NodeTypes.BkgndGrid = "BkgndGrid";
NodeTypes.LinkCutter = "LinkCutter";
NodeTypes.CutterSize = 32;

NodeTypes.MaxNodes = 40;
NodeTypes.MaxPorts = 40;

NodeTypes.InRender = "_inRdr";
NodeTypes.OutRender = "_outRdr";

// Node icons
//
NodeTypes.NodeIconSize = 16;

NodeTypes.NodeBoxName = "NodeBox";
NodeTypes.NodeShadowName = "NodeShadow";
NodeTypes.NodeHeadName = "NodeHead";
NodeTypes.NodeCaption = "NodeCaption";

NodeTypes.NodeIconName = "NodeIcon";
NodeTypes.NodeEditName = "NodeEdit";
NodeTypes.NodeDropName = "NodeDrop";

// Node Type Names
//
NodeTypes.NodeAssignment = "Assignment";
NodeTypes.NodeDefaultVal = "DefaultVal";
NodeTypes.NodeDispatch = "Dispatch";
NodeTypes.NodeFeature = "Feature";
NodeTypes.NodeGeometry = "Geometry";
NodeTypes.NodeGpAsync = "GpAsync";
NodeTypes.NodeGpSync = "GpSync";
NodeTypes.NodePubInput = "PubInput";
NodeTypes.NodePubOutput = "PubOutput";

NodeTypes._TypeNum = 9;
NodeTypes._TypeIDs = {};
NodeTypes._TypeIDs[NodeTypes.NodeAssignment] = 0;
NodeTypes._TypeIDs[NodeTypes.NodeDefaultVal] = 1;
NodeTypes._TypeIDs[NodeTypes.NodeDispatch] = 2;
NodeTypes._TypeIDs[NodeTypes.NodeFeature] = 3;
NodeTypes._TypeIDs[NodeTypes.NodeGeometry] = 4;
NodeTypes._TypeIDs[NodeTypes.NodeGpAsync] = 5;
NodeTypes._TypeIDs[NodeTypes.NodeGpSync] = 6;
NodeTypes._TypeIDs[NodeTypes.NodePubInput] = 7;
NodeTypes._TypeIDs[NodeTypes.NodePubOutput] = 8;

// 0: not linkable
// 1: linkable
NodeTypes.__matchTable = [               //  outport of node:
    0,  1,  1,  1,  1,  1,  1,  1,  1,   // Assignment
    1,  0,  1,  1,  1,  1,  1,  0,  0,   // DefaultVal
    0,  0,  0,  1,  1,  1,  1,  0,  1,   // Dispatch
    0,  0,  1,  0,  1,  1,  1,  0,  1,   // Feature
    0,  0,  1,  1,  1,  1,  1,  0,  1,   // Geometry
    0,  0,  1,  1,  1,  1,  1,  0,  1,   // GpAsync
    0,  0,  1,  1,  1,  1,  1,  0,  1,   // GpSync
    1,  0,  1,  1,  1,  1,  1,  0,  0,   // PubInput
    0,  0,  0,  0,  0,  0,  0,  0,  0    // PubOutput
// Agn Def Dis Fea Geo GpA GpS Inp Out <= inport of node
];

NodeTypes.setMatchTable = function (rowID, colID, val /* 0,1 */) {
  var row = NodeTypes._TypeIDs[rowID];
  var col = NodeTypes._TypeIDs[colID];
  NodeTypes.__matchTable[row*NodeTypes._TypeNum + col] = val;
};

NodeTypes.getMatchTable = function (rowID, colID) {
  var row = NodeTypes._TypeIDs[rowID];
  var col = NodeTypes._TypeIDs[colID];
  return NodeTypes.__matchTable[row*NodeTypes._TypeNum + col];
};

// Node Port Names
NodeTypes.NodeInPort = "InPort";
NodeTypes.NodeOutPort = "OutPort";

// Node Ports
NodeTypes.InDotR = 6;
NodeTypes.OutDotR = 6;
NodeTypes.RoundR = 8;

NodeTypes.InPortDY = 3;
NodeTypes.OutPortDY = 4;

// Node Port Images
//
NodeTypes.OutPortSel = "outport-sel";
NodeTypes.OutPortUnsel = "outport-unsel";
NodeTypes.OutPortLinked = "outport-linked";

NodeTypes.InPortSel = "inport-sel";
NodeTypes.InPortUnsel = "inport-unsel";
NodeTypes.InPortLinked = "inport-linked";

// static functions:
//
NodeTypes.createLinkRenders = function () {
  var r1 = new esri2.Map.Render("#outl");
  r1.setFill(null);
  r1.setStroke("#666", 2, "round");
  r1.setShadow(5, "#404040", 2, 2);

  var renders = new esri2.Common.PairArray();
  renders.insert(r1.name, r1);

  return renders;
};

NodeTypes.createLinkSelRenders = function () {
  var r1 = new esri2.Map.Render("#outl");
  r1.setFill(null);
  r1.setStroke("#246096", 3, "round"); // aaa
  r1.setShadow(5, "#404040", 2, 2);

  var r2 = new esri2.Map.Render("#inl");
  r2.setFill(null);
  r2.setShadow(null);
  r2.setStroke("#DFFAFE", 2, "round");

  var renders = new esri2.Common.PairArray();
  renders.insert(r1.name, r1);
  renders.insert(r2.name, r2);

  return renders;
};

NodeTypes.createPortSymbol = function (imgName, imgLib) {
  var portSymbol = new esri2.Map.Symbol(imgName);
  portSymbol.symbolUnit.baseX = 8;
  portSymbol.symbolUnit.baseY = 8;

  var portIcon = new esri2.Map.Shape(portSymbol);
  portIcon.createRectXY(0, 0, 16, 16);
  portIcon.selectable = true;

  var render = portIcon.useDefaultRender();
  render.setStroke(null);
  render.setFill(null, imgLib.getImage(imgName));

  portSymbol.addShape(portIcon);
  portSymbol.updateBound();
  return portSymbol;
};

NodeTypes.createIconRect = function (
  tagObject,
  nodeSymbol,
  iconName,
  iconImageIn, iconImageOut,
  selectable, handler,
  cxIcon, cyIcon) {
  var r, rcIcon = new esri2.Map.Shape(tagObject);

  rcIcon.addAttribute("NAME", iconName);
  nodeSymbol.addAttribute(iconName, rcIcon);
  rcIcon.createRectXY(0, 0, cxIcon, cyIcon);

  // set how to draw node defaultly
  rcIcon.renderName = NodeTypes.OutRender;

  // add renders to rcIcon
  r = rcIcon.addRender(NodeTypes.InRender);
  r.setStroke(null);
  r.setFill(null, iconImageIn);

  r = rcIcon.addRender(NodeTypes.OutRender);
  r.setStroke(null);
  r.setFill(null, iconImageOut);

  rcIcon.selectable = selectable;
  rcIcon.eventHandler = handler;

  return rcIcon;
};

NodeTypes.createNodeIcon = function (nodeSymbol, flowChart, typedNode) {
  var imageIn = flowChart.imagesLib.getImage(typedNode.toString()+"_");
  var imageOut = flowChart.imagesLib.getImage(typedNode.toString());

  var iconRect = NodeTypes.createIconRect(nodeSymbol, nodeSymbol,
    NodeTypes.NodeIconName,
    imageIn,
    imageOut,
    true,
    null,
    NodeTypes.NodeIconSize,
    NodeTypes.NodeIconSize);
  return iconRect;
};

NodeTypes.createEditIcon = function (nodeSymbol, flowChart) {
  var imageIn = flowChart.imagesLib.getImage(NodeTypes.NodeEditName+"_");
  var imageOut = flowChart.imagesLib.getImage(NodeTypes.NodeEditName);

  var iconRect = NodeTypes.createIconRect(nodeSymbol, nodeSymbol,
    NodeTypes.NodeEditName,
    imageIn,
    imageOut,
    true,
    EventHandlers.editNodeHandler,
    NodeTypes.NodeIconSize,
    NodeTypes.NodeIconSize);
  // iconRect.tag=nodeSymbol
  return iconRect;
};

NodeTypes.createDropIcon = function (nodeSymbol, flowChart) {
  var imageIn = flowChart.imagesLib.getImage(NodeTypes.NodeDropName+"_");
  var imageOut = flowChart.imagesLib.getImage(NodeTypes.NodeDropName);

  var iconRect = NodeTypes.createIconRect(nodeSymbol, nodeSymbol,
    NodeTypes.NodeDropName,
    imageIn,
    imageOut,
    true,
    EventHandlers.dropNodeHandler,
    NodeTypes.NodeIconSize,
    NodeTypes.NodeIconSize);
  // iconRect.tag=nodeSymbol
  return iconRect;
};

NodeTypes.createNodeShadow = function (nodeSymbol, nodW, nodH) {
  var shadow = new esri2.Map.Shape(nodeSymbol);
  nodeSymbol.addAttribute(NodeTypes.NodeShadowName, shadow);
  shadow.createRoundRectXY(0, 0, nodW, nodH, NodeTypes.RoundR);
  shadow.selectable = false;

  var r = shadow.useDefaultRender();
  r.setStroke("#222", 4); // 222, color, width, cap, join
  r.setFill(null);
  r.setShadow(6, "#404040", 3, 3);

  return shadow;
};

//@node_box
NodeTypes.createNodeBox = function (nodeSymbol, nodW, nodH) {
  var box = new esri2.Map.Shape(nodeSymbol);
  nodeSymbol.addAttribute(NodeTypes.NodeBoxName, box);
  box.createRoundRectXY(0, 0, nodW, nodH, NodeTypes.RoundR);

  var r = box.addRender(NodeTypes.InRender);
  r.setStroke("#EFEFEF", 3);
  r.setShadow(null);
  r.setLinearGradient(['both', 'NWSE'], [0, '#EFEFEF'], [1, '#FFFFFF']);

  r = box.addRender(NodeTypes.OutRender);
  r.setStroke("#DADADA", 3);
  r.setLinearGradient(['both', 'NWSE'], [0, '#DADADA'], [1, '#FAFAFA']);
  r.setShadow(null);

  box.renderName=NodeTypes.OutRender; // set how to draw node defaultly

  box.selectable = true;
  box.eventHandler = EventHandlers.nodeBoxHandler;

  return box;
};

NodeTypes.updateDrawNode = function (nodeSymbol, nodW, nodH, caption) {
  var box = nodeSymbol.getAttribute(NodeTypes.NodeBoxName);
  var shadow = nodeSymbol.getAttribute(NodeTypes.NodeShadowName);
  var capt = nodeSymbol.getAttribute(NodeTypes.NodeCaption);
  capt.addAttribute("TEXT", caption);

  box.createRoundRectXY(0, 0, nodW, nodH, NodeTypes.RoundR);
  shadow.createRoundRectXY(0, 0, nodW, nodH, NodeTypes.RoundR);
  nodeSymbol.updateBound();
};

NodeTypes.createNodeHead = function (nodeSymbol, nodW, headH) {
  var r, rName, head = new esri2.Map.Shape(nodeSymbol);
  nodeSymbol.addAttribute(NodeTypes.NodeHeadName, head);
  head.createRoundRectXY(0, 0, nodW, headH, NodeTypes.RoundR);

  rName = GeoNode.DefaultStatus+NodeTypes.InRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setShadow(null);
  r.setLinearGradient(['fill', 'NWSE'], [0, '#a0a0a0'], [1, '#f0f0f0']);

  rName = GeoNode.DefaultStatus+NodeTypes.OutRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setShadow(null);
  r.setLinearGradient(['fill', 'NWSE'], [0, '#808080'], [1, '#cdcdcd']);

  // draw by execStatus:
  // InitializedStatus
  // cyan: #6AE8DB
  rName = GeoNode.InitializedStatus+NodeTypes.InRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setLinearGradient(['fill', 'NWSE'], [0, '#6AE8DB'], [1, '#B1F3ED']);
  r.setShadow(null);

  rName = GeoNode.InitializedStatus+NodeTypes.OutRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setFill('#6AE8DB');
  r.setShadow(null);

  // SucceededStatus
  // green: #34B14C
  rName = GeoNode.SucceededStatus+NodeTypes.InRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setLinearGradient(['fill', 'NWSE'], [0, '#34B14C'], [1, '#B6F0C8']);
  r.setShadow(null);

  rName = GeoNode.SucceededStatus+NodeTypes.OutRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setFill('#34B14C');
  r.setShadow(null);

  // FailedStatus
  // red: #ED1C24
  rName = GeoNode.FailedStatus+NodeTypes.InRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setLinearGradient(['fill', 'NWSE'], [0, '#ED1C24'], [1, '#FAB8BB']);
  r.setShadow(null);

  rName = GeoNode.FailedStatus+NodeTypes.OutRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setFill('#ED1C24');
  r.setShadow(null);

  // RunningStatus
  // blue: #00A2E8
  rName = GeoNode.RunningStatus+NodeTypes.InRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setLinearGradient(['fill', 'NWSE'], [0, '#00A2E8'], [1, '#B0E8FF']);
  r.setShadow(null);

  rName = GeoNode.RunningStatus+NodeTypes.OutRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setFill('#00A2E8');
  r.setShadow(null);

  // PausedStatus
  // orange: #FF7F27
  rName = GeoNode.PausedStatus+NodeTypes.InRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setLinearGradient(['fill', 'NWSE'], [0, '#FF7F27'], [1, '#FFCAA6']);
  r.setShadow(null);

  rName = GeoNode.PausedStatus+NodeTypes.OutRender;
  r = head.addRender(rName);
  r.setStroke(null);
  r.setFill('#FF7F27');
  r.setShadow(null);

  // set how to draw node defaultly
  head.renderName = GeoNode.DefaultStatus+NodeTypes.OutRender;

  return head;
};

NodeTypes.createNodeCaption = function (nodeSymbol, typedNode, headH) {
  var nodW = typedNode.nodW;
  var capt = new esri2.Map.Shape(nodeSymbol);
  nodeSymbol.addAttribute(NodeTypes.NodeCaption, capt);
  capt.createRectXY(0, 0, nodW-NodeTypes.GridSize*3, headH-4);
  capt.addAttribute("TEXT", "Undefined "+typedNode.toString());

  var r = capt.addRender(NodeTypes.InRender);
  r.setStroke(null);
  r.setFill(null);
  r.setShadow(null);
  r.setText("#111", "TEXT", "left");
  r.setFont("normal", 300, "9pt", "sans-serif");

  r = capt.addRender(NodeTypes.OutRender);
  r.setStroke(null);
  r.setFill(null);
  r.setShadow(null);
  r.setText("#444", "TEXT", "left");
  r.setFont("normal", 300, "9pt", "sans-serif");

  // set how to draw node defaultly
  capt.renderName=NodeTypes.OutRender;

  if (__browser.chrome) {
    capt.offset(NodeTypes.GridSize, 4);
  }
  else {
    capt.offset(NodeTypes.GridSize, 6);
  }

  return capt;
};

NodeTypes.createInPort = function (flowChart, nodeSymbol, port, nodW, i) {
  var r;
  // port box for drawing text
  //
  var box = new esri2.Map.Shape(port);
  box.createRectXY(0, 0, nodW-NodeTypes.GridSize, NodeTypes.GridSize-4);
  box.addAttribute("TEXT", port.displayName);
  box.addAttribute("PORT_TEXT", true);
  box.renderName = NodeTypes.OutRender;

  r = box.addRender(NodeTypes.InRender);
  r.setStroke(null);
  r.setFill(null);
  r.setShadow(null);
  if (port.required===true) {
    r.setText("#111", "TEXT", "left");
    r.setFont("normal", "bold", "10pt", "sans-serif");
  }
  else {
    r.setText("#111", "TEXT", "left");
    r.setFont("normal", "normal", "10pt", "sans-serif");
  }

  r = box.addRender(NodeTypes.OutRender);
  r.setStroke(null);
  r.setFill(null);
  r.setShadow(null);
  if (port.required===true) {
    r.setText("#555", "TEXT", "left");
    r.setFont("normal", "bold", "10pt", "sans-serif");
  }
  else {
    r.setText("#555", "TEXT", "left");
    r.setFont("normal", "normal", "10pt", "sans-serif");
  }

  // port icons
  //
  var portIcon = NodeTypes.createIconRect(port, nodeSymbol, port.getTypeId(),
    flowChart.imagesLib.getImage(NodeTypes.NodeInPort+"_"),
    flowChart.imagesLib.getImage(NodeTypes.NodeInPort),
    false,
    null,
    NodeTypes.NodeIconSize,
    NodeTypes.NodeIconSize);

  // port dot
  var dot = new esri2.Map.Shape(port);
  dot.createCircleXY(0, 0, NodeTypes.InDotR);
  dot.selectable = true;
  dot.eventHandler = EventHandlers.nodePortHandler;
  port.tagShape = dot;
  r = dot.useDefaultRender();
  r.setStroke(null);
  r.setShadow(null);
  r.setFill("#fff");

  // set position of shapes
  portIcon.offset(0-10, (i+1)*NodeTypes.GridSize-8);
  dot.offset(-2, (i+1)*NodeTypes.GridSize);
  if (__browser.chrome) {
    box.offset(10, (i+0.5)*NodeTypes.GridSize+NodeTypes.InPortDY);
  }
  else {
    box.offset(10, (i+0.5)*NodeTypes.GridSize+NodeTypes.InPortDY+1);
  }

  // add shapes into symbol
  portIcon.addAttribute("port:symbol", nodeSymbol);
  dot.addAttribute("port:symbol", nodeSymbol);
  box.addAttribute("port:symbol", nodeSymbol);

  nodeSymbol.addShapesFront(portIcon, dot, box);
};

NodeTypes.createOutPort = function (flowChart, nodeSymbol, port, nodW, i) {
  var r;
  // port box for drawing text
  //
  var box = new esri2.Map.Shape(port);
  box.createRectXY(0, 0, nodW-NodeTypes.GridSize, NodeTypes.GridSize-4);
  box.addAttribute("TEXT", port.displayName);
  box.addAttribute("PORT_TEXT", true);
  box.renderName = NodeTypes.OutRender;

  r = box.addRender(NodeTypes.InRender);
  r.setStroke(null);
  r.setFill(null);
  r.setShadow(null);
  
  if (port.required===true) {
    r.setText("#111", "TEXT", "right");
    r.setFont("normal", "bold", "10pt", "sans-serif");
  }
  else {
    r.setText("#111", "TEXT", "right");
    r.setFont("normal", 300, "10pt", "sans-serif");
  }

  r = box.addRender(NodeTypes.OutRender);
  r.setStroke(null);
  r.setFill(null);
  r.setShadow(null);
  if (port.required===true) {
    r.setText("#555", "TEXT", "right");
    r.setFont("normal", "bold", "10pt", "sans-serif");
  }
  else {
    r.setText("#555", "TEXT", "right");
    r.setFont("normal", 300, "10pt", "sans-serif");
  }

  // port icons
  //
  var portIcon = NodeTypes.createIconRect(port, nodeSymbol,
    port.getTypeId(),
    flowChart.imagesLib.getImage(NodeTypes.NodeOutPort+"_"),
    flowChart.imagesLib.getImage(NodeTypes.NodeOutPort),
    false,
    null,
    NodeTypes.NodeIconSize,
    NodeTypes.NodeIconSize);

  // port dot
  //
  var dot = new esri2.Map.Shape(port);
  dot.createCircleXY(0, 0, NodeTypes.OutDotR);
  dot.selectable = true;
  dot.eventHandler = EventHandlers.nodePortHandler;
  port.tagShape = dot;
  r = dot.useDefaultRender();
  r.setStroke(null);
  r.setFill("#fff");
  r.setShadow(null);

  // set positions of shapes
  portIcon.offset(nodW-6, (i+1)*NodeTypes.GridSize-8);
  dot.offset(nodW+2, (i+1)*NodeTypes.GridSize);

  //?? set text box positions
  if (__browser.chrome) {
    box.offset(NodeTypes.GridSize/2, (i+0.5)*NodeTypes.GridSize+NodeTypes.OutPortDY);
  }
  else {
    box.offset(NodeTypes.GridSize/2, (i+0.5)*NodeTypes.GridSize+NodeTypes.OutPortDY+1);
  }

  // add shapes into symbol
  portIcon.addAttribute("port:symbol", nodeSymbol);
  dot.addAttribute("port:symbol", nodeSymbol);
  box.addAttribute("port:symbol", nodeSymbol);

  nodeSymbol.addShapesFront(portIcon, dot, box);
};

NodeTypes.updateNodeRenders = function (node, InOutRender) {
  if (__not_null(node)) {
    var symbol = node.tagShape.symbol; // node symbol
    symbol.getAttribute(NodeTypes.NodeBoxName).renderName = InOutRender;
    symbol.getAttribute(NodeTypes.NodeIconName).renderName = InOutRender;
    symbol.getAttribute(NodeTypes.NodeCaption).renderName = InOutRender;
    symbol.getAttribute(NodeTypes.NodeHeadName).renderName = node.execStatus+InOutRender;
  }
};

NodeTypes.updatePortRenders = function (port, InOutRender) {
  if (__not_null(port)) {
    var nodeSymbol = port.parentNode.tagShape.symbol;
    var portIcon = nodeSymbol.getAttribute(port.getTypeId());
    portIcon.renderName = InOutRender;
  }
};

NodeTypes.updateLinkRenders = function (link, linkRenders, inPortRenders, outPortRenders) {
  if (__not_null(link)) {
    link.tagShape.namedRenders = linkRenders;
    link.fromPtShape.symbol = outPortRenders;
    link.toPtShape.symbol = inPortRenders;
  }
};

NodeTypes.initNodeDrawing = function (geoNode) {
  var typedNode = geoNode.typedNode;

  // Here we define how to draw a node
  var nodeSymbol = typedNode.getNodeSymbol();

  var boxShadow = NodeTypes.createNodeShadow(nodeSymbol, typedNode.nodW, typedNode.nodH);
  var boxBkgnd = NodeTypes.createNodeBox(nodeSymbol, typedNode.nodW, typedNode.nodH);
  var boxHeader = NodeTypes.createNodeHead(nodeSymbol, typedNode.nodW, NodeTypes.GridSize);
  var nodeCaption = NodeTypes.createNodeCaption(nodeSymbol, typedNode, NodeTypes.GridSize);

  var icoNode = NodeTypes.createNodeIcon(nodeSymbol, typedNode.flowChart, typedNode);
  var icoEdit = NodeTypes.createEditIcon(nodeSymbol, typedNode.flowChart);
  var icoDrop = NodeTypes.createDropIcon(nodeSymbol, typedNode.flowChart);

  var d = (NodeTypes.GridSize - NodeTypes.NodeIconSize)/2; // (24-16)/2 = 4

  icoNode.offset(d, d);
  icoEdit.offset(typedNode.nodW - (NodeTypes.NodeIconSize+d)*2, d);
  icoDrop.offset(typedNode.nodW - NodeTypes.NodeIconSize-d, d);

  nodeSymbol.addShapes(icoNode, icoEdit, icoDrop, nodeCaption, boxHeader, boxBkgnd, boxShadow);
  nodeSymbol.updateBound();
};

// nodes config
//
NodeTypes.nodes = {
  "Assignment":{
    "nodeIcon": "node/x64/AssignmentNode.png"
  },
  "DefaultVal":{
    "nodeIcon": "node/x64/DefaultValNode.png"
  },
  "Dispatch":{
    "nodeIcon": "node/x64/DispatchNode.png"
  },
  "Feature":{
    "nodeIcon": "node/x64/FeatureNode.png"
  },
  "Geometry":{
    "nodeIcon": "node/x64/GeometryNode.png"
  },
  "GpAsync":{
    "nodeIcon": "node/x64/GpAsyncNode.png"
  },
  "GpSync":{
    "nodeIcon": "node/x64/GpSyncNode.png"
  },
  "PubInput":{
    "nodeIcon": "node/x64/PubInputNode.png"
  },
  "PubOutput":{
    "nodeIcon": "node/x64/PubOutputNode.png"
  }
};
/**
 * event handlers for elements of node symbol
 */
var EventHandlers = function () {
};

// static functions:
//
EventHandlers.nodeBoxHandler = function (e, mapCanvas, thisObject, trace) {
  // thisObject==boxBkgnd Shape
  var flowChart = mapCanvas.tag;
  var nodeSymbol = thisObject.tag;
  var thisNode = nodeSymbol.tag;

  if (e.type==="mousedown") {
    // mouse down on node to start pan it
    flowChart.startPanNode(thisNode);
  }
  else if (e.type==="mousemove") {
    if (flowChart.__lbtnDown) {
      mapCanvas.setCursor("move", e);
    }
    else {
      mapCanvas.setCursor("pointer");
    }
    flowChart.updateUI(e, thisNode);
  }
};

// triggered when port is drag-dropped
EventHandlers.nodePortHandler = function (e, mapCanvas, thisObject, trace) {
  var flowChart = mapCanvas.tag;
  if (flowChart.editor.readOnly) {
    return;
  }
  var port = thisObject.tag; // thisObject is port dot
  var thisNode = port.parentNode;
  var nodeSymbol = thisNode.tagShape.symbol;
  var portIcon = nodeSymbol.getAttribute(port.getTypeId());

  if (e.type === "mousedown") {
    flowChart.trackingLink.start(e, thisObject);
  }
  else if (e.type === "mouseup") {
    mapCanvas.setCursor("pointer");
    flowChart.trackingLink.end(e, thisObject);    
  }
  else if (e.type === "mousemove") {
    if (flowChart.trackingLink.isTracking()) {
      mapCanvas.setCursor("crosshair", e);
      flowChart.updateUI(e, thisNode);
    }
    else {
      mapCanvas.setCursor("pointer");
      flowChart.updateUI(e, thisNode, port);
    }
  }
};

// triggered when drop node icon is clicked
EventHandlers.editNodeHandler = function (e, mapCanvas, thisObject, trace) {
  var flowChart = mapCanvas.tag;
  var nodeSymbol = thisObject.tag;
  var thisNode = nodeSymbol.tag;

  mapCanvas.setCursor("pointer");
  if (e.type==="click") {
    flowChart.editor.showNodeDlg(thisNode);
  }
  else if (e.type==="mousemove") {
    flowChart.updateNodeElem(nodeSymbol.getAttribute(NodeTypes.NodeEditName));
  }
};

// triggered when drop node icon is clicked
EventHandlers.dropNodeHandler = function (e, mapCanvas, thisObject, trace) {
  var flowChart = mapCanvas.tag;
  if (flowChart.editor.readOnly) {
    return;
  }

  var nodeSymbol = thisObject.tag;
  var thisNode = nodeSymbol.tag;

  if (flowChart.trackingLink.isTracking()) {
    return;
  }
  mapCanvas.setCursor("pointer");
  if (e.type === "mousedown") {
    mapCanvas.setCursor("pointer");
    // delete this node and refresh node
    flowChart.dropNode(thisNode);
    mapCanvas.refresh(true, thisObject.bound);
  }
  else if (e.type==="mousemove") {
    flowChart.updateNodeElem(nodeSymbol.getAttribute(NodeTypes.NodeDropName));
  }
};

EventHandlers.nodeLinkHandler = function (e, mapCanvas, linkShape, trace) {
  var flowChart = mapCanvas.tag;
  if (flowChart.editor.readOnly) {
    return;
  }
  if (__not_null(flowChart.__panMap) || __not_null(flowChart.__panNode)) {
    return;
  }
  mapCanvas.setCursor("pointer");
  if (e.type==="mousemove") {
    if (flowChart.trackingLink.isTracking()) {
      return;
    }
    // create a cut link button near this position
    if (!flowChart.linkCutter.cutter.visible) {
      flowChart.linkCutter.show(e, mapCanvas, linkShape.tag);
    }
    flowChart.updateUI(e, null, null, linkShape.tag);
  }
};

/**
 * GeoFlow class
 */
var GeoFlow = function (flowEditor) {
  this._init(flowEditor);
};

GeoFlow.prototype._init = function (flowEditor) {
  this.editor = flowEditor;

  this.mapCanvas = null;
  this.nodeLayer = null;
  this.linkLayer = null;

  this.trackingLink = null;
  this.linkCutter = null;

  this.linkRenders = null;

  this.__lbtnDown = false;

  this.__selNode = null;
  this.__selPort = null;
  this.__selLink = null;
  this.__selNodeElem = null;

  this.__panNode = null;
  this.__panMap = null;
  this.__posX = 0;
  this.__posY = 0;

  this.__nodes = new esri2.Common.PairArray(); // all nodes in flowchart
  this.__nodes.insert(0, null); // the first is invalid node

  this.__links = new esri2.Common.PairArray(); // all links in flowchart
  this.__links.insert(0, null); // the first is invalid link

  // tracking link and port shapes
  this.linkShape = new esri2.Map.Shape();
  this.portShape = new esri2.Map.Shape();
};

GeoFlow.prototype.init = function(mapCanvas, imageLoader) {
  this.mapCanvas = mapCanvas;
  this.imagesLib = imageLoader; // store all images to be used

  this.trackingLink = new GeoFlow.TrackingLink(this);
  this.linkCutter = new GeoFlow.LinkCutter(this);

  if (__is_null(mapCanvas) || !mapCanvas.supportCanvas()) {
    throw new Error("GeoFlow.init: invalid MapCanvas object");
  }
  this.mapCanvas.tag = this; // get flowchart from mapCanvas

  // bkgndColor can be ignored when bkgndImage is valid
  mapCanvas.bkgndColor = "#fafafa";

  // add layers: node, link
  //
  this.linkLayer = mapCanvas.addLayer("LinkLayer");
  this.nodeLayer = mapCanvas.addLayer("NodeLayer");

  // create renders for drawing normal link
  this.linkLayer.addAttribute("LinkRenders", NodeTypes.createLinkRenders());
  this.linkLayer.addAttribute("LinkSelRenders", NodeTypes.createLinkSelRenders());

  // create port symbols
  //
  mapCanvas.addAttribute(NodeTypes.OutPortSel, NodeTypes.createPortSymbol(NodeTypes.OutPortSel, this.imagesLib));
  mapCanvas.addAttribute(NodeTypes.OutPortUnsel, NodeTypes.createPortSymbol(NodeTypes.OutPortUnsel, this.imagesLib));
  mapCanvas.addAttribute(NodeTypes.OutPortLinked, NodeTypes.createPortSymbol(NodeTypes.OutPortLinked, this.imagesLib));

  mapCanvas.addAttribute(NodeTypes.InPortSel, NodeTypes.createPortSymbol(NodeTypes.InPortSel, this.imagesLib));
  mapCanvas.addAttribute(NodeTypes.InPortUnsel, NodeTypes.createPortSymbol(NodeTypes.InPortUnsel, this.imagesLib));
  mapCanvas.addAttribute(NodeTypes.InPortLinked, NodeTypes.createPortSymbol(NodeTypes.InPortLinked, this.imagesLib));

  // tracking link shape
  this.linkShape.namedRenders = this.linkLayer.getAttribute("LinkSelRenders");
  this.linkShape.useAllRender();

  // tracking port shape
  this.portShape.createPoint(0, 0, 0);

  // refresh canvas drawing
  mapCanvas.updateBound();
  mapCanvas.zoomAll(1);
  mapCanvas.refresh(true);
};

GeoFlow.prototype.toString = function () {
  return "GeoFlow class";
};

GeoFlow.prototype.createNode = function (nodeId, nodeType, posX, posY, nodeJSON) {
  __log("GeoFlow.createNode: ", nodeType, posX, posY);
  if (this.__nodes.size() > NodeTypes.MaxNodes) {
    throw new Error("GeoFlow.createNode: exceed max nodes: " + NodeTypes.MaxNodes);
  }

  // create a point shape where to place the node
  var nodePoint = new esri2.Map.Shape();
  var gt = this.getGridXY(posX, posY);
  var pt = this.mapCanvas.toMapPoint(gt.x * NodeTypes.GridSize, gt.y * NodeTypes.GridSize);

  // create point at grid point
  nodePoint.createPoint(pt.x, pt.y, 0);

  // create a GeoNode binding with nodePoint
  var id = __is_null(nodeId)? this.__nodes.genKey(): nodeId;
  var newNode = GeoNode.create(id, nodeType, nodePoint, this, nodeJSON);
  if (__not_null(newNode) && newNode.isValid()) {
    // insert node by id
    this.__nodes.insert(newNode.id, newNode);

    // DO NOT call: this.mapCanvas.updateBound();
    this.nodeLayer.addShape(nodePoint);
    this.nodeLayer.updateBound();
  }

  return newNode;
};

GeoFlow.prototype.addLink = function(fromPort, toPort, autoAddPort) {
  var newLink = GeoLink.create(this.__links.genKey(), fromPort, toPort);

  if (__not_null(newLink)) {
    // add link shape
    var linkShape = newLink.update(this.mapCanvas);

    linkShape.selectable = true; // true for selectable
    linkShape.eventHandler = EventHandlers.nodeLinkHandler;
    linkShape.namedRenders = this.linkLayer.getAttribute("LinkRenders");
    linkShape.useAllRender();

    this.linkLayer.addShapes(linkShape, newLink.toPtShape, newLink.fromPtShape);

    this.linkLayer.updateBound();
    this.__links.insert(newLink.id, newLink);

    var bAddPort = (__is_null(autoAddPort) || __is_true(autoAddPort));
    
    if (__not_null(newLink.fromNode.typedNode.updateOutPort)) {
      newLink.fromNode.typedNode.updateOutPort(newLink, bAddPort);
    }
    if (__not_null(newLink.toNode.typedNode.updateInPort)) {
      newLink.toNode.typedNode.updateInPort(newLink, true);
    }
  }

  // DONOT call: this.mapCanvas.updateBound();
  return newLink;
};

GeoFlow.prototype.cutLink = function (link) {
  link.fromNode.removePort(link.fromPort);
  link.toNode.removePort(link.toPort);
  link.detachPorts();
  GeoLink.removeFromLayer(this.linkLayer, link);
  this.__links.erase(link.id);
};

GeoFlow.prototype.getNodeLinks = function (node) {
  var link,
      links = [],
      at = this.__links.size();
  while (at-- > 1) {
    link = this.__links.getVal(at);
    if (link.fromNode===node || link.toNode===node) {
      links.push(link);
    }
  }
  return links;
};

GeoFlow.prototype.clear = function() {
  while(this.__nodes.size() > 1) {
    this.dropNode(this.__nodes.getVal(1), true);
  }
  this.nodeLayer.updateBound();
  this.linkLayer.updateBound();
};

GeoFlow.prototype.dropNode = function (node, isClear) {
  node.removeLinks(node.getAllLinks(), isClear);

  // remove node shape tagged with node
  this.nodeLayer.removeAt(node.tagShape);
  this.__nodes.erase(node.id);

  if (isClear!==true) {
    this.nodeLayer.updateBound();
    this.sortNodesOrder(NodeTypes.NodePubInput);
    this.sortNodesOrder(NodeTypes.NodePubOutput);
  }
};

GeoFlow.prototype.updateLinks = function (node) {
  var link, links = this.getNodeLinks(node);
  while ((link=links.pop())!==undefined) {
    link.update(this.mapCanvas);
  }
  this.linkLayer.updateBound();
};

GeoFlow.prototype.sortNodesOrder = function (nodeType) {
  var at, node, nodes=[], size = this.__nodes.size();
  for (at=1; at<size; at++) {
    node = this.nodeItem(at);
    if (node.getTypeName()===nodeType) {
      nodes.push(node);
    }
  }
  size = nodes.length;
  for (at=0; at<size; at++) {
    node = nodes[at];
    if (node.typedNode.orderNumb !== (at+1)) {
      node.typedNode.updateOrderNumb(at+1);
    }
  }
  // return next orderNumb
  return size+1;
};

GeoFlow.prototype.getNodeCount = function () {
  return this.__nodes.size() - 1;
};

GeoFlow.prototype.getNodeById = function (nodeId) {
  var at = this.__nodes.find(nodeId);
  if (at !== ERRINDEX) {
    return this.__nodes.getVal(at);
  }
  return null;
};

GeoFlow.prototype.getGridXY = function (mouseX, mouseY) {
  // Get grid id
  return new esri2.Common.PointType(Math.floor(mouseX/NodeTypes.GridSize),
    Math.floor(mouseY/NodeTypes.GridSize));
};

GeoFlow.prototype.snapGrid = function (shape) {
  var pt = shape.points[0];
  var pos = this.mapCanvas.toViewPos(pt.x, pt.y);
  var gt = this.getGridXY(pos.x, pos.y);
  var pt2 = this.mapCanvas.toMapPoint(gt.x*NodeTypes.GridSize, gt.y*NodeTypes.GridSize);
  shape.offset(pt2.x-pt.x, pt2.y-pt.y);
};

GeoFlow.prototype.addRender = function (renders, name, opt_tag) {
  var at = renders.find(name);
  if (at === ERRINDEX) {
    var render = new esri2.Map.Render(name, opt_tag);
    renders.insert(render.name, render);
    return render;
  }
  else {
    return renders.getVal(at);
  }
};

GeoFlow.prototype.nodeItem = function (at /* 1-based */) {
  if (at<=0 || at>=this.__nodes.size()) {
    throw new Error("invalid node index");
  }
  return this.__nodes.getVal(at);
};

GeoFlow.prototype.linkItem = function (at) {
  if (at<=0 || at>=this.__links.size()) {
    throw new Error("invalid link index");
  }
  return this.__links.getVal(at);    
};

GeoFlow.prototype.updateState = function(flowJobId, flowJobJSON) {
  __log("??TODO: check flowJobId with flowChart!!");
  __log("GeoFlow.updateState, job: ", flowJobId);

  var nodeId, nodeStatus, nodeState;

  for (nodeId in flowJobJSON) {
    nodeStatus = flowJobJSON[nodeId];

    nodeState = new GeoNode.EditState(this.getNodeById(nodeId));
    nodeState.execStatus = nodeStatus.execStatus;
    nodeState.errMessage = nodeStatus.errMessage;

    if (nodeState.isValid()) {
      nodeState.update();
    }
  }
};

//
// Mouse Events
//
GeoFlow.prototype.setMousePos = function (e) {
  this.__posX = e._x;
  this.__posY = e._y;
};

GeoFlow.prototype.startPanMap = function () {
  this.endPanNode();
  this.__panMap = this.mapCanvas.toMapPoint(0, 0);
};

GeoFlow.prototype.panningMap = function (e) {
  if (__not_null(this.__panMap)) {
    this.mapCanvas.panView(this.__posX, this.__posY, e._x, e._y);
    this.setMousePos(e);
    this.mapCanvas.refresh(false); // must set false when panning map
    return true;
  }
  return false;
};

GeoFlow.prototype.endPanMap = function (e) {
  var needRefresh = this.endPanNode();

  var p0 = this.__panMap;
  this.__panMap = null;
  if (__not_null(p0)) {
    this.mapCanvas.panView(this.__posX, this.__posY, e._x, e._y);
    // snap to grid
    p0 = this.mapCanvas.toViewPos(p0.x, p0.y);
    var p2 = this.getGridXY(p0.x, p0.y);
    p2.x *= NodeTypes.GridSize;
    p2.y *= NodeTypes.GridSize;
    this.mapCanvas.panView(p0.x, p0.y, p2.x, p2.y);
    needRefresh = true;
  }
  if (needRefresh) {
    this.mapCanvas.refresh(true);
  }
  return needRefresh;
};

GeoFlow.prototype.panningNode = function (e) {
  // test if a node is being panned
  if (__not_null(this.__panNode)){
    // panning shape: add new pos and return old one
    var p0 = this.mapCanvas.toMapPoint(this.__posX, this.__posY),
        p = this.mapCanvas.toMapPoint(e._x, e._y);
    this.setMousePos(e);
    this.__panNode.tagShape.offset(p.x-p0.x, p.y-p0.y);

    // update all links connected to the panning node
    var link, links = this.getNodeLinks(this.__panNode);
    while ((link=links.pop()) !== undefined) {
      link.update(this.mapCanvas);
    }

    // only update and refresh tracking layer
    this.mapCanvas.trackingLayer.updateBound();
    this.mapCanvas.refreshTrackingLayer();
    return true;
  }
  return false;
};

GeoFlow.prototype.hitOnShape = function (e) {
  var hit = this.mapCanvas.fastHitTest(e._x, e._y, e);
  if (__not_null(hit) && hit.valid) {
    return hit.shape;
  }
  return null;
};

// move node with links into trackingLayer
GeoFlow.prototype.startPanNode = function (thisNode) {
  if (__is_null(thisNode)) {
    __log("startPanNode error: null node");
    return false;
  }

  this.nodeLayer.removeAt(thisNode.tagShape);
  this.mapCanvas.trackingLayer.addShape(thisNode.tagShape);

  var link, links = this.getNodeLinks(thisNode);
  while ((link=links.pop()) !== undefined) {
    GeoLink.insertIntoLayer(this.mapCanvas.trackingLayer, link);
    GeoLink.removeFromLayer(this.linkLayer, link);
  }

  this.__panNode = thisNode;
  this.mapCanvas.trackingLayer.updateBound();
  this.mapCanvas.refresh(false, thisNode.tagShape);
  return true;
};

GeoFlow.prototype.endPanNode = function () {
  var node = this.__panNode;
  this.__panNode = null;
  if (__is_null(node)) {
    return false;
  }
  // snap node point to the grid
  this.snapGrid(node.tagShape);
  // move node from trackingLayer to nodeLayer
  this.nodeLayer.addShape(node.tagShape);
  // move links from trackingLayer to link layer
  var link, links = this.getNodeLinks(node);
  while ((link=links.pop()) !== undefined) {
    link.update(this.mapCanvas);
    GeoLink.insertIntoLayer(this.linkLayer, link);
  }
  this.mapCanvas.trackingLayer.removeAll();
  this.nodeLayer.updateBound();
  return true;
};

GeoFlow.prototype.selectNode = function (newNode) {
  var oldNode = this.__selNode;
  this.__selNode = newNode;
  return oldNode;
};

GeoFlow.prototype.selectPort = function (newPort) {
  var oldPort = this.__selPort;
  this.__selPort = newPort;
  return oldPort;
};

GeoFlow.prototype.selectLink = function (newLink) {
  var oldLink = this.__selLink;
  this.__selLink = newLink;
  return oldLink;
};

GeoFlow.prototype.updateNodeElem = function (inElem, stopRefresh) {
  var ret = false;
  var outElem = this.__selNodeElem;
  this.__selNodeElem = inElem;

  if (outElem!==inElem) {
    if (__not_null(outElem)) {
      if (!this.editor.readOnly || outElem.getAttribute("NAME")!==NodeTypes.NodeDropName) {
        outElem.renderName = NodeTypes.OutRender;
        ret = true;
      }
    }
    if (__not_null(inElem)) {
      if (!this.editor.readOnly || inElem.getAttribute("NAME")!==NodeTypes.NodeDropName) {
        inElem.renderName = NodeTypes.InRender;
        ret = true;
      }
    }
  }
  if (ret && stopRefresh!==true) {
    this.mapCanvas.refresh(false);
  }
  return ret;
};

GeoFlow.prototype.updateUI = function (e, inNode, inPort, inLink) {
  var ret = this.updateNodeElem(null, true);

  // update node
  var outNode = this.selectNode(inNode);
  if (outNode !== inNode) {
    if (__not_null(inNode)) {
      NodeTypes.updateNodeRenders(inNode, NodeTypes.InRender);
      ret = true;
    }
    if (__not_null(outNode)) {
      NodeTypes.updateNodeRenders(outNode, NodeTypes.OutRender);
      ret = true;
    }
  }

  // update port
  var outPort = this.selectPort(inPort);
  if (outPort !== inPort) {
    if (__not_null(inPort)) {
      NodeTypes.updatePortRenders(inPort, NodeTypes.InRender);
      ret = true;
    }
    if (__not_null(outPort)) {
      NodeTypes.updatePortRenders(outPort, NodeTypes.OutRender);
      ret = true;
    }
  }

  // update link
  var outLink = this.selectLink(inLink);
  if (outLink !== inLink) {
    if (__not_null(inLink)) {
      NodeTypes.updateLinkRenders(inLink,
        this.linkLayer.getAttribute("LinkSelRenders"),
        this.mapCanvas.getAttribute(NodeTypes.InPortSel),
        this.mapCanvas.getAttribute(NodeTypes.OutPortSel));
      ret = true;
    }
    if (__not_null(outLink)) {
      NodeTypes.updateLinkRenders(outLink,
        this.linkLayer.getAttribute("LinkRenders"),
        this.mapCanvas.getAttribute(NodeTypes.InPortLinked),
        this.mapCanvas.getAttribute(NodeTypes.OutPortLinked));
      ret = true;
    }
  }

  if (ret) {
    this.mapCanvas.refresh(false);
  }
};

GeoFlow.prototype.invokeEventHandler = function (e, mapCanvas) {
  switch (e.type) {
  case "click":
    this.__lbtnDown = false;

    // always abort when mouse click
    this.trackingLink.abort();

    // linkCutter is in trackingLayer which can NOT hit test
    if (this.linkCutter.onClick(e, mapCanvas)) {
      return;
    }

    this.hitOnShape(e);
    break;

  case "mousemove":
    if (this.panningNode(e) || this.panningMap(e)) {
      return;
    }
    // NOT panning, test if tracking link
    if (this.trackingLink.isTracking()) {
      this.trackingLink.tracking(e);
      if (__is_null(this.hitOnShape(e))) {
        this.updateUI(e);
      }
      mapCanvas.setCursor("move", e);
      return;
    }
    // test mouse position when there is no action
    this.mapCanvas.setCursor("default");
    if (__is_null(this.hitOnShape(e))) {
      this.updateUI(e);
    }
    break;

  case "mousedown":
    this.__lbtnDown = true;
    mapCanvas.setCursor("move", e);
    this.endPanMap(e);
    this.setMousePos(e);
    if (__is_null(this.hitOnShape(e))) {
      // hit nothing, begin panning canvas 
      this.startPanMap();
    }
    break;

  case "mouseup":
    this.__lbtnDown = false;
    mapCanvas.setCursor("default");
    if (this.endPanMap(e)) {
      return;
    }
    if (this.trackingLink.isTracking()) {
      this.hitOnShape(e);
      this.trackingLink.abort(); // always abort when mouse up
    }
    break;
  }
};

GeoFlow.prototype.loadJSON = function (json) {
  __log("GeoFlow.loadJSON...");

  var nodes = json.knots;
  if (__is_null(nodes)) {
    throw new Error("GeoFlow.loadJSON error: knots not found");
  }

  var links = json.links;
  if (__is_null(links)) {
    throw new Error("GeoFlow.loadJSON error: links not found");
  }

  // load nodes
  var nodeId, node, geoNode, portName, port, geoPort;
  for (nodeId in nodes) {
    node = nodes[nodeId];
    __log("load node: ", node.name, node.type);

    geoNode = this.createNode(nodeId, node.type, node.posX, node.posY, node);
    if (__is_null(geoNode)) {
      throw new Error("GeoFlow.loadJSON error: createNode exception");
    }
  }

  var at,
      val,
      valNodes={},
      internalValues = json.internalValues;

  if (__not_null(internalValues)) {
    __log("load internalValues");
    for (at=0; at<internalValues.length; at++) {
      val = internalValues[at];
      if (valNodes[val.id]===undefined) {
        valNodes[val.id] = new Array(0);
      }
      valNodes[val.id].push(val);
    }

    for (nodeId in valNodes) {
      val = valNodes[nodeId]; // val is array of ports
      this.createNode(val[0].id, NodeTypes.NodeDefaultVal, val[0].posX, val[0].posY, val);
    } 
  }

  var pubInputs = json.pubInputs;
  if (__not_null(pubInputs)) {
    __log("load pubInputs");
    for (nodeId in pubInputs) {
      node = pubInputs[nodeId];
      this.createNode(node.id, NodeTypes.NodePubInput, node.posX, node.posY, node);
    }
  }

  var pubOutputs = json.pubOutputs;
  if (__not_null(pubOutputs)) {
    __log("load pubOutputs");
    for (nodeId in pubOutputs) {
      node = pubOutputs[nodeId];
      this.createNode(node.id, NodeTypes.NodePubOutput, node.posX, node.posY, node);
    }
  }

  // load links
  var i, link, fromNode, toNode, fromPort, toPort;
  for (i=0; i<links.length; i++) {
    link = links[i];
    __log("load link: ", link.fromPortName, link.toPortName);

    fromNode = this.getNodeById(link.fromKnotId);
    if (__is_null(fromNode)) {
      throw new Error("GeoFlow.loadJSON error: link has no fromNode");
    }

    toNode = this.getNodeById(link.toKnotId);
    if (__is_null(toNode)) {
      throw new Error("GeoFlow.loadJSON error: link has no toNode");
    }

    fromPort = fromNode.getOutPortById(link.fromPortName);
    if (__is_null(fromPort)) {
      throw new Error("GeoFlow.loadJSON error: link has no fromPort");
    }

    toPort = toNode.getInPortById(link.toPortName);
    if (__is_null(fromPort)) {
      throw new Error("GeoFlow.loadJSON error: link has no toPort");
    }

    this.addLink(fromPort, toPort, false);
  }
};

GeoFlow.prototype.validate = function() {
  // check all nodes to find if there are suspension nodes
  var at, node, size = this.__nodes.size();
  for (at=1; at<size; at++) {
    node = this.nodeItem(at);
    node.validate();
  }

  // check if there are looped links
  
};

GeoFlow.prototype.toJsonString = function(opt_validate) {
  var
    at,
    size = 0,
    node = null,
    link = null,
    json = "",
    nodeType,
    lastChar
  ;
  var validate = ( __is_null(opt_validate) || __is_true(opt_validate) )? true : false;

  json += "{\n";

  // knots
  json += __quot_str("knots");
  json += ":{";
  size = this.__nodes.size();
  for (at = 1; at < size; at++) {
    node = this.nodeItem(at);
    if (node.isValid()) {
      nodeType = node.getTypeName();
      if (nodeType===NodeTypes.NodeAssignment ||
        nodeType===NodeTypes.NodeDispatch ||
        nodeType===NodeTypes.NodeFeature ||
        nodeType===NodeTypes.NodeGeometry ||
        nodeType===NodeTypes.NodeGpAsync ||
        nodeType===NodeTypes.NodeGpSync ) {
        lastChar = json.charAt(json.length-1);
        if (lastChar==='{') {
          json += "\n";
        }
        else if (lastChar==='}') {
          json += ",\n";
        }
        json += node.toJsonString();
      }
    }
  }
  json += "\n},\n";

  // out links
  json += __quot_str("links");
  json += ":[";
  size = this.__links.size();
  for (at = 1; at < size; at++) {
    link = this.linkItem(at);
    if (!link.ignoredNode()) {
      lastChar = json.charAt(json.length-1);
      if (lastChar==='[') {
        json += "\n";
      }
      else if (lastChar==='}') {
        json += ",\n";
      }
      json += link.toJsonString();
    }
  }
  json += "\n],\n";

  // internalValues
  json += __quot_str("internalValues");
  json += ":[";
  size = this.__nodes.size();
  for (at = 1; at < size; at++) {
    node = this.nodeItem(at);
    if (node.isValid()) {
      if (node.getTypeName()===NodeTypes.NodeDefaultVal &&
          node.typedNode.isValid()) {
        lastChar = json.charAt(json.length-1);
        if (lastChar==='[') {
          json += "\n";
        }
        else if (lastChar==='}') {
          json += ",\n";
        }
        json += node.toJsonString();
      }
    }
  }
  json += "\n],\n";

  // pubInputs
  json += __quot_str("pubInputs");
  json += ":{";
  size = this.__nodes.size();
  for (at = 1; at < size; at++) {
    node = this.nodeItem(at);
    if (node.isValid()) {
      if (node.getTypeName()===NodeTypes.NodePubInput) {
        lastChar = json.charAt(json.length-1);
        if (lastChar==='{') {
          json += "\n";
        }
        else if (lastChar==='}') {
          json += ",\n";
        }
        json += node.toJsonString();
      }
    }
  }
  json += "\n},\n";

  // pubOutputs
  json += __quot_str("pubOutputs");
  json += ":{";
  size = this.__nodes.size();
  for (at = 1; at < size; at++) {
    node = this.nodeItem(at);
    if (node.isValid()) {
      if (node.getTypeName()===NodeTypes.NodePubOutput) {
        lastChar = json.charAt(json.length-1);
        if (lastChar==='{') {
          json += "\n";
        }
        else if (lastChar==='}') {
          json += ",\n";
        }
        json += node.toJsonString();
      }
    }
  }
  json += "\n}\n}";
  return json;
};

/**
 * GeoFlow.TrackingLink class
 */
GeoFlow.TrackingLink = function (flowChart) {
  this.flowChart = flowChart;
  this.startPort = null;
  this.matchedPorts = [];  // array of MatchPortState
};

// MatchPortState
//
GeoFlow.TrackingLink.MatchPortState = function (port) {
  this._init(port);
};

GeoFlow.TrackingLink.MatchPortState.prototype._init = function (port) {
  this.port = port;
  this.portShape = this.port.getIconShape();
  this.savedRender = this.portShape.renderName;
  this.portShape.renderName = NodeTypes.InRender;
};

GeoFlow.TrackingLink.MatchPortState.prototype.restore = function () {
  this.portShape.renderName = this.savedRender;
};

GeoFlow.TrackingLink.prototype = {
  _addLinkShape : function (startPt, endPt) {
    var linkShape = this.flowChart.linkShape;
    if (startPt.x > endPt.x) {
      linkShape.createBezier(startPt, endPt,
        new esri2.Map.Point(startPt.x, endPt.y), new esri2.Map.Point(endPt.x, startPt.y));
    }
    else {
      linkShape.createBezier(startPt, endPt);
    }
    this.flowChart.mapCanvas.trackingLayer.addShape(linkShape);
  },

  _addPortShape : function (pt) {
    var portShape = this.flowChart.portShape;
    portShape.points[0].x = pt.x;
    portShape.points[0].y = pt.y;
    portShape.updateBound();

    if (this.startPort.type==="IN") {
      portShape.symbol = this.flowChart.mapCanvas.getAttribute(NodeTypes.InPortSel);
    }
    else {
      portShape.symbol = this.flowChart.mapCanvas.getAttribute(NodeTypes.OutPortSel);
    }

    this.flowChart.mapCanvas.trackingLayer.addShape(portShape);
  },

  _isMatchedPort : function (endPort) {
    for (var i=0; i<this.matchedPorts.length; i++) {
      if (endPort===this.matchedPorts[i].port) {
        return true;
      }
    }
    return false;
  },

  _getMatchedPorts : function (port) {
    var item, items = this.flowChart.getNodeCount();
    for (item=1; item<=items; item++) {
      var node = this.flowChart.nodeItem(item);
      var mp, ports = node.getMatchedPorts(port);
      while ((mp=ports.pop()) !== undefined) {
        this.matchedPorts.push(new GeoFlow.TrackingLink.MatchPortState(mp));
      }
    }
  },

  _addMatchedShapes : function () {
    for (var i=0; i<this.matchedPorts.length; i++) {
      this.flowChart.mapCanvas.trackingLayer.addShape(this.matchedPorts[i].portShape);
    }
  },

  _clearPorts : function () {
    this.startPort = null;

    // clear match ports
    var mpState;
    while ((mpState=this.matchedPorts.pop())!==undefined) {
      mpState.restore();
    }

    // clear tracking layer
    this.flowChart.mapCanvas.trackingLayer.removeAll();
    this.flowChart.mapCanvas.trackingLayer.updateBound();
  },

  isTracking : function () {
    return __not_null(this.startPort);
  },

  getStartPos : function () {
    return this.startPort.getPosition(this.flowChart.mapCanvas);
  },

  tracking : function (e) {
    var startPos = this.getStartPos();
    var startPt = this.flowChart.mapCanvas.toMapPoint(startPos.x, startPos.y);
    var endPt = this.flowChart.mapCanvas.toMapPoint(e._x, e._y);

    // add current link shape to tracking layer
    this.flowChart.mapCanvas.trackingLayer.removeAll();

    this._addLinkShape(startPt, endPt);
    this._addPortShape(startPt);
    this._addMatchedShapes();

    this.flowChart.mapCanvas.trackingLayer.updateBound();
    this.flowChart.mapCanvas.refreshTrackingLayer();
  },

  start : function (e, portShape) {
    // start track, check if port can be tracked
    var port = portShape.tag;
    if (__not_null(port.getNextLink())) {
      return;
    }
    this._getMatchedPorts(port);
    this.startPort = port;    
  },

  end : function (e, portShape) {
    var startPort = this.startPort;
    var endPort = portShape.tag;

    // check if endPort is in matchedPorts
    var ret = this._isMatchedPort(endPort);

    this._clearPorts();

    // add a link to flow chart
    if (ret) {
      var newLink = this.flowChart.addLink(startPort, endPort);
      ret = __not_null(newLink);
    }

    this.flowChart.mapCanvas.refresh(ret);
  },

  abort : function () {
    if (__not_null(this.startPort)) {
      this._clearPorts();
      this.flowChart.mapCanvas.refresh(false);
    }
  }
};

/**
 * GeoFlow.LinkCutter class
 */
GeoFlow.LinkCutter = function (flowChart) {
  this.flowChart = flowChart;
  this.link = null;

  this.cutter = new esri2.Map.Shape(this); // cutter point
  this.cutter.visible = false;
  this.cutter.createPoint(0, 0);

  this.cutter.symbol = new esri2.Map.Symbol(NodeTypes.LinkCutter, this.cutter);

  var cutIcon = NodeTypes.createIconRect(this.cutter.symbol, this.cutter.symbol,
        NodeTypes.LinkCutter,
        this.flowChart.imagesLib.getImage(NodeTypes.LinkCutter),
        this.flowChart.imagesLib.getImage(NodeTypes.LinkCutter),
        false, null,
        NodeTypes.CutterSize, NodeTypes.CutterSize);

  this.cutter.symbol.addShape(cutIcon);
  this.cutter.symbol.symbolUnit.baseX = 20;
  this.cutter.symbol.symbolUnit.baseY = 20;
  this.cutter.symbol.updateBound();
};

GeoFlow.LinkCutter.TimeOutMSec = 2000;

GeoFlow.LinkCutter.hide = function (cutter, mapCanvas) {
  cutter.visible = false;
  mapCanvas.refreshTrackingLayer(cutter);
};

GeoFlow.LinkCutter.__hide = function (cutter, mapCanvas) {
  return function () {
    GeoFlow.LinkCutter.hide(cutter, mapCanvas);
  };
};

GeoFlow.LinkCutter.prototype = {
  onClick : function (e, mapCanvas) {
    if (this.cutter.visible) {
      this.cutter.visible = false;

      var rcCutter = this.cutter.bound.rect;
      var p1 = mapCanvas.toViewPos(rcCutter.xmin, rcCutter.ymin);
      var p2 = mapCanvas.toViewPos(rcCutter.xmax, rcCutter.ymax);
      rcCutter = new esri2.Common.RectType(p1.x, p2.y, p2.x, p2.y);
      rcCutter.xmax += NodeTypes.CutterSize;
      rcCutter.ymax += NodeTypes.CutterSize;

      var symbUnit = this.cutter.symbol.symbolUnit;
      rcCutter.offset(-symbUnit.baseX, -symbUnit.baseY);

      if (rcCutter.ptInRect(e._x, e._y)) {
        var delLink = this.link;
        this.link = null;
        this.flowChart.cutLink(delLink);
        this.flowChart.linkLayer.updateBound();
        mapCanvas.refresh(true);
        return true;
      }

      mapCanvas.refreshTrackingLayer(this.cutter);
    }
    return false;
  },

  show : function (e, mapCanvas, link) {
    if (this.cutter.visible===false) {
      this.link = link;
      this.cutter.visible = true;
      this.cutter.points[0] = mapCanvas.toMapPoint(e._x, e._y);
      this.cutter.updateBound();

      if ( __is_null(mapCanvas.trackingLayer.findShape(this.cutter)) ) {
        mapCanvas.trackingLayer.addShape(this.cutter);
        mapCanvas.trackingLayer.updateBound();
      }
      mapCanvas.refreshTrackingLayer(this.cutter);
      setTimeout(GeoFlow.LinkCutter.__hide(this.cutter, mapCanvas), GeoFlow.LinkCutter.TimeOutMSec);
    }
  }
};

/**
 * GeoNode class
 *     __________________
 *    |<+> nodeName   ! X| NodeHead
 *    |------------------|
 * o--| inport1          |  <- NodeBox
 * o--| inport2          |
 * o--| ...              |
 *    |         outport1 |--0
 *    |         ...      |--0
 *    |         errport1 |--e
 *    |__________________|
 */
var GeoNode = function (id, nodePoint, flowChart) {
  this._init(id, nodePoint, flowChart); 
};

GeoNode.DefaultStatus = "";
GeoNode.InitializedStatus = "initialized";
GeoNode.SucceededStatus = "succeeded";
GeoNode.FailedStatus = "failed";
GeoNode.RunningStatus = "running";
GeoNode.PausedStatus = "paused";

GeoNode.create = function (nodeId, nodeType, nodePoint, flowChart, nodeJSON) {
  // create a GeoNode binding with nodePoint
  var newNode = new GeoNode(nodeId, nodePoint, flowChart);

  switch (nodeType) {
  case NodeTypes.NodeAssignment:
    Assignment.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodeDispatch:
    Dispatch.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodeGeometry:
    Geometry.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodeFeature:
    Feature.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodeGpAsync:
    GpAsync.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodeGpSync:
    GpSync.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodeDefaultVal:
    DefaultVal.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodePubInput:
    PubInput.create(newNode, nodeJSON);
    break;
  case NodeTypes.NodePubOutput:
    PubOutput.create(newNode, nodeJSON);
    break;
  }
  if (__is_null(newNode.typedNode)) {
    throw new Error("GeoNode.create: invalid node type: " + nodeType);
  }

  return newNode;
};

/**
 * GeoNode.EditState
 */
GeoNode.EditState = function (thisNode) {
  this.currentNode = thisNode;

  this.nodeJSON = null;
  this.nodeURL = null;

  this.execStatus = GeoNode.DefaultStatus;
  this.errMessage = "";
};

GeoNode.EditState.prototype.isValid = function () {
  return __not_null(this.currentNode);
};

GeoNode.EditState.prototype.update = function () {
  this.currentNode.updateState(this);
};

/**
 * GeoNode.prototype
 */
GeoNode.prototype = {
  _init : function (id, nodePoint, flowChart) {
    this.id = id;                // auto generating
    this.tagShape = nodePoint;
    this.tagShape.tag = this;    // to get GeoNode from a node point
    this.flowChart = flowChart;
    this.typedNode = null;

    this.name = "";
    this.displayName = this.name;
    this.url = "";

    this.execStatus = GeoNode.DefaultStatus;
    this.errMessage = "";

    // ports array  
    this.inports = new esri2.Common.PairArray();
    this.outports = new esri2.Common.PairArray();

    // always abandon the 1st element
    this.inports.insert("-1", null);
    this.outports.insert("-1", null);

    this.serviceName = "";
    this.serviceStates = {};

    this.validateResult = "";
  },

  toString : function () {
    return ("GeoNode class");
  },

  getTypeName : function () {
    return this.isValid()? this.typedNode.toString() : "Undefined";
  },

  isDefaultStatus : function () {
    return (this.execStatus===GeoNode.DefaultStatus);
  },

  getStatusColor : function () {
    switch(this.execStatus) {
    case GeoNode.InitializedStatus:
      return "#6AE8DB";
    case GeoNode.SucceededStatus:
      return "#34B14C";
    case GeoNode.FailedStatus:
      return "#ED1C24";
    case GeoNode.RunningStatus:
      return "#00A2E8";
    case GeoNode.PausedStatus:
      return "#FF7F27";
    default:
      return "#888";
    }
  },

  getTitle : function () {
    return this.getTypeName()+" Node ("+this.id+") - " + this.typedNode.getDisplayName();
  },

  setServiceState : function (svcName, stateHTML) {
    this.serviceName = svcName;
    this.serviceStates[this.serviceName] = stateHTML;
  },

  getServiceState : function () {
    var stateHTML = this.serviceStates[this.serviceName];
    if (__is_null(stateHTML)) {
      stateHTML = "";
    }
    return stateHTML;
  },

  isValid : function () {
    return (__not_null(this.typedNode));
  },

  getInPort : function (at) {
    if (__is_null(at)) {
      return this.inports.size()-1;
    }
    // get port item by at: 1=based
    if (at<1 || at>=this.inports.size()) {
      return null;
    }
    return this.inports.getVal(at);
  },

  getOutPort : function (at) {
    if (__is_null(at)) {
      return this.outports.size()-1;
    }
    if (at<1 || at>=this.outports.size()) {
      return null;
    }
    return this.outports.getVal(at);     
  },

  getInPortById : function (portId) {
    var at = this.inports.find(portId);
    if (at !== ERRINDEX) {
      return this.inports.getVal(at);
    }
    return null;
  },

  getOutPortById : function (portId) {
    var at = this.outports.find(portId);
    if (at !== ERRINDEX) {
      return this.outports.getVal(at);
    }
    return null;
  },

  updateState : function (nodeState) {
    if (this.typedNode.parseNodeJSON(nodeState.nodeJSON)) {
      __log("GeoNode.updateState: init drawing node by json");
      this.name = nodeState.nodeJSON.name;
      this.execStatus = GeoNode.DefaultStatus;
      this.displayName = nodeState.nodeJSON.displayName;
      this.url = nodeState.nodeURL;
      this.updatePorts(nodeState.nodeJSON);
    }
    else {
      __log("GeoNode.updateState: update drawing node by status");
      this.execStatus = nodeState.execStatus;
      this.errMessage = nodeState.errMessage;
      NodeTypes.updateNodeRenders(this, NodeTypes.OutRender);
    }
  },

  // GeoNode.createPort
  createPort : function (portName, portJSON, IN_or_OUT) {
    var geoPort = new GeoPort(portJSON.id, IN_or_OUT, portName, this);
    geoPort.displayName = portJSON.displayName;
    geoPort.required = portJSON.required;
    geoPort.dataType = portJSON.type;
    geoPort.defaultValue = __is_null(portJSON.defaultValue)? "": portJSON.defaultValue;

    if (IN_or_OUT==="IN") {
      this.inports.insert(geoPort.id, geoPort);
    }
    else {
      this.outports.insert(geoPort.id, geoPort);
    }

    return geoPort;
  },

  removePort : function (geoPort) {
    if (this.isValid()) {
      if (this.typedNode.removePort(geoPort)) {
        return;
      }
    }

    if (geoPort.type==="IN") {
      this.inports.erase(geoPort.id);
    }
    else {
      this.outports.erase(geoPort.id);
    }    
  },

  clearPorts : function () {
    var port;
    while (this.inports.size()>1) {
      port = this.inports.eraseAt(1);      
    }
    while (this.outports.size()>1) {
      this.outports.eraseAt(1);
    }
  },

  updatePorts : function (nodeJSON) {
    this.clearPorts();
    this.removeLinks(this.getAllLinks());

    var i=0;
    for (; i<nodeJSON.parameters.length; i++) {
      GeoPort.create(this, nodeJSON.parameters[i]);
    }

    this.typedNode.updatePorts();
  },

  getFromNodeLinks : function () {
    var link,
        links = [],
        flowLinks = this.flowChart.__links,
        at = flowLinks.size();    
    while (at-- > 1) {
      link = flowLinks.getVal(at);
      if (link.fromNode===this) {
        links.push(link);
      }
    }
    return links;
  },

  getToNodeLinks : function () {
    var link,
        links = [],
        flowLinks = this.flowChart.__links,
        at = flowLinks.size();
    while (at-- > 1) {
      link = flowLinks.getVal(at);
      if (link.toNode===this) {
        links.push(link);
      }
    }
    return links;
  },

  getAllLinks : function () {
    var link,
        links = [],
        flowLinks = this.flowChart.__links,
        at = flowLinks.size();
    while (at-- > 1) {
      link = flowLinks.getVal(at);
      if (link.fromNode===this || link.toNode===this) {
        links.push(link);
      }
    }
    return links;
  },

  removeLinks : function (links, isClear) {
    // find all links connected to this node and drop them
    var link;
    while ((link=links.pop())!==undefined) {
      this.flowChart.cutLink(link);
    }
    if (isClear!==true) {
      this.flowChart.linkLayer.updateBound();
    }
  },

  toJsonString : function () {
    return this.typedNode.toJsonString();
  },

  getMatchedPorts : function (port /* dragging port*/ ) {
    var ports = [];
    if (port.parentNode.id === this.id) {
      return ports;
    }

    var i, n, mp,
        outRowType,    // node type with outport as rowID
        inColType      // node type with inport as colID        
    ;

    if (port.type==="IN") {
      outRowType = this.getTypeName();
      inColType = port.parentNode.getTypeName();      
      if (NodeTypes.getMatchTable(outRowType, inColType)===0) {
        __log("Nodes not matched: ", outRowType, " !=> ", inColType);
        return ports;
      }

      n = this.getOutPort();
      for (i=1; i<=n; i++) {
        mp = this.getOutPort(i);
        if (mp.matchPort(port)) {
          ports.push(mp);
        }
      }
    }
    else if (port.type==="OUT") {
      inColType = this.getTypeName();
      outRowType = port.parentNode.getTypeName();
      if (NodeTypes.getMatchTable(outRowType, inColType)===0) {
        __log("Nodes not matched: ", outRowType, " !=> ", inColType);
        return ports;
      }

      n = this.getInPort();
      for (i=1; i<=n; i++) {
        mp = this.getInPort(i);
        if (mp.matchPort(port)) {
          ports.push(mp);
        }
      }
    }

    return ports;
  },

  // GeoNode.validate
  validate : function () {
    this.validateResult = "";

    // check all ports to find if all required ports have links
    if (!this.isValid()) {
      this.validateResult = "not a valid node";
      throw new Error(this.validateResult);
    }

    var links = this.getAllLinks();
    if (links.length===0) {
      this.validateResult = "no links found with node " + this.id + ": " + this.displayName;
      throw new Error(this.validateResult);
    }

    var p, i, n = this.getInPort();
    for (i=1; i<=n; i++) {
      p = this.getInPort(i);
      p.validate();
    }

    n = this.getOutPort();
    for (i=1; i<=n; i++) {
      p = this.getOutPort(i);
      p.validate();
    }
  }
};

/**
 * GeoPort class
 */
var GeoPort = function (id, type, name, geoNode) {
  this._init(id, type, name, geoNode);
};

GeoPort.DirectionInput = "esriGPParameterDirectionInput";
GeoPort.DirectionOutput = "esriGPParameterDirectionOutput";

GeoPort.ParameterRequired = "esriGPParameterTypeRequired";
GeoPort.ParameterOptional = "esriGPParameterTypeOptional";

GeoPort.create = function (geoNode, portJSON) {
  if (portJSON.direction===GeoPort.DirectionInput) {
    if (geoNode.inports.size() > NodeTypes.MaxPorts) {
      throw new Error("GeoPort.create: exceed max inports: "+NodeTypes.MaxPorts);
    }
    var inPort = new GeoPort(portJSON.name, "IN", portJSON.name, geoNode);
    inPort.setData(portJSON);
    geoNode.inports.insert(inPort.id, inPort);
    return inPort;
  }
  else if (portJSON.direction===GeoPort.DirectionOutput) {
    if (geoNode.outports.size() > NodeTypes.MaxPorts) {
      throw new Error("GeoPort.create: exceed max outports: "+NodeTypes.MaxPorts);
    }
    var outPort = new GeoPort(portJSON.name, "OUT", portJSON.name, geoNode);
    outPort.setData(portJSON);
    geoNode.outports.insert(outPort.id, outPort);
    return outPort;
  }
  else {
    throw new Error("GeoPort.create: invalid port type: "+portJSON.direction);
  }
};

GeoPort.prototype = {
  _init : function (id, type, name, geoNode) {
    this.id = id;
    this.type = type; // IN, OUT
    this.name = name;
    this.displayName = this.name;
    this.required = false;
    this.parentNode = geoNode;

    this.tagShape = null; // dot shape of node symbol
    this.links = {};      // all links to this port

    // set by create function and not change it
    this.dataType = "";
    this.defaultValue = "";

    this.validateResult = "";
  },

  getTypeId : function () {
    return (this.type+":"+this.id); // IN:2
  },

  // GeoPort.setData
  setData : function (portJSON) {
    this.displayName = portJSON.displayName;
    this.description = __not_null(portJSON.description)? portJSON.description : "";
    this.dataType = portJSON.dataType;
    this.defaultValue = portJSON.defaultValue;
    this.required = (portJSON.parameterType===GeoPort.ParameterRequired)? true : false;

    if (__not_null(this.defaultValue)) {
      try{
        var defaultValueString = JSON.stringify(this.defaultValue);
        __log("===", this.displayName, defaultValueString);
        if (defaultValueString.length > 0) {
          // required=false when port has a non-empty defaultValue
          this.required = false;
        }
      }
      catch(e) {
        __log("GeoPort.setData(): Invalid JSON object.");
      }
    }
  },

  isValid : function () {
    return true;
  },

  toString : function () {
    return "GeoPort class";
  },

  getNextLink : function (curLink) {
    var linkId, link = curLink;
    for (linkId in this.links) {
      if (this.links.hasOwnProperty(linkId)) {
        if (__is_null(link)) {
          // get first link
          return this.links[linkId];
        }
        else if (linkId===curLink.id) {
          // find current, set return next time
          link = null;
        }
      }
    }
    return null;
  },

  getLinkedPort : function () {
    var link = this.getNextLink();
    if (__not_null(link)) {
      if (this===link.fromPort) {
        return link.toPort;
      }
      else if (this===link.toPort) {
        return link.fromPort;
      }
      else {
        throw new Error("GeoPort.getLinkedPort(): Critical Error. should never run to this");
      }
    }
    return null;
  },

  attachLink : function (link) {
    this.links[link.id] = link;
  },

  detachLink : function (link) {
    delete(this.links[link.id]);
    this.links = [];
  },

  getPosition : function (mapCanvas) {
    var nodePt = this.parentNode.tagShape.item(0);
    var nodePos = mapCanvas.toViewPos(nodePt.x, nodePt.y);
    var pos = this.tagShape.item(0).spawn();
    pos.offset(nodePos.x, nodePos.y);
    return pos;
  },

  getPoint : function (mapCanvas) {
    var pos = this.getPosition(mapCanvas);
    return mapCanvas.toMapPoint(pos.x, pos.y);
  },

  setPoint : function (mapCanvas) {
    var pos = this.getPosition(mapCanvas);
    var pt = mapCanvas.toMapPoint(pos.x, pos.y);
    this.tagShape.item(0).x = pt.x;
    this.tagShape.item(0).y = pt.y;
  },

  getIconShape : function () {
    var nodeSymbol = this.parentNode.typedNode.getNodeSymbol();
    return nodeSymbol.getAttribute(this.getTypeId());
  },

  matchPort : function (port) {
    if (__not_null(this.getNextLink())) {
      // has linked
      return false;
    }
    if (__is_empty(port.dataType) || __is_empty(this.dataType)) {
      return true;
    }

    if (port.dataType===this.dataType) {
      return true;
    }

    if ((port.dataType==="GPFeatureRecordSetLayer" && this.dataType==="Geometries") ||
        (this.dataType==="GPFeatureRecordSetLayer" && port.dataType==="Geometries")) {
      return true;
    }
    if (port.dataType !== this.dataType) {
      __log("port dataTypes not matched: ", port.dataType, this.dataType);
      return false;
    }

    //??TODO: check port value type
    return true;
  },

  validate : function () {
    this.validateResult = "";
    var link = this.getNextLink();
    if (this.required) {
      if (__is_null(link)) {
        this.validateResult = "A required port " + this.getTypeId() +
          " (node " + this.parentNode.id + ": " +
          this.parentNode.displayName +") has no link found";

        throw new Error(this.validateResult);
      }
    }
  },

  getDefaultValueJson: function () {
    var defValString = "";
    if (__is_null(this.defaultValue)) {
      defValString = __quot_str(defValString);
    }
    else if (typeof this.defaultValue==="object") {
      defValString = JSON.stringify(this.defaultValue);
      return defValString;
    }
    else if (typeof this.defaultValue==="number") {
      defValString = __quot_str(this.defaultValue);
    }
    else {
      try {
        defValString = JSON.stringify(JSON.parse(this.defaultValue));
        return defValString;
      }
      catch (e) {
        // not a JSON object
      }
      defValString = this.defaultValue+"";
      defValString = defValString.replace(/\"/g, "");
      defValString = __quot_str(defValString);
    }
    return defValString;
  },

  // GeoPort.toJsonString
  toJsonString : function() {
    var json = "";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str(this.name);
    json += ":{\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("id");
    json += ":";
    json += __quot_str(this.id);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("displayName");
    json += ":";
    json += __quot_str(this.displayName);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;
    
    json += __quot_str("description");
    json += ":";
    json += __quot_str(this.description);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.dataType);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("required");
    json += ":";
    json += this.required;
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    // GeoPort.defaultValue
    json += __quot_str("defaultValue");
    json += ":";
    json += this.getDefaultValueJson();
    json += "\n";
    json += __indent_spc+__indent_spc+__indent_spc;
    json += "}";

    return json;
  }
};

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

/**
 * Assignment Node
 */
var Assignment = function (geoNode) {
  this._init(geoNode);
};

Assignment.create = function (geoNode, nodeJSON) {
  var typedNode = new Assignment(geoNode);
  if (__not_null(nodeJSON)) {
    typedNode.description = __base64.decode(nodeJSON.description);
    
      if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }
  }
  typedNode.updatePorts();
  return typedNode;
};

Assignment.ExecutionType = "esriExecutionTypeAssignment";
Assignment.DefaultNodeHeight = NodeTypes.GridSize * 3;
Assignment.DefaultNodeWidth = NodeTypes.GridSize * 6;

Assignment.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = Assignment.DefaultNodeHeight;
    this.nodW = Assignment.DefaultNodeWidth;

    this.description = ""; // need user input

    NodeTypes.initNodeDrawing(this.node);
  },

  toString : function() {
    return NodeTypes.NodeAssignment;
  },

  getDisplayName : function () {
    return NodeTypes.NodeAssignment;
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    return true;
  },

  removePort : function (thePort) {
    thePort.dataType = "";
    return true;
  },

  updateOutPort : function (link, bAddPort) {
    link.fromPort.dataType = link.toPort.dataType;
  },

  updatePorts : function () {
    var outPort,
        inPort,
        nodeSymbol = this.getNodeSymbol();

    inPort = new GeoPort("user", "IN", "user", this.node);
    inPort.dataType = "";
    inPort.required = true;
    this.node.inports.insert(inPort.id, inPort);
    NodeTypes.createInPort(this.flowChart, nodeSymbol, inPort, this.nodW, 1);

    outPort = new GeoPort("Output", "OUT", "Output", this.node);
    outPort.dataType = "";
    outPort.required = true;
    this.node.outports.insert(outPort.id, outPort);
    NodeTypes.createOutPort(this.flowChart, nodeSymbol, outPort, this.nodW, 1);

    this.nodH = (1 + 2) * NodeTypes.GridSize;
    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());
  },

  // Assignment.toJsonString
  toJsonString : function() {
     var i,
        size = 0,
        port = null,
        json = "";    

    json += __indent_spc;
    json += __quot_str(this.node.id);
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.node.displayName);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.toString());
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("description");
    json += ":";
    json += __quot_str(__base64.encode(this.description));
    json += ",\n";

    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";

    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    // typeProperties
    json += __indent_spc+__indent_spc;
    json += __quot_str("typeProperties");
    json += ":{\n";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str("url");
    json += ":";
    json += __quot_str(this.node.url);
    json += "\n";

    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("inputPorts");
    json += ":{\n";

    // inports...
    size = this.node.inports.size();
    for (i=1; i<size; i++) {
      port = this.node.getInPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("outputPorts");
    json += ":{\n";

    // outports...
    size = this.node.outports.size();
    for (i=1; i<size; i++) {
      port = this.node.getOutPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "}\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};


/**
 * DefaultVal Node
 */
var DefaultVal = function (geoNode) {
  this._init(geoNode);
};

DefaultVal.create = function (geoNode, nodeJSON) {
  var typedNode = new DefaultVal(geoNode);
  if (__not_null(nodeJSON)) {
    var node = nodeJSON[0];
    geoNode.name = node.name;
    geoNode.displayName = node.name;

    if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }
  }
  typedNode.updatePorts(nodeJSON);
  return typedNode;
};

DefaultVal.ExecutionType = "esriExecutionTypeInternalValue";
DefaultVal.DefaultNodeHeight = NodeTypes.GridSize * 3;
DefaultVal.DefaultNodeWidth = NodeTypes.GridSize * 6;

DefaultVal.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = DefaultVal.DefaultNodeHeight;
    this.nodW = DefaultVal.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  toString : function() {
    return NodeTypes.NodeDefaultVal;
  },

  getDisplayName : function () {
    return "Default Values";
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    return true;
  },

  removePort : function (thePort) {
    var outPort,
        nodeSymbol = this.getNodeSymbol(),
        n = this.node.outports.size();
    while (n-- > 1) {
      outPort = this.node.getOutPort(n);
      if (outPort===thePort) {
        this._removePortShapes(nodeSymbol, thePort);
        break;
      }
      this._offsetPortShapes(nodeSymbol, outPort, 0, -NodeTypes.GridSize);
    }

    this.node.outports.erase(thePort.id);

    nodeSymbol.updateBound();
    this.nodH = (this.node.outports.size() + 1) * NodeTypes.GridSize;
    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());

    return true;
  },

  updatePorts : function (ports) {
    if (__is_null(ports)) {
      this.addNewPort();
    }
    else {
      var i=0, port;

      for (; i<ports.length; i++) {
        port = ports[i];

        var fromPort = this.addNewPort(port.portName);

        // fromPort.defaultValue = port.value;
        //
        if (typeof port.value==="object") {
          fromPort.defaultValue = JSON.stringify(port.value);
        }
        else {
          fromPort.defaultValue = port.value;
        }

        var toNode = this.flowChart.getNodeById(port.knotId);
        var toPort = toNode.getInPortById(port.portName);

        if (__not_null(toPort)) {
          this.flowChart.addLink(fromPort, toPort, ((i<ports.length-1)? false : true));
        }
      }
    }
  },

  // add a port after a port has been occupied
  addNewPort : function (optName) {
    var nodeSymbol = this.getNodeSymbol();
    var numPorts = this.node.outports.size();

    var outPort = new GeoPort(this.node.outports.genKey(), "OUT", (optName===undefined? "":optName), this.node);
    outPort.required = false;
    this.node.outports.insert(outPort.id, outPort);

    NodeTypes.createOutPort(this.flowChart, nodeSymbol, outPort, this.nodW, numPorts);
    this.nodH = (numPorts + 2) * NodeTypes.GridSize;
    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());

    return outPort;
  },

  updateOutPort : function (link, bAddPort) {
    link.fromPort.name = link.toPort.name;
    link.fromPort.displayName = link.toPort.displayName;
    link.fromPort.dataType = link.toPort.dataType;

    //DEL: link.fromPort.defaultValue = __is_null(link.toPort.defaultValue)? "": link.toPort.defaultValue;

    this.updatePortText(link.fromPort);

    if (bAddPort===true) {
      // add a new port defaultly
      this.addNewPort();
    }
  },

  updatePortText : function (port) {
    var shp,
        nodeSymbol = this.getNodeSymbol(),
        at = nodeSymbol.shapes.length;

    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===port) {
        if (shp.getAttribute("PORT_TEXT")===true) {
          shp.addAttribute("TEXT", port.defaultValue);
        }
      }
    }
  },

  _removePortShapes : function (nodeSymbol, thePort) {
    // remove all shapes of thePort
    var shp, at = nodeSymbol.shapes.length;
    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===thePort) {
        nodeSymbol.removeAt(at);
      }
    }
  },

  _offsetPortShapes : function (nodeSymbol, thePort, dx, dy) {
    var shp, at = nodeSymbol.shapes.length;
    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===thePort) {
        shp.offset(dx, dy);
      }
    }
    var link = null;
    while ((link=thePort.getNextLink(link)) !== null) {
      link.update(this.flowChart.mapCanvas);
    }
    this.flowChart.linkLayer.updateBound();
  },

  isValid : function() {
    var outPort,
        link,
        at = 1,
        numPorts = this.node.getOutPort();

    for (; at<=numPorts; at++) {
      outPort = this.node.getOutPort(at);
      link = outPort.getNextLink();

      if (__not_null(link)) {
        // at least a link
        return true;        
      }
    }

    return false;    
  },

  // DefaultVal.toJsonString
  toJsonString : function() {
    var json = "";

    var outPort,
        link,
        at = 1,
        numPorts = this.node.getOutPort();

    for (; at<=numPorts; at++) {
      outPort = this.node.getOutPort(at);
      link = outPort.getNextLink();

      if (__not_null(link)) {
        if (json[json.length-1]==='}') {
          json += ",\n";
        }
        json += __indent_spc;
        json += "{\n";

        json += __indent_spc+__indent_spc;
        json += __quot_str("id");
        json += ":";
        json += __quot_str(this.node.id);
        json += ",\n";

        json += __indent_spc+__indent_spc;
        json += __quot_str("name");
        json += ":";
        json += __quot_str(this.node.displayName);
        json += ",\n";
        
        // nodeServiceName
        json += __indent_spc+__indent_spc;
        json += __quot_str("nodeServiceName");
        json += ":";
        json += __quot_str(__base64.encode(this.node.serviceName));
        json += ",\n";

        // nodeServiceState
        json += __indent_spc+__indent_spc;
        json += __quot_str("nodeServiceState");
        json += ":";
        json += __quot_str(__base64.encode(this.node.getServiceState()));
        json += ",\n";

        // x, y of node
        var pt = this.node.tagShape.points[0];
        var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

        json += __indent_spc+__indent_spc;
        json += __quot_str("posX");
        json += ":";
        json += __quot_str(pos.x.toFixed(0));
        json += ",\n";

        json += __indent_spc+__indent_spc;
        json += __quot_str("posY");
        json += ":";
        json += __quot_str(pos.y.toFixed(0));
        json += ",\n";

        json += __indent_spc+__indent_spc;
        json += __quot_str("knotId");
        json += ":";
        json += __quot_str(link.toNode.id); // to node id
        json += ",\n";

        json += __indent_spc+__indent_spc;
        json += __quot_str("portName");
        json += ":";
        json += __quot_str(link.toPort.name); // to port name
        json += ",\n";

        json += __indent_spc+__indent_spc;
        json += __quot_str("value");
        json += ":";
        json += link.fromPort.getDefaultValueJson();  // json += __quot_str(link.fromPort.defaultValue); ERROR FORMAT
        json += "\n";

        json += __indent_spc;
        json += "}";
      }
    }
    return json;
  }
};

/**
 * Dispatch Node
 */
var Dispatch = function (geoNode) {
  this._init(geoNode);
};

Dispatch.create = function (geoNode, nodeJSON) {
  var typedNode = new Dispatch(geoNode);
  if (__not_null(nodeJSON)) {
    geoNode.name = nodeJSON.name;
    geoNode.displayName = geoNode.name;

    var portName, port;

    for (portName in nodeJSON.inputPorts) {
      port = nodeJSON.inputPorts[portName];
      geoNode.createPort(portName, port, "IN");
    }

    for (portName in nodeJSON.outputPorts) {
      port = nodeJSON.outputPorts[portName];
      geoNode.createPort(portName, port, "OUT");
    }
    
      if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }
  }

  typedNode.updatePorts(nodeJSON);
  return typedNode;
};

Dispatch.ExecutionType = "esriExecutionTypeDispatch";
Dispatch.DefaultNodeHeight = NodeTypes.GridSize * 3;
Dispatch.DefaultNodeWidth = NodeTypes.GridSize * 6;

Dispatch.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = Dispatch.DefaultNodeHeight;
    this.nodW = Dispatch.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  toString : function() {
    return NodeTypes.NodeDispatch;
  },

  getDisplayName : function () {
    return "Dispatch";
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    if (nodeJSON.type!==NodeTypes.NodeDispatch) {
      return false;
    }

    return true;
  },

  updatePorts : function (nodeJSON) {
    var nodeSymbol = this.getNodeSymbol();

    if (__is_null(nodeJSON)) {
      var inPort = new GeoPort("0", "IN", "0", this.node);
      inPort.required = true;
      inPort.displayName="";
      this.node.inports.insert(inPort.id, inPort);
      NodeTypes.createInPort(this.flowChart, nodeSymbol, inPort, this.nodW, 1);

      // add outport
      this.addNewPort();
    }
    else {
      var nInPorts = this.node.getInPort();
      var nOutPorts = this.node.getOutPort();

      var i = 1, at = 1, port;
      for (; i<=nInPorts; i++) {
        port = this.node.getInPort(i);
        NodeTypes.createInPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
      }

      i = 1;
      at--;
      for (; i<=nOutPorts; i++) {
        port = this.node.getOutPort(i);
        NodeTypes.createOutPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
      }

      this.addNewPort();
    }
  },

  // add a port after a port has been occupied
  addNewPort : function () {
    var nodeSymbol = this.getNodeSymbol();
    var outportID = this.node.outports.genKey();
    var outPort = new GeoPort(outportID, "OUT", outportID, this.node);
    outPort.required = false;
    outPort.displayName = "";
    var numOutPorts = this.node.outports.size();
    this.node.outports.insert(outPort.id, outPort);

    NodeTypes.createOutPort(this.flowChart, nodeSymbol, outPort, this.nodW, numOutPorts);

    this.nodH = (numOutPorts + 2) * NodeTypes.GridSize;
    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());

    return outPort;
  },

  updateInPort : function (link, bAddLink) {
    if (bAddLink) {
      // addLink
      link.toPort.displayName = link.fromPort.displayName;
      link.toPort.dataType = link.fromPort.dataType;
    }
    else {
      // cutLink
      link.toPort.displayName = "";
      link.toPort.dataType = "";
    }

    this.updatePortText(link.toPort);
  },

  updateOutPort : function (link, bAddPort) {
    //link.fromPort.name = link.toPort.name;
    link.fromPort.displayName = link.toPort.name;
    link.fromPort.dataType = link.toPort.dataType;

    this.updatePortText(link.fromPort);

    if (bAddPort===true) {
      this.addNewPort();
    }
  },

  updatePortText : function (port) {
    var shp,
        nodeSymbol = this.getNodeSymbol(),
        at = nodeSymbol.shapes.length;

    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===port) {
        if (shp.getAttribute("PORT_TEXT")===true) {
          shp.addAttribute("TEXT", port.displayName);
        }
      }
    }
  },

  _removePortShapes : function (nodeSymbol, thePort) {
    // remove all shapes of thePort
    var shp, at = nodeSymbol.shapes.length;
    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===thePort) {
        nodeSymbol.removeAt(at);
      }
    }
  },

  _offsetPortShapes : function (nodeSymbol, thePort, dx, dy) {
    var shp, at = nodeSymbol.shapes.length;
    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===thePort) {
        shp.offset(dx, dy);
      }
    }
    var link = null;
    while ((link=thePort.getNextLink(link)) !== null) {
      link.update(this.flowChart.mapCanvas);
    }
    this.flowChart.linkLayer.updateBound();
  },

  removePort : function (thePort) {
    if (thePort.type==="IN") {
      return TRUE;
    }

    var outPort,
        nodeSymbol = this.getNodeSymbol(),
        n = this.node.outports.size();
    while (n-- > 1) {
      outPort = this.node.getOutPort(n);
      if (outPort===thePort) {
        this._removePortShapes(nodeSymbol, thePort);
        break;
      }
      this._offsetPortShapes(nodeSymbol, outPort, 0, -NodeTypes.GridSize);
    }

    this.node.outports.erase(thePort.id);

    nodeSymbol.updateBound();
    this.nodH = (this.node.outports.size() + 1) * NodeTypes.GridSize;
    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());

    return true;
  },

  // Dispatch.toJsonString
  toJsonString : function() {
    var json = "";

    json += __indent_spc;
    json += __quot_str(this.node.id);
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.getDisplayName());
    json += ",\n";
    
    json += __indent_spc+__indent_spc;
    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.node.getTypeName());
    json += ",\n";

    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";
    
    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("typeProperties");
    json += ": {\n";
    json += __indent_spc+__indent_spc;
    json += "},\n";

    // inputPorts
    json += __indent_spc+__indent_spc;
    json += __quot_str("inputPorts");
    json += ":{\n";
    var i, port, size = this.node.inports.size();
    for (i=1; i<size; i++) {
      port = this.node.getInPort(i);
      if (port.isValid()) {
        json += port.toJsonString(i-1);
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }

    json += __indent_spc+__indent_spc;
    json += "},\n";

    // outputPorts
    json += __indent_spc+__indent_spc;
    json += __quot_str("outputPorts");
    json += ":{\n";
    size = this.node.outports.size()-1;
    for (i=1; i<size; i++) {
      port = this.node.getOutPort(i);
      if (port.isValid()) {
        json += port.toJsonString(port.id);
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "}\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};

/**
 * Feature Node
 */
var Feature = function (geoNode) {
  this._init(geoNode);
};

Feature.create = function (geoNode, nodeJSON) {
  var typedNode = new Feature(geoNode);

  if (__not_null(nodeJSON)) {
    var port, portName, geoPort;

    geoNode.url = nodeJSON.typeProperties.url;

    geoNode.name = nodeJSON.name;
    if (__not_empty(nodeJSON.displayName)) {
      geoNode.displayName = nodeJSON.displayName;
    }
    else {
      geoNode.displayName = geoNode.name;
    }

    for (portName in nodeJSON.inputPorts) {
      port = nodeJSON.inputPorts[portName];
      geoPort = geoNode.createPort(portName, port, "IN");
    }

    for (portName in nodeJSON.outputPorts) {
      port = nodeJSON.outputPorts[portName];
      geoPort = geoNode.createPort(portName, port, "OUT");
    }

    if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }

    typedNode.updatePorts();
  }

  return typedNode;
};

Feature.ExecutionType = "esriExecutionTypeFeature";
Feature.DefaultNodeHeight = NodeTypes.GridSize * 3;
Feature.DefaultNodeWidth = NodeTypes.GridSize * 6;

Feature.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = Geometry.DefaultNodeHeight;
    this.nodW = Geometry.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  toString : function() {
    return NodeTypes.NodeFeature;
  },

  getDisplayName : function () {
    return this.node.displayName;
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  // Feature.parseNodeJSON
  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    if (nodeJSON.executionType!==Feature.ExecutionType) {
      throw new Error("Feature.parseNodeJSON failed: " + Feature.ExecutionType + " mismatched with " + nodeJSON.executionType);
    }

    // set properties from nodeJSON:
    //

    return true;
  },

  removePort : function (thePort) {
    return true;
  },

  updatePorts : function () {
    var nodeSymbol = this.getNodeSymbol();

    // clear existing ports
    var portShp, num = nodeSymbol.shapes.length;
    while (num-- > 0) {
      portShp = nodeSymbol.shapes[num];
      if (portShp.getAttribute("port:symbol")===nodeSymbol) {
        nodeSymbol.removeAt(num);
      }
    }

    var nInPorts = this.node.getInPort();
    var nOutPorts = this.node.getOutPort();

    var i = 1, at = 1, port;
    for (; i<=nInPorts; i++) {
      port = this.node.getInPort(i);
      NodeTypes.createInPort(this.flowChart, nodeSymbol, port, this.nodW, at++);      
    }

    i = 1;
    for (; i<=nOutPorts; i++) {
      port = this.node.getOutPort(i);
      NodeTypes.createOutPort(this.flowChart, nodeSymbol, port, this.nodW, at++);      
    }

    this.nodH = (nInPorts + nOutPorts + 2) * NodeTypes.GridSize;

    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());
  },

  // Feature.toJsonString
  toJsonString : function() {
    var i,
        size = 0,
        port = null,
        json = "";

    json += __indent_spc;
    json += __quot_str(this.node.id);
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.node.displayName);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("displayName");
    json += ":";
    json += __quot_str(this.node.displayName);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.toString());
    json += ",\n";

    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";

    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    // typeProperties
    json += __indent_spc+__indent_spc;
    json += __quot_str("typeProperties");
    json += ":{\n";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str("url");
    json += ":";
    json += __quot_str(this.node.url);
    json += ",\n";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str("operation");
    json += ":";
    json += __quot_str(this.node.name);
    json += "\n";

    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("inputPorts");
    json += ":{\n";

    // inports...
    size = this.node.inports.size();
    for (i=1; i<size; i++) {
      port = this.node.getInPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("outputPorts");
    json += ":{\n";

    // outports...
    size = this.node.outports.size();
    for (i=1; i<size; i++) {
      port = this.node.getOutPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "}\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};

// Makefile inserts feature.operations.js here automatically
//
/**
 * Feature.operations
 * http://10.112.18.110:6080/arcgis/rest/services/GeoFlow/pm25_usa/FeatureServer/0
 */
Feature.operations = {
  "query": {
    "name": "feature",
    "displayName": "Feature",
    "enabled": true,
    "url": "---replaced by user input---",
    "description": "The query operation is performed on a feature service layer resource. The result of this operation is either a feature set or an array of feature ids",
    "executionType": "esriExecutionTypeFeature",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/fsquery.html",
    "parameters": [
      {
        "name": "where",
        "dataType": "GPString",
        "displayName": "Where",
        "direction": "esriGPParameterDirectionInput",
        "description": "A where clause for the query filter",
        "parameterType": "esriGPParameterTypeRequired",
        "defaultValue": "1=1"
      },
      {
        "name": "geometry",
        "dataType": "GPString",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometry to apply as the spatial filter",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": ""
      },
      {
        "name": "geometryType",
        "dataType": "GPString",
        "displayName": "Geometry Type",
        "direction": "esriGPParameterDirectionInput",
        "description": "The type of geometry specified by the geometry parameter",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": "esriGeometryEnvelope"
      },
      {
        "name": "inSR",
        "dataType": "GPString",
        "displayName": "In Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial reference of the input geometry",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": ""
      },
      {
        "name": "outSR",
        "dataType": "GPString",
        "displayName": "Out Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial reference of the returned geometry",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": ""        
      },
      {
        "name": "spatialRel",
        "dataType": "GPString",
        "displayName": "Spatial Relationship",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial relationship to be applied on the input geometry while performing the query",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": "esriSpatialRelIntersects"
      },
      {
        "name": "outFields",
        "dataType": "GPString",
        "displayName": "Out Fields",
        "direction": "esriGPParameterDirectionInput",
        "description": "The list of fields to be included in the returned resultset",
        "parameterType": "esriGPParameterTypeRequired",
        "defaultValue": "*"
      },
      {
        "name": "result",
        "dataType": "GPFeatureRecordSetLayer",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Output result",
        "parameterType": "esriGPParameterTypeOptional"
      }
    ]
  }
};
/**
 * Geometry Node
 */
var Geometry = function (geoNode) {
  this._init(geoNode);
};

Geometry.create = function (geoNode, nodeJSON) {
  var typedNode = new Geometry(geoNode);

  if (__not_null(nodeJSON)) {
    var port, portName, geoPort;

    geoNode.displayName = nodeJSON.name;
    geoNode.url = nodeJSON.typeProperties.url;
    geoNode.name = nodeJSON.typeProperties.operation;

    for (portName in nodeJSON.inputPorts) {
      port = nodeJSON.inputPorts[portName];
      geoPort = geoNode.createPort(portName, port, "IN");
    }

    for (portName in nodeJSON.outputPorts) {
      port = nodeJSON.outputPorts[portName];
      geoPort = geoNode.createPort(portName, port, "OUT");
    }

    if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }

    typedNode.updatePorts();
  }

  return typedNode;
};

Geometry.ExecutionType = "esriExecutionTypeGeometry";
Geometry.DefaultNodeHeight = NodeTypes.GridSize * 3;
Geometry.DefaultNodeWidth = NodeTypes.GridSize * 6;

Geometry.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = Geometry.DefaultNodeHeight;
    this.nodW = Geometry.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  toString : function() {
    return NodeTypes.NodeGeometry;
  },

  getDisplayName : function () {
    return this.node.displayName;
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    if (nodeJSON.executionType!==Geometry.ExecutionType) {
      throw new Error("Geometry.parseNodeJSON failed: " + Geometry.ExecutionType + " mismatched with " + nodeJSON.executionType);
    }

    // set properties from nodeJSON:
    //

    return true;
  },

  removePort : function (thePort) {
    return true;
  },

  updatePorts : function () {
    var nodeSymbol = this.getNodeSymbol();

    // clear existing ports
    var portShp, num = nodeSymbol.shapes.length;
    while (num-- > 0) {
      portShp = nodeSymbol.shapes[num];
      if (portShp.getAttribute("port:symbol")===nodeSymbol) {
        nodeSymbol.removeAt(num);
      }
    }

    var nInPorts = this.node.getInPort();
    var nOutPorts = this.node.getOutPort();

    var i = 1, at = 1, port;
    for (; i<=nInPorts; i++) {
      port = this.node.getInPort(i);
      NodeTypes.createInPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
    }

    i = 1;
    for (; i<=nOutPorts; i++) {
      port = this.node.getOutPort(i);
      NodeTypes.createOutPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
    }

    this.nodH = (nInPorts + nOutPorts + 2) * NodeTypes.GridSize;

    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());
  },

  getGeometryURL : function () {
    var url = this.node.url.replace('/'+this.node.name, "");
    return url;
  },

  // Geometry.toJsonString
  toJsonString : function() {
    var i,
        size = 0,
        port = null,
        json = "";

    json += __indent_spc;
    json += __quot_str(this.node.id);
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.node.displayName);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.toString());
    json += ",\n";

    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";

    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    // typeProperties
    json += __indent_spc+__indent_spc;
    json += __quot_str("typeProperties");
    json += ":{\n";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str("url");
    json += ":";
    json += __quot_str(this.getGeometryURL());
    json += ",\n";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str("operation");
    json += ":";
    json += __quot_str(this.node.name);
    json += "\n";

    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("inputPorts");
    json += ":{\n";

    // inports...
    size = this.node.inports.size();
    for (i=1; i<size; i++) {
      port = this.node.getInPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("outputPorts");
    json += ":{\n";

    // outports...
    size = this.node.outports.size();
    for (i=1; i<size; i++) {
      port = this.node.getOutPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "}\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};

// Makefile inserts geometry.operations.js here automatically
//
/**
 * Geometry.operations
 */
Geometry.operations = {
  "areasAndLengths": {
    "name": "areasAndLengths",
    "displayName": "Areas And Lengths",
    "enabled": true,
    "description": "This operation calculates areas and perimeter lengths for each polygon specified in the input array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?areasAndLengths.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Polygons",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons whose areas and lengths are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input polygons",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "lengthUnit",
        "dataType": "GPString",
        "displayName": "Length Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The length unit in which perimeters of polygons will be calculated",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "areaUnit",
        "dataType": "GPString",
        "displayName": "Area Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The area unit in which areas of polygons will be calculated",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "autoComplete": {
    "name": "autoComplete",
    "displayName": "AutoComplete",
    "enabled": true,
    "description": "It constructs polygons that fill in the gaps between existing polygons and a set of polylines",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?autoComplete.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Polygons",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons that will provide some boundaries for new polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "polylines",
        "dataType": "Geometries",
        "displayName": "Polylines",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons that will provide some boundaries for new polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polygons and polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "buffer": {
    "name": "buffer",
    "displayName": "Buffer",
    "enabled": true,
    "description": "The result of this operation is buffer polygons at the specified distances for the input geometry array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?buffer.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be buffered",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "inSR",
        "dataType": "GPString",
        "displayName": "In Spatial Reference",        
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "outSR",
        "dataType": "GPString", 
        "displayName": "Out Spatial Reference",               
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the returned geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "bufferSR",
        "dataType": "GPString",
        "displayName": "Buffer Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object in which the geometries are buffered",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "distances",
        "dataType": "GPString",
        "displayName": "Distances",
        "direction": "esriGPParameterDirectionInput",
        "description": "The distances the input geometries are buffered",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "unit",
        "dataType": "GPString",
        "displayName": "unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The units for calculating each buffer distance",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "unionResults",
        "dataType": "GPBoolean",
        "displayName": "Union Results",
        "direction": "esriGPParameterDirectionInput",
        "description": "If true, all geometries buffered at a given distance are unioned into a single (possibly multipart) polygon, and the unioned geometry is placed in the output array",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "convexHull": {
    "name": "convexHull",
    "displayName": "ConvexHull",
    "enabled": true,
    "description": "The convexHull operation returns the convex hull of the input geometry",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?convexHull.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Polygons",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometries whose convex hull is to be created",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
       "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the output geometry",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "cut": {
    "name": "cut",
    "displayName": "Cut",
    "enabled": true,
    "description": "This operation splits the input polyline or polygon where it crosses a cutting polyline",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?cut.html",
    "parameters": [
      {
        "name": "cutter",
        "dataType": "Geometries",
        "displayName": "Cutter",
        "direction": "esriGPParameterDirectionInput",
        "description": "The polyline that will be used to divide the target into pieces where it crosses the target",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "target",
        "dataType": "Geometries",
        "displayName": "Target",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polylines/polygons to be cut",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometry",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "densify": {
    "name": "densify",
    "displayName": "Densify",
    "enabled": true,
    "description": "This operation densifies geometries by plotting points between existing vertices",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?densify.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be densified",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "maxSegmentLength",
        "dataType": "GPString",
        "displayName": "Max Segment Length",
        "direction": "esriGPParameterDirectionInput",
        "description": "All segments longer than maxSegmentLength are replaced with sequences of lines no longer than maxSegmentLength",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "geodesic",
        "dataType": "GPString",
        "displayName": "Max Segment Length",
        "direction": "esriGPParameterDirectionInput",
        "description": "A flag that can be set to true if GCS spatial references are used or densify geodesic is to be performed",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "lengthUnit",
        "dataType": "GPString",
        "displayName": "Length Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The length unit of maxSegmentLength, can be any esriUnits constant",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "difference": {
    "name": "difference",
    "displayName": "Difference",
    "enabled": true,
    "description": "This operation constructs the set-theoretic difference between an array of geometries and another geometry",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?difference.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "An array of points, multipoints, polylines or polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometry",
        "dataType": "Geometries",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "A single geometry of any type, of dimension equal to or greater than the elements of geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "distance":{
    "name": "distance",
    "displayName": "Distance",
    "enabled": true,
    "description": "It reports the planar (projected space) or geodesic shortest distance between A and B",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?distance.html",
    "parameters": [
      {
        "name": "geometry1",
        "dataType": "Geometries",
        "displayName": "Geometry1",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometry from where the distance is to be measured",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometry2",
        "dataType": "Geometries",
        "displayName": "Geometry2",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometry to which the distance is to be measured",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "distanceUnit",
        "dataType": "GPString",
        "displayName": "Distance Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "Specifies the units for measuring distance between the geometry1 and geometry2 geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "geodesic",
        "dataType": "GPString",
        "displayName": "Geodesic",
        "direction": "esriGPParameterDirectionInput",
        "description": "If true then measures the geodesic distance between the geometries geometry1 and geometry2",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "generalize": {
    "name": "generalize",
    "displayName": "Generalize",
    "enabled": true,
    "description": "It returns generalized (Douglas-Poiker) versions of the input geometries",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?generalize.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be generalized",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "maxDeviation",
        "dataType": "GPString",
        "displayName": "Max Deviation",
        "direction": "esriGPParameterDirectionInput",
        "description": "Specifies the maximum deviation for constructing a generalized geometry based on the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "deviationUnit",
        "dataType": "GPString",
        "displayName": "Deviation Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "A unit for maximum deviation",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "intersect":{
    "name": "intersect",
    "displayName": "Intersect",
    "enabled": true,
    "description": "This operation constructs the set-theoretic intersection between an array of geometries and another geometry",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?intersect.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "An array of points, multipoints, polylines or polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometry",
        "dataType": "Geometries",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "A single geometry of any type, of dimension equal to or greater than the elements of geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "labelPoints": {
    "name": "labelPoints",
    "displayName": "Label Points",
    "enabled": true,
    "description": "This operation calculates an interior point for each polygon specified in the input array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?labelPoints.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons whose label points are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input polygons",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "lengths": {
    "name": "lengths",
    "displayName": "Lengths",
    "enabled": true,
    "description": "The array of polylines whose lengths are to be computed",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?lengths.html",
    "parameters": [
      {
        "name": "polylines",
        "dataType": "Geometries",
        "displayName": "Polylines",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polylines whose lengths are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "lengthUnit",
        "dataType": "GPString",
        "displayName": "Length Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The length unit in which perimeters of polygons will be calculated",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "geodesic",
        "dataType": "GPString",
        "displayName": "Geodesic",
        "direction": "esriGPParameterDirectionInput",
        "description": "If polylines are in geographic coordinate system, then geodesic needs to be set to true in order to calculate the ellipsoidal shortest path distance between each pair of the vertices in the polylines. If lengthUnit is not specificed, then output is always returned in meters",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "offset": {
    "name": "offset",
    "displayName": "Offset",
    "enabled": true,
    "description": "Offset constructs the offset of the given input geometries",    
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?offset.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be offset",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "offsetDistance",
        "dataType": "GPString",
        "displayName": "Offset Distance",
        "direction": "esriGPParameterDirectionInput",
        "description": "Specifies the distance for constructing an offset based on the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "offsetUnit",
        "dataType": "GPString",
        "displayName": "Offset Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "A unit for offset distance",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "offsetHow",
        "dataType": "GPString",
        "displayName": "Offset How",
        "direction": "esriGPParameterDirectionInput",
        "description": "It is one of esriGeometryOffsetMitered, esriGeometryOffsetBevelled, esriGeometryOffsetRounded",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "bevelRatio",
        "dataType": "GPString",
        "displayName": "Bevel Ratio",
        "direction": "esriGPParameterDirectionInput",
        "description": "bevelRatio is multiplied by the offset distance and the result determines how far a mitered offset intersection can be located before it is bevelled",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "project": {
    "name": "project",
    "displayName": "Project",
    "enabled": true,
    "description" : "This resource projects an array of input geometries from an input spatial reference to an output spatial reference",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?project.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be projected",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "inSR",
        "dataType": "GPString",
        "displayName": "In Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "outSR",
        "dataType": "GPString",
        "displayName": "Out Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the returned geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "relation": {
    "name": "relation",
    "displayName": "Relation",
    "enabled": true,
    "description": "This operation determines the pairs of geometries from the input geometry arrays that participate in the specified spatial relation",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?relation.html",
    "parameters": [
      {
        "name": "geometries1",
        "dataType": "Geometries",
        "displayName": "Geometries1",
        "direction": "esriGPParameterDirectionInput",
        "description": "The first array of geometries to compute the relations",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometries2",
        "dataType": "Geometries",
        "displayName": "Geometries2",
        "direction": "esriGPParameterDirectionInput",
        "description": "The second array of geometries to compute the relations",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "relation",
        "dataType": "GPString",
        "displayName": "Relation",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial relationship to be tested between the two input geometry arrays",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "relationParam",
        "dataType": "GPString",
        "displayName": "Relation Param",
        "direction": "esriGPParameterDirectionInput",
        "description": "The Shape-Comparison-Language string to be evaluated",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "reshape": {
    "name": "reshape",
    "displayName": "Reshape",
    "enabled": true,
    "description": "It reshapes a polyline or a part of a polygon using a reshaping line",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?reshape.html",
    "parameters": [
      {
        "name": "target",
        "dataType": "Geometries",
        "displayName": "Target",
        "direction": "esriGPParameterDirectionInput",
        "description": "The polyline or polygon to be reshaped",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "reshaper",
        "dataType": "Geometries",
        "displayName": "Reshaper",
        "direction": "esriGPParameterDirectionInput",
        "description": "The single-part polyline that does the reshaping",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometry",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "simplify": {
    "name": "simplify",
    "displayName": "Simplify",
    "enabled": true,
    "description": "Simplify permanently alters the input geometry so that the geometry becomes topologically consistent",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?simplify.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be simplified",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input and output geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "trimExtend": {
    "name": "trimExtend",
    "displayName": "TrimExtend",
    "enabled": true,
    "description": "This operation trims or extends each polyline specified in the input array, using the user specified guide polylines",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?trimExtend.html",
    "parameters": [
      {
        "name": "polylines",
        "dataType": "Geometries",
        "displayName": "Polylines",
        "direction": "esriGPParameterDirectionInput",
        "description": "An array of polylines whose lengths are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "trimExtendTo",
        "dataType": "Geometries",
        "displayName": "Trim Extend To",
        "direction": "esriGPParameterDirectionInput",
        "description": "A polyline which is used as a guide for trimming or extending input polylines",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "extendHow",
        "dataType": "GPString",
        "displayName": "Extend How",
        "direction": "esriGPParameterDirectionInput",
        "description": "A flag which is used along with the trimExtend operation",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "union": {
    "name": "union",
    "displayName": "Union",
    "enabled": true,
    "description": "This operation constructs the set-theoretic union of the geometries in the input array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?union.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be unioned",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  }
};

/**
 * GpAsync Node
 */
var GpAsync = function (geoNode) {
  this._init(geoNode);
};

GpAsync.create = function (geoNode, nodeJSON) {
  var typedNode = new GpAsync(geoNode);

  if (__not_null(nodeJSON)) {
    var port, portName, geoPort;

    geoNode.url = nodeJSON.typeProperties.url;
    geoNode.displayName = nodeJSON.name;

    for (portName in nodeJSON.inputPorts) {
      port = nodeJSON.inputPorts[portName];
      geoNode.createPort(portName, port, "IN");
    }

    for (portName in nodeJSON.outputPorts) {
      port = nodeJSON.outputPorts[portName];
      geoNode.createPort(portName, port, "OUT");
    }

    if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }

    typedNode.updatePorts();
  }

  return typedNode;
};

GpAsync.ExecutionType = "esriExecutionTypeAsynchronous";

GpAsync.DefaultNodeHeight = NodeTypes.GridSize * 3;
GpAsync.DefaultNodeWidth = NodeTypes.GridSize * 8;

GpAsync.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = GpAsync.DefaultNodeHeight;
    this.nodW = GpAsync.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  toString : function() {
    return NodeTypes.NodeGpAsync;
  },

  getDisplayName : function () {
    return this.node.displayName;
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    if (nodeJSON.executionType!==GpAsync.ExecutionType) {
      throw new Error("GpSync.parseNodeJSON failed: " + GpAsync.ExecutionType + " mismatched with " + nodeJSON.executionType);
    }
    
    // set properties from nodeJSON:
    //

    return true;
  },

  removePort : function (thePort) {
    return true;
  },

  updatePorts : function () {
    var nodeSymbol = this.getNodeSymbol();

    // clear existing ports
    var portShp, num = nodeSymbol.shapes.length;
    while (num-- > 0) {
      portShp = nodeSymbol.shapes[num];
      if (portShp.getAttribute("port:symbol")===nodeSymbol) {
        nodeSymbol.removeAt(num);
      }
    }

    var nInPorts = this.node.getInPort();
    var nOutPorts = this.node.getOutPort();

    var i = 1, at = 1, port;
    for (; i<=nInPorts; i++) {
      port = this.node.getInPort(i);
      NodeTypes.createInPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
    }

    i = 1;
    for (; i<=nOutPorts; i++) {
      port = this.node.getOutPort(i);
      NodeTypes.createOutPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
    }

    this.nodH = (nInPorts + nOutPorts + 2) * NodeTypes.GridSize;
    if (this.nodH < GpAsync.DefaultNodeHeight) {
      this.nodH = GpAsync.DefaultNodeHeight;
    }

    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());
  },

  toJsonString : function() {
    var i,
        size = 0,
        port = null,
        json = "";    

    json += __indent_spc;
    json += __quot_str(this.node.id);
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.node.displayName);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.toString());
    json += ",\n";
    
    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";

    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    // typeProperties
    json += __indent_spc+__indent_spc;
    json += __quot_str("typeProperties");
    json += ":{\n";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str("url");
    json += ":";
    json += __quot_str(this.node.url);
    json += "\n";

    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("inputPorts");
    json += ":{\n";

    // inports...
    size = this.node.inports.size();
    for (i=1; i<size; i++) {
      port = this.node.getInPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("outputPorts");
    json += ":{\n";

    // outports...
    size = this.node.outports.size();
    for (i=1; i<size; i++) {
      port = this.node.getOutPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "}\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};

/**
 * GpSync Node
 * url = http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/GPServer/PopulationSummary?f=json&pretty=true
 */
var GpSync = function (geoNode) {
  this._init(geoNode);
};

GpSync.create = function (geoNode, nodeJSON) {
  var typedNode = new GpSync(geoNode);

  if (__not_null(nodeJSON)) {
    var port, portName;

    geoNode.url = nodeJSON.typeProperties.url;
    geoNode.displayName = nodeJSON.name;

    for (portName in nodeJSON.inputPorts) {
      port = nodeJSON.inputPorts[portName];
      geoNode.createPort(portName, port, "IN");
    }

    for (portName in nodeJSON.outputPorts) {
      port = nodeJSON.outputPorts[portName];
      geoNode.createPort(portName, port, "OUT");
    }

    typedNode.updatePorts();
    
    if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }
  }

  return typedNode;
};

GpSync.ExecutionType = "esriExecutionTypeSynchronous";
GpSync.DefaultNodeHeight = NodeTypes.GridSize * 3;
GpSync.DefaultNodeWidth = NodeTypes.GridSize * 8;

GpSync.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = GpSync.DefaultNodeHeight;
    this.nodW = GpSync.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  toString : function() {
    return NodeTypes.NodeGpSync;
  },

  getDisplayName : function () {
    return this.node.displayName;
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    if (nodeJSON.executionType!==GpSync.ExecutionType) {
      throw new Error("GpSync.parseNodeJSON failed: " + GpSync.ExecutionType + " mismatched with " + nodeJSON.executionType);
    }
   
    return true;
  },

  removePort : function (thePort) {
    return true;
  },

  updatePorts : function () {
    var nodeSymbol = this.getNodeSymbol();

    // clear existing ports
    var portShp, num = nodeSymbol.shapes.length;
    while (num-- > 0) {
      portShp = nodeSymbol.shapes[num];
      if (portShp.getAttribute("port:symbol")===nodeSymbol) {
        nodeSymbol.removeAt(num);
      }
    }

    var nInPorts = this.node.getInPort();
    var nOutPorts = this.node.getOutPort();

    var i = 1, at = 1, port;
    for (; i<=nInPorts; i++) {
      port = this.node.getInPort(i);
      NodeTypes.createInPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
    }

    i = 1;
    for (; i<=nOutPorts; i++) {
      port = this.node.getOutPort(i);
      NodeTypes.createOutPort(this.flowChart, nodeSymbol, port, this.nodW, at++);
    }

    this.nodH = (nInPorts + nOutPorts + 2) * NodeTypes.GridSize;
    if (this.nodH < GpSync.DefaultNodeHeight) {
      this.nodH = GpSync.DefaultNodeHeight;
    }

    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());
  },

  toJsonString : function() {
    var i,
        size = 0,
        port = null,
        json = "";

    json += __indent_spc;
    json += __quot_str(this.node.id);
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.node.displayName);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.toString());
    json += ",\n";

    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";

    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    // typeProperties
    json += __indent_spc+__indent_spc;
    json += __quot_str("typeProperties");
    json += ":{\n";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str("url");
    json += ":";
    json += __quot_str(this.node.url);
    json += "\n";

    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("inputPorts");
    json += ":{\n";

    // inports...
    size = this.node.inports.size();
    for (i=1; i<size; i++) {
      port = this.node.getInPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "},\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("outputPorts");
    json += ":{\n";

    // outports...
    size = this.node.outports.size();
    for (i=1; i<size; i++) {
      port = this.node.getOutPort(i);
      if (port.isValid()) {
        json += port.toJsonString();
        if (i === size-1) {
          json += "\n";
        }
        else {
          json += ",\n";
        }
      }
    }
    json += __indent_spc+__indent_spc;
    json += "}\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};

/**
 * PubInput Node
 *
 *  fromNode:
 *   ____________
 *  |            |
 *  |     OutPort|===@
 *  |____________|
 *
 */
var PubInput = function (geoNode) {
  this._init(geoNode);
};

PubInput.create = function (geoNode, nodeJSON) {
  var typedNode = new PubInput(geoNode);
  typedNode.updatePorts(nodeJSON);

  if (__not_null(nodeJSON)) {
      if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }
  }

  return typedNode;
};

PubInput.ExecutionType = "esriExecutionTypePubInput";
PubInput.DefaultNodeHeight = NodeTypes.GridSize * 3;
PubInput.DefaultNodeWidth = NodeTypes.GridSize * 6;

PubInput.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;
    this.orderNumb = this.flowChart.sortNodesOrder(NodeTypes.NodePubInput);
    this.portName = "";

    this._setNodeName();

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = PubInput.DefaultNodeHeight;
    this.nodW = PubInput.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  _setNodeName : function (portName) {
    this.portName = (__not_empty(portName)? portName : "");
    this.node.name = "Input" + this.orderNumb;
    if (__not_empty(this.portName)) {
      this.node.name += "_" + this.portName;
    }
    this.node.displayName = this.node.name;
  },

  toString : function() {
    return NodeTypes.NodePubInput;
  },
  
  getDisplayName : function () {
    return this.node.displayName;
  },
  
  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    return true;
  },

  removePort : function (thePort) {
    thePort.name = "";
    thePort.dataType = "";
    thePort.defaultValue = "";

    this.updatePortText(thePort);
    return true;
  },

  updatePorts : function (nodeJSON) {
    var outPort,
        toNode,
        inPort = null,
        nodeSymbol = this.getNodeSymbol();

    if (__is_null(nodeJSON)) {      
      outPort = new GeoPort(this.node.outports.genKey(), "OUT", "", this.node);
    }
    else {
      outPort = new GeoPort(nodeJSON.id, "OUT", "", this.node);
      toNode = this.flowChart.getNodeById(nodeJSON.knotId);
      if (__not_null(toNode)) {
        inPort = toNode.getInPortById(nodeJSON.portName);
      }
    }

    outPort.required = true;
    this.node.outports.insert(outPort.id, outPort);
    NodeTypes.createOutPort(this.flowChart, nodeSymbol, outPort, this.nodW, 1);
    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());

    if (__not_null(inPort)) {
      this.flowChart.addLink(outPort, inPort);
    }
  },

  updateOutPort : function (link, bAddPort) {
    link.fromPort.name = link.toPort.name;
    link.fromPort.dataType = link.toPort.dataType;
    link.fromPort.defaultValue = link.toPort.defaultValue;

    this.updatePortText(link.fromPort);
  },

  updateOrderNumb : function (newOrderNumb) {
    this.orderNumb = newOrderNumb;
    this._setNodeName(this.portName);
    NodeTypes.updateDrawNode(this.getNodeSymbol(), this.nodW, this.nodH, this.getDisplayName());
  },

  updatePortText : function (port) {
    this._setNodeName(port.name);

    var shp,
        nodeSymbol = this.getNodeSymbol(),
        at = nodeSymbol.shapes.length;

    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===port) {
        if (shp.getAttribute("PORT_TEXT")===true) {
          shp.addAttribute("TEXT", port.name);
        }
      }
    }

    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());
  },

  toJsonString : function() {
    var json = "";

    json += __indent_spc;
    json += __quot_str(this.getDisplayName());
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("id");
    json += ":";
    json += __quot_str(this.node.id);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.node.name);
    json += ",\n";

    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";
    
    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    // outPort
    var outPort = this.node.getOutPort(1);
    var link = outPort.getNextLink();
    
    json += __indent_spc+__indent_spc;
    json += __quot_str("dataType");
    json += ":";
    json += __quot_str(outPort.dataType);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("defaultValue");
    json += ":";
    json += __quot_str(outPort.defaultValue);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("knotId");
    json += ":";
    json += __quot_str(__not_null(link)?link.toNode.id:""); // to node id
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("portName");
    json += ":";
    json += __quot_str(__not_null(link)?link.toPort.name:""); // to port name
    json += "\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};
/**
 * PubOutput Node
 *
 *  toNode:
 *       ____________
 *      |            |
 *  O===|InPort      |
 *      |____________|
 *
 */
var PubOutput = function (geoNode) {
  this._init(geoNode);
};

PubOutput.create = function (geoNode, nodeJSON) {
  var typedNode = new PubOutput(geoNode);
  typedNode.updatePorts(nodeJSON);

  if (__not_null(nodeJSON)) {
    typedNode.setCallout(nodeJSON.callout);

    if (__not_null(nodeJSON.nodeServiceName)) {
      geoNode.setServiceState(__base64.decode(nodeJSON.nodeServiceName),
                              __base64.decode(nodeJSON.nodeServiceState));
    }
  }

  return typedNode;
};

PubOutput.ExecutionType = "esriExecutionTypePubOutput";
PubOutput.DefaultNodeHeight = NodeTypes.GridSize * 3;
PubOutput.DefaultNodeWidth = NodeTypes.GridSize * 6;

PubOutput.prototype = {
  _init : function (geoNode) {
    this.node = geoNode;
    this.node.typedNode = this;
    this.flowChart = geoNode.flowChart;
    this.orderNumb = this.flowChart.sortNodesOrder(NodeTypes.NodePubOutput);
    this.portName = "";
    this.callout = "";

    this._setNodeName();

    // nodeSymbol.tag refers to its owner node since each node has itself symbol
    this.node.tagShape.symbol = new esri2.Map.Symbol(this.toString(), this.node);

    this.nodH = PubOutput.DefaultNodeHeight;
    this.nodW = PubOutput.DefaultNodeWidth;

    NodeTypes.initNodeDrawing(this.node);
  },

  _setNodeName : function (portName) {
    this.portName = (__not_empty(portName)? portName : "");
    this.node.name = "Output" + this.orderNumb;
    if (__not_empty(this.portName)) {
      this.node.name += "_" + this.portName;
    }
    this.node.displayName = this.node.name;
  },

  toString : function() {
    return NodeTypes.NodePubOutput;
  },

  setCallout : function (calloutURL) {
    try {
      this.callout = calloutURL.replace(/\"/g, "");
    }
    catch (e) {
      this.callout = "";
    }
  },

  getDisplayName : function () {
    return this.node.displayName;
  },

  getNodeSymbol : function() {
    return this.node.tagShape.symbol;
  },

  parseNodeJSON : function (nodeJSON) {
    if (__is_null(nodeJSON)) {
      return false;
    }
    return true;
  },

  removePort : function (thePort) {
    thePort.name = "";
    thePort.dataType = "";

    this.updatePortText(thePort);
    return true;
  },

  // PubOutputs.updatePorts
  updatePorts : function (nodeJSON) {
    var inPort,
        fromNode,
        outPort = null,
        nodeSymbol = this.getNodeSymbol();

    if (__is_null(nodeJSON)) {
      inPort = new GeoPort(this.node.outports.genKey(), "IN", "", this.node);
    }
    else {
      inPort = new GeoPort(nodeJSON.id, "IN", "", this.node);
      fromNode = this.flowChart.getNodeById(nodeJSON.knotId);
      if (__not_null(fromNode)) {
        outPort = fromNode.getOutPortById(nodeJSON.portName);
      }
    }

    inPort.required = true;
    this.node.inports.insert(inPort.id, inPort);
    NodeTypes.createInPort(this.flowChart, nodeSymbol, inPort, this.nodW, 1);
    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());

    if (__not_null(outPort)) {
      this.flowChart.addLink(outPort, inPort);
    }
  },

  updateInPort : function (link, bAddPort) {
    link.toPort.name = link.fromPort.name;
    link.toPort.dataType = link.fromPort.dataType;

    this.updatePortText(link.toPort);
  },

  updateOrderNumb : function (newOrderNumb) {
    this.orderNumb = newOrderNumb;
    this._setNodeName(this.portName);
    NodeTypes.updateDrawNode(this.getNodeSymbol(), this.nodW, this.nodH, this.getDisplayName());
  },

  updatePortText : function (port) {
    this._setNodeName(port.name);

    var shp,
        nodeSymbol = this.getNodeSymbol(),
        at = nodeSymbol.shapes.length;

    while (at-->0) {
      shp = nodeSymbol.shapes[at];
      if (shp.tag===port) {
        if (shp.getAttribute("PORT_TEXT")===true) {
          shp.addAttribute("TEXT", port.name);
        }
      }
    }

    NodeTypes.updateDrawNode(nodeSymbol, this.nodW, this.nodH, this.getDisplayName());
  },

  toJsonString : function() {
    var json = "";

    json += __indent_spc;
    json += __quot_str(this.getDisplayName());
    json += ":{\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("id");
    json += ":";
    json += __quot_str(this.node.id);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("name");
    json += ":";
    json += __quot_str(this.node.displayName);
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("callout");
    json += ":";
    json += __quot_str(this.callout);
    json += ",\n";

    // nodeServiceName
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceName");
    json += ":";
    json += __quot_str(__base64.encode(this.node.serviceName));
    json += ",\n";

    // nodeServiceState
    json += __indent_spc+__indent_spc;
    json += __quot_str("nodeServiceState");
    json += ":";
    json += __quot_str(__base64.encode(this.node.getServiceState()));
    json += ",\n";

    // x, y of node
    var pt = this.node.tagShape.points[0];
    var pos = this.node.flowChart.mapCanvas.toViewPos(pt.x, pt.y);

    json += __indent_spc+__indent_spc;
    json += __quot_str("posX");
    json += ":";
    json += __quot_str(pos.x.toFixed(0));
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("posY");
    json += ":";
    json += __quot_str(pos.y.toFixed(0));
    json += ",\n";

    // inPort
    var inPort = this.node.getInPort(1);
    var link = inPort.getNextLink();

    json += __indent_spc+__indent_spc;
    json += __quot_str("knotId");
    json += ":";
    json += __quot_str(__not_null(link)?link.fromNode.id:""); // to node id
    json += ",\n";

    json += __indent_spc+__indent_spc;
    json += __quot_str("portName");
    json += ":";
    json += __quot_str(__not_null(link)?link.fromPort.name:""); // to port name
    json += "\n";

    json += __indent_spc;
    json += "}";

    return json;
  }
};

/**
 * public interfaces:
 */
window.esri2.GeoFlow = GeoFlow;
window.esri2.GeoFlow.Node = GeoNode;
window.esri2.GeoFlow.Port = GeoPort;
window.esri2.GeoFlow.Link = GeoLink;
window.esri2.GeoFlow.NodeTypes = NodeTypes;
window.esri2.GeoFlow.Node.Geometry = Geometry;
window.esri2.GeoFlow.Node.Feature = Feature;
}(window));

