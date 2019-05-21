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

