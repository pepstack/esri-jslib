/**
 * MapWidget class
 */
var MapWidget = function (name, opt_tag) {
  this._init(name, opt_tag);
};

MapWidget.prototype = {
  _init : function (name, opt_tag) {
    this.name = name;
    this.tag = opt_tag;
    this.visible = true;
    this.imageState = null;
  },

  setImage : function (imageState, cx, cy, pos) {
    this.imageState = imageState;
    this.cx = cx;
    this.cy = cy;
    this.position = pos;
  },

  _draw : function (context, canvasWidth, canvasHeight) {
    if (this.visible) {
      __log("MapWidget._draw: ", this.name);
      if (this.position==="right-bottom") {
        context.drawImage(this.imageState.image, canvasWidth-this.cx, canvasHeight-this.cy);
      }
      else if (this.position==="left-top") {
        context.drawImage(this.imageState.image, 0, 0);
      }
    }
  }
};

