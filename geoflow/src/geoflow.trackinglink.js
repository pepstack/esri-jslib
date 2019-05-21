/**
 * GeoFlow.TrackingLink class
 */
GeoFlow.TrackingLink = function (flowChart) {
  this.flowChart = flowChart;
  this.startPort = null;
  this.matchedPorts = [];  // array of MatchPortState
};

// MatchPortState
//
GeoFlow.TrackingLink.MatchPortState = function (port) {
  this._init(port);
};

GeoFlow.TrackingLink.MatchPortState.prototype._init = function (port) {
  this.port = port;
  this.portShape = this.port.getIconShape();
  this.savedRender = this.portShape.renderName;
  this.portShape.renderName = NodeTypes.InRender;
};

GeoFlow.TrackingLink.MatchPortState.prototype.restore = function () {
  this.portShape.renderName = this.savedRender;
};

GeoFlow.TrackingLink.prototype = {
  _addLinkShape : function (startPt, endPt) {
    var linkShape = this.flowChart.linkShape;
    if (startPt.x > endPt.x) {
      linkShape.createBezier(startPt, endPt,
        new esri2.Map.Point(startPt.x, endPt.y), new esri2.Map.Point(endPt.x, startPt.y));
    }
    else {
      linkShape.createBezier(startPt, endPt);
    }
    this.flowChart.mapCanvas.trackingLayer.addShape(linkShape);
  },

  _addPortShape : function (pt) {
    var portShape = this.flowChart.portShape;
    portShape.points[0].x = pt.x;
    portShape.points[0].y = pt.y;
    portShape.updateBound();

    if (this.startPort.type==="IN") {
      portShape.symbol = this.flowChart.mapCanvas.getAttribute(NodeTypes.InPortSel);
    }
    else {
      portShape.symbol = this.flowChart.mapCanvas.getAttribute(NodeTypes.OutPortSel);
    }

    this.flowChart.mapCanvas.trackingLayer.addShape(portShape);
  },

  _isMatchedPort : function (endPort) {
    for (var i=0; i<this.matchedPorts.length; i++) {
      if (endPort===this.matchedPorts[i].port) {
        return true;
      }
    }
    return false;
  },

  _getMatchedPorts : function (port) {
    var item, items = this.flowChart.getNodeCount();
    for (item=1; item<=items; item++) {
      var node = this.flowChart.nodeItem(item);
      var mp, ports = node.getMatchedPorts(port);
      while ((mp=ports.pop()) !== undefined) {
        this.matchedPorts.push(new GeoFlow.TrackingLink.MatchPortState(mp));
      }
    }
  },

  _addMatchedShapes : function () {
    for (var i=0; i<this.matchedPorts.length; i++) {
      this.flowChart.mapCanvas.trackingLayer.addShape(this.matchedPorts[i].portShape);
    }
  },

  _clearPorts : function () {
    this.startPort = null;

    // clear match ports
    var mpState;
    while ((mpState=this.matchedPorts.pop())!==undefined) {
      mpState.restore();
    }

    // clear tracking layer
    this.flowChart.mapCanvas.trackingLayer.removeAll();
    this.flowChart.mapCanvas.trackingLayer.updateBound();
  },

  isTracking : function () {
    return __not_null(this.startPort);
  },

  getStartPos : function () {
    return this.startPort.getPosition(this.flowChart.mapCanvas);
  },

  tracking : function (e) {
    var startPos = this.getStartPos();
    var startPt = this.flowChart.mapCanvas.toMapPoint(startPos.x, startPos.y);
    var endPt = this.flowChart.mapCanvas.toMapPoint(e._x, e._y);

    // add current link shape to tracking layer
    this.flowChart.mapCanvas.trackingLayer.removeAll();

    this._addLinkShape(startPt, endPt);
    this._addPortShape(startPt);
    this._addMatchedShapes();

    this.flowChart.mapCanvas.trackingLayer.updateBound();
    this.flowChart.mapCanvas.refreshTrackingLayer();
  },

  start : function (e, portShape) {
    // start track, check if port can be tracked
    var port = portShape.tag;
    if (__not_null(port.getNextLink())) {
      return;
    }
    this._getMatchedPorts(port);
    this.startPort = port;    
  },

  end : function (e, portShape) {
    var startPort = this.startPort;
    var endPort = portShape.tag;

    // check if endPort is in matchedPorts
    var ret = this._isMatchedPort(endPort);

    this._clearPorts();

    // add a link to flow chart
    if (ret) {
      var newLink = this.flowChart.addLink(startPort, endPort);
      ret = __not_null(newLink);
    }

    this.flowChart.mapCanvas.refresh(ret);
  },

  abort : function () {
    if (__not_null(this.startPort)) {
      this._clearPorts();
      this.flowChart.mapCanvas.refresh(false);
    }
  }
};

