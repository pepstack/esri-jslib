/**
 * MapRender class
 */
var MapRender = function (name, tag) {
  this._init(name, tag);
};

MapRender.prototype._init = function (name, tag) {
  this.name = name; // unique name used to identify a render in renders
  this.tag = tag;
  this.enabled = true;

  //@globalAlpha = (1.0=completely opaque; 0.0=completely transparent)
  this.globalAlpha = 1.0;

  //@globalCompositeOperation = (copy|destination-atop|destination-in|destination-out|destination-over|
  //   lighter|source-atop|source-in|source-out|source-over|xor)
  this.globalCompositeOperation = "source-over";
    
  this.strokeStyle = "#FF0000"; // line color value, set =null for not drawing line
  this.fillStyle = "#00FF00";   // fill color value, set =null for not filling color
  this.fillImage = null;        // fill pattern image

  this.lineCap = "square";      // {butt|round|square}
  this.lineJoin = "miter";      // {miter|bevel|round}
  this.lineWidth = 3;           // default = 1.0
  this.miterLimit = 10;

  this.textStyle = "#000";
  this.textAttrName = null;     // specify the attribute of shape needed to draw text
  this.textAlign = "left";      // {center|start|end|left|right}
  this.textBaseline = "top";    // {top|hanging|middle|alphabetic|ideographic|bottom}

  this.fontStyle = "normal";    // {normal|italic|oblique|inherit}
  this.fontWeight = "400";      // {normal|bold|bolder|lighter|100|...|900|inherit|auto}
  this.fontSize = "10pt";
  this.fontFace = "Times New Roman";

  // gradient
  this.linearGradient = null;
  this.radialGradient = null;

  this.shadowBlur = 0; // 8 is perfect
  this.shadowColor = "#000";
  this.shadowOffsetX = 0;
  this.shadowOffsetY = 0;

  //@font
  Object.defineProperty(this, 'font', {
    get: function () {
      return (this.fontStyle+" "+this.fontWeight+" "+this.fontSize+" "+ this.fontFace);
    }
  });
};

MapRender.prototype.validateProp = function (prop) {
  return (__not_empty(prop) && prop!="undefined");
};

MapRender.prototype.setContext = function (context) {
  context.textAlign = this.textAlign;
  context.textBaseline = this.textBaseline;
  context.lineCap = this.lineCap;
  context.lineJoin = this.lineJoin;
  context.lineWidth = this.lineWidth;
  context.miterLimit = this.miterLimit;
  context.font = this.font;
  context.globalAlpha = this.globalAlpha;
  context.globalCompositeOperation = this.globalCompositeOperation;
  if (this.validateProp(this.strokeStyle)) {
    context.strokeStyle = this.strokeStyle;
  }
  if (this.validateProp(this.fillStyle)) {
    context.fillStyle = this.fillStyle;
  }
  context.textAlign = this.textAlign;
  context.textBaseline = this.textBaseline;  
  context.lineCap = this.lineCap;
  context.lineJoin = this.lineJoin;
  context.lineWidth = this.lineWidth;
  context.miterLimit = this.miterLimit;
  context.font = this.font;
  context.shadowBlur = this.shadowBlur;
  context.shadowColor = this.shadowColor;
  context.shadowOffsetX = this.shadowOffsetX;
  context.shadowOffsetY = this.shadowOffsetY;      
};

MapRender.prototype.setStroke = function (color, width, cap, join) {
  this.strokeStyle = color;
  this.lineWidth = __not_null(width)? width : 0;
  this.lineCap = __not_null(cap)? cap : "square";
  this.lineJoin = __not_null(join)? join : "miter";
};

MapRender.prototype.setFill = function (color, image) {
  this.fillStyle = color;
  this.fillImage = image;
};

MapRender.prototype.setText = function (color, attrName, align, baseline) {
  this.textStyle = __not_null(color)? color : "#000";
  this.textAttrName = attrName;  
  this.textAlign = __not_null(align)? align : "left";
  this.textBaseline = __not_null(baseline)? baseline: "top";
};

MapRender.prototype.setFont = function (style, weight, size, face) {
  this.fontStyle = __not_null(style)? style: "normal";
  this.fontWeight = __not_null(weight)? weight: "400";
  this.fontSize = __not_null(size)? size: "10pt";
  this.fontFace = __not_null(face)? face: "Times New Roman";
};

MapRender.prototype.setShadow = function (blur, color, offsetX, offsetY) {
  if (__not_null(blur)) {
    this.shadowBlur = blur;
    this.shadowColor = color;
    this.shadowOffsetX = offsetX;
    this.shadowOffsetY = offsetY;
  }
  else {
    this.shadowBlur = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
  }
};

MapRender.prototype.setLinearGradient = function () {
  var args = Array.prototype.slice.call(arguments);
  if (args.length>2) {
    this.linearGradient = new MapRender.LinearGradient(args[0][0], args[0][1]);
    if (this.linearGradient.isValid()) {
      for (var i=1; i<args.length; i++) {
        this.linearGradient.addColorStop(args[i][0], args[i][1]);
      }
    }
  }
};

