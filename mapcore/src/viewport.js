/**
 * Viewport class
 *   transform coordinates between view and data systems
 *   by Liang_Zhang@esri.com
 */
var Viewport = function (view, data, ratio_xy) {
  this.__init(view, data, ratio_xy);
};

Viewport.prototype = {
  __init : function (view, data, ratio_xy) {
    this.__MinScale = 0.0000001;
    this.__MaxScale = 1000000.0;

    // View port in logical unit pixels
    this.__viewRect = new RectType (view.xmin, view.ymin, view.xmax, view.ymax);
    if (this.__viewRect.width < 1) {
      this.__viewRect.xmax = this.__viewRect.xmin+1;
    }
    if (this.__viewRect.height < 1) {
      this.__viewRect.ymax = this.__viewRect.ymin+1;
    }

    // Data rect in coordinates unit
    this.__dataRect = new RectType (data.xmin, data.ymin, data.xmax, data.ymax);
    if (this.__dataRect.width < this.__MinScale) {
      this.__dataRect.xmax = this.__dataRect.xmin + this.__MinScale;
    }
    if (this.__dataRect.height < this.__MinScale) {
      this.__dataRect.ymax = this.__dataRect.ymin + this.__MinScale;
    }

    // X_DPI/Y_DPI, default is 1.0. used when transformation
    this.__ratio = (__is_null(ratio_xy) || ratio_xy===0)? 1.0 : ratio_xy;

    // Viewport center point in logical unit
    this.__viewCP = this.__viewRect.center;

    // View data rect center which is same as viewCP
    this.__vdataCP = this.__dataRect.center;

    // current scale: view_rc/vdata_rc  (like: pixels/meter)
    this.__scale = 1.0;

    this.__setScale(this.__recalcScale()); // Set scale

    // retrieve current view pixel rect
    Object.defineProperty(this, 'viewRect', {
      get: function () {
        return this.__viewRect;
      }
    });

    // retrieve current full data rect
    Object.defineProperty(this, 'fullDataRect', {
      get: function () {
        return this.__dataRect.spawn();
      }
    });

    // retrieve current view data rect
    Object.defineProperty(this, 'viewDataRect', {
      get: function () {
        var w = this.__viewRect.width/this.__scale*0.5;
        var h = this.__viewRect.height/this.__scale*0.5;
        return new RectType(this.__vdataCP.x-w, this.__vdataCP.y-h, this.__vdataCP.x+w, this.__vdataCP.y+h);
      }
    });
  },

  __setScale : function (new_scale) {
    // Set current scale
    this.__scale = (new_scale < this.__MinScale )? this.__MinScale :
      (new_scale > this.__MaxScale? this.__MaxScale : new_scale);
  },

  __recalcScale : function () {
    // Recalc scale
    return Math.min(this.__viewRect.width / this.__dataRect.width,
                    this.__viewRect.height / this.__dataRect.height);
  },

  init : function (rcView, rcData, ratioXY) {
    this.__ratio = ratioXY;
    this.setViewRect(rcView.xmin, rcView.ymin, rcView.xmax, rcView.ymax);
    this.setDataRect(rcData.xmin, rcData.ymin, rcData.xmax, rcData.ymax);
  },

  setResolution : function (unitPerPixel) {
    this.__setScale (1.0/unitPerPixel);
  },

  panView : function (vpDX, vpDY) {
    // move view, only the center of view data center changed
    // vpDX and vpDY are offsets of vp
    this.__vdataCP.x -= (vpDX / this.__scale);
    this.__vdataCP.y += (vpDY / this.__scale);
  },

  panViewPos : function (fromX, fromY, toX, toY) {
    this.panView(toX-fromX, toY-fromY);
  },

  setViewRect : function (xmin, ymin, xmax, ymax) {
    // Set drawing view extent
    this.__viewRect = new RectType(xmin, ymin, xmax, ymax);
    this.__viewCP = this.__viewRect.center;
  },

  setDataRect : function (xmin, ymin, xmax, ymax) {
    // Set destination data extent
    this.__dataRect = new RectType(xmin, ymin, xmax, ymax);
    this.__vdataCP = this.__dataRect.center;
    this.__setScale(this.__recalcScale());
  },
  
  zoomAt : function (vpX, vpY, times/*1.0*/) {
    // zoom at given view position vp(x, y)
    var dp = this.vp2dp(vpX, vpY);
    this.zoom(times);
    var vp2 = this.dp2vp(dp.x, dp.y);
    this.panView(vpX-vp2.x, vpY-vp2.y);
  },

  zoomBox : function (vx, vy, vx2, vy2) {
    var NTIMES = 99.9999;
    // enlarge to 100 times
    var dw = ((vx-vx2)*NTIMES).toFixed(0);       // dw as sign flag
    var dh = (Math.abs(vy-vy2)*NTIMES).toFixed(0);    // always dh > 0
    this.centerAt((vx+vx2)*0.5, (vy+vy2)*0.5);
    if (dw < 0) { // zoom in
      this.__setScale(this.__scale*Math.min(-this.__viewRect.width*NTIMES/dw, this.__viewRect.height*NTIMES/dh));
    }
    else if (dw > 0) { // zoom out
      this.__setScale(this.__scale*Math.min(dw/this.__viewRect.width/NTIMES, dh/this.__viewRect.height/NTIMES));
    }
  },

  panViewData : function (dX, dY) {
    this.__vdataCP.x += dX;
    this.__vdataCP.y += dY;
  },

  centerAt : function (vpX, vpY) {
    // move viewport's center to pos
    this.__vdataCP = this.vp2dp(vpX, vpY);
  },

  zoom : function (times) { /*times = 1.0*/
    // zoom in or out view. times is scale, must be > 0
    if (__is_null(times)) {
      times=1.0;
    }
    this.__setScale(this.__scale*Math.abs(times));
  },

  zoomCenter : function (times/*1.0*/) {
    // Just like the above. the difference is it resets view data's center
    if (__is_null(times)) {
      times=1.0;
    }
    this.__setScale(this.__scale*Math.abs(times));
    this.__vdataCP = this.__dataRect.center;
  },

  zoomAll : function (times/*1.0*/) {
    // display all destination with times of given parameter
    if (__is_null(times)) {
      times=1.0;
    }
    this.__vdataCP = this.__dataRect.center;
    this.__setScale(times * this.__recalcScale());
  },

  dp2vp : function (dx, dy) {
    dx -= this.__vdataCP.x;
    dy -= this.__vdataCP.y;
    return new PointType(Math.round(this.__viewCP.x+this.__scale*dx),
                      Math.round((this.__viewCP.y-this.__scale*dy)/this.__ratio));
  },

  dp2vp_n : function (dataPtArray) {
    var np = dataPtArray.length;
    var viewPosArray = new Array(np);
    var pt;
    while(np-->0) {
      pt = dataPtArray[np];
      viewPosArray[np] = this.dp2vp(pt.x, pt.y);
    }
    return viewPosArray;
  },

  vp2dp : function (vx, vy) {
    // transform point from view to data
    return new PointType (this.__vdataCP.x + (vx-this.__viewCP.x) / this.__scale,
                         this.__vdataCP.y - (vy*this.__ratio-this.__viewCP.y) / this.__scale);
  },

  vp2dp_n : function (viewPosArray) {
    var np = viewPosArray.length;
    var dataPtArray = new Array(np);
    var  pos;
    while(np-->0) {
      pos = viewPosArray[np];
      dataPtArray[np] = this.vp2dp(pos.x, pos.y);
    }
    return dataPtArray;
  },

  vl2dl : function (view_len) {
    // view length(vl) to data length(dl)
    return view_len / this.__scale;
  },

  dl2vl : function (data_len) {
    // data length(dl) to view length(vl)
    return data_len * this.__scale;
  },

  drc2vrc : function (drc) {
    // ^         max         o------------->
    // |  --------+          |  min 
    // |  |       |          |   +--------|
    // |  |  drc  |    ==>   |   |   vrc  |
    // |  +--------          |   |        |
    // | min                 |   ---------+
    // o------------->       V           max
    var minPt = this.dp2vp(drc.xmin, drc.ymax);
    var maxPt = this.dp2vp(drc.xmax, drc.ymin);  
    return new RectType(minPt.x, minPt.y, maxPt.x, maxPt.y); // View Rect
  },

  vrc2drc : function (vrc) {
    var minPt = this.vp2dp(vrc.xmin, vrc.ymax);
    var maxPt = this.vp2dp(vrc.xmax, vrc.ymin);
    return new RectType(minPt.x, minPt.y, maxPt.x, maxPt.y); // Data Rect
  }
};

