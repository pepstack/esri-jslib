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
