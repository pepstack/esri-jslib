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

