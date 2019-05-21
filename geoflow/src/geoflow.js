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

