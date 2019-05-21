/**
 * GeoFlow.LinkCutter class
 */
GeoFlow.LinkCutter = function (flowChart) {
  this.flowChart = flowChart;
  this.link = null;

  this.cutter = new esri2.Map.Shape(this); // cutter point
  this.cutter.visible = false;
  this.cutter.createPoint(0, 0);

  this.cutter.symbol = new esri2.Map.Symbol(NodeTypes.LinkCutter, this.cutter);

  var cutIcon = NodeTypes.createIconRect(this.cutter.symbol, this.cutter.symbol,
        NodeTypes.LinkCutter,
        this.flowChart.imagesLib.getImage(NodeTypes.LinkCutter),
        this.flowChart.imagesLib.getImage(NodeTypes.LinkCutter),
        false, null,
        NodeTypes.CutterSize, NodeTypes.CutterSize);

  this.cutter.symbol.addShape(cutIcon);
  this.cutter.symbol.symbolUnit.baseX = 20;
  this.cutter.symbol.symbolUnit.baseY = 20;
  this.cutter.symbol.updateBound();
};

GeoFlow.LinkCutter.TimeOutMSec = 2000;

GeoFlow.LinkCutter.hide = function (cutter, mapCanvas) {
  cutter.visible = false;
  mapCanvas.refreshTrackingLayer(cutter);
};

GeoFlow.LinkCutter.__hide = function (cutter, mapCanvas) {
  return function () {
    GeoFlow.LinkCutter.hide(cutter, mapCanvas);
  };
};

GeoFlow.LinkCutter.prototype = {
  onClick : function (e, mapCanvas) {
    if (this.cutter.visible) {
      this.cutter.visible = false;

      var rcCutter = this.cutter.bound.rect;
      var p1 = mapCanvas.toViewPos(rcCutter.xmin, rcCutter.ymin);
      var p2 = mapCanvas.toViewPos(rcCutter.xmax, rcCutter.ymax);
      rcCutter = new esri2.Common.RectType(p1.x, p2.y, p2.x, p2.y);
      rcCutter.xmax += NodeTypes.CutterSize;
      rcCutter.ymax += NodeTypes.CutterSize;

      var symbUnit = this.cutter.symbol.symbolUnit;
      rcCutter.offset(-symbUnit.baseX, -symbUnit.baseY);

      if (rcCutter.ptInRect(e._x, e._y)) {
        var delLink = this.link;
        this.link = null;
        this.flowChart.cutLink(delLink);
        this.flowChart.linkLayer.updateBound();
        mapCanvas.refresh(true);
        return true;
      }

      mapCanvas.refreshTrackingLayer(this.cutter);
    }
    return false;
  },

  show : function (e, mapCanvas, link) {
    if (this.cutter.visible===false) {
      this.link = link;
      this.cutter.visible = true;
      this.cutter.points[0] = mapCanvas.toMapPoint(e._x, e._y);
      this.cutter.updateBound();

      if ( __is_null(mapCanvas.trackingLayer.findShape(this.cutter)) ) {
        mapCanvas.trackingLayer.addShape(this.cutter);
        mapCanvas.trackingLayer.updateBound();
      }
      mapCanvas.refreshTrackingLayer(this.cutter);
      setTimeout(GeoFlow.LinkCutter.__hide(this.cutter, mapCanvas), GeoFlow.LinkCutter.TimeOutMSec);
    }
  }
};

