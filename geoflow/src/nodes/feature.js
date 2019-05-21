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
