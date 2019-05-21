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
