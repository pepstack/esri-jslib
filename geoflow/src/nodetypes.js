
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
