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

