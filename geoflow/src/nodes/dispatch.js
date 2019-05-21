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

