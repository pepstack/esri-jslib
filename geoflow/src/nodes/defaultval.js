
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

