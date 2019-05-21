/**
 * DrawInfo class
 *   drawing shape only used internally
 */
var DrawInfo = function (canvas, context, viewport) {
  this.__init(canvas, context, viewport);
};

DrawInfo.prototype = {
  __init : function (canvas, context, viewport) {
    // foreground canvas
    this.canvas   = canvas;
    this.context  = context;
    this.viewport = viewport;

    this.clipView = new RectType(0, 0, this.canvas.width, this.canvas.height); // viewed pixel rect
    this.clipData = this.viewport.viewDataRect;  // viewed data rect

    // public properties:
    //
    this.layerIndex = null;
    this.shapeIndex = null;
    this.symbolShapeIndex = null;

    // all valid renders in drawing stack, used only internally
    this.__renders = [];

    // current render for drawing, used only internally
    this.__current = null;
    this.__selectable = false;

    // background canvas for hit test
    this.__backend  = null;
    this.__backendContext = null;
    this.__backendImage = null;
    this.__backendData = null;
  },

  fillEnabled : function () {
    return (__not_null(this.__current) && this.__current.validateProp(this.__current.fillStyle));
  },

  strokeEnabled : function () {
    return (__not_null(this.__current) && this.__current.validateProp(this.__current.strokeStyle));
  },

  linearGradientEnabled : function (style) {
    if (__is_null(this.__current) || __is_null(this.__current.linearGradient)) {
      return false;
    }
    if (!this.__current.linearGradient.isValid()) {
      return false;
    }
    if (__is_null(style)) {
      return true;
    }
    return (this.__current.linearGradient.style===2 || this.__current.linearGradient.style===style);
  },

  getRGBA : function () {
    var rgba = [this.layerIndex+1, this.shapeIndex+1, (__is_null(this.symbolShapeIndex)? 0: this.symbolShapeIndex+1), 0];
    return rgba;
  },

  __validRender : function (render) {
    return (__not_null(this.context) && __not_null(render) && render.enabled);
  },

  saveBackend : function (backendCanvas, backendCanvasContext) {
    this.__backend = backendCanvas;
    this.__backendContext = backendCanvasContext;
    this.__backendImage = this.__backendContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.__backendData = this.__backendImage.data;
    this.__bresenhamDC = new Bresenham.DrawContext(this.__backendData, this.canvas.width, this.canvas.height, false);
  },

  restoreBackend : function () {
    this.__backendContext.putImageData(this.__backendImage, 0, 0);
    this.__backendImage = null;
    this.__backendData = null;
  },

  setDrawContext : function (canvas, context) {
    this.canvas = canvas;
    this.context = context;
  },

  getTextAttrName : function () {
    if (__not_null(this.__current) && this.__current.validateProp(this.__current.textAttrName)) {
      return this.__current.textAttrName;
    }
    else {
      return null;
    }
  },

  saveRender : function (render) {
    if (this.__validRender(render)) {
      if (this.__current !== render) {
        // ensure not saving repeated render
        this.__current = render;
        this.__renders.push(this.__current); // add after the end
        this.context.save();
        this.__current.setContext(this.context);
        return true;
      }
    }
    return false;
  },

  restoreRender : function (render, saved) {
    if (saved) {
      this._saved = false;
      var last = this.__renders.pop(); // remove the last
      if (this.__current===last) {
        var len = this.__renders.length;
        this.__current = (len===0? null : this.__renders[len-1]);
        this.context.restore();
      }
      else {
        throw ("DrawInfo.restore: illegal usage of this object");
      }
    }
  },

  toViewPos : function (p, symbolAtPt, symbolUnit) {
    if (__is_null(symbolAtPt)) {
      return this.viewport.dp2vp(p.x, p.y);
    }
    if (__is_null(symbolUnit) || !symbolUnit.pixelUnit) {
      // data unit to view unit
      return this.viewport.dp2vp(p.x+symbolAtPt.x, p.y+symbolAtPt.y);
    }
    // symbol unit is pixel unit
    var vp = this.viewport.dp2vp(symbolAtPt.x, symbolAtPt.y);
    vp.offset(p.x-symbolUnit.baseX, p.y-symbolUnit.baseY);
    return vp;
  },

  toViewLength : function (len, symbolUnit) {
    return (__is_null(symbolUnit) || !symbolUnit.pixelUnit)? this.viewport.dl2vl(len) : len;
  },

  beginShape : function (selectable) {
    this.__selectable = (__not_null(this.__backendData) && selectable===true);
    this.context.beginPath();
  },

  endShape : function () {
    if (this.fillEnabled()) {
      this.context.fill();
    }
    if (this.strokeEnabled()) {
      this.context.stroke();
    }
  },

  drawRoundRect : function (rc, R1, R2, R3, R4) {
    this.context.beginPath();
    this.context.moveTo(rc.xmin+R1, rc.ymin);
    this.context.lineTo(rc.xmax-R2, rc.ymin);
    if (R2>0) {
      this.context.arc(rc.xmax-R2, rc.ymin+R2, R2, Math.PI*1.5, Math.PI*2, false);
    }
    this.context.lineTo(rc.xmax, rc.ymax-R3);
    if (R3>0) {
      this.context.arc(rc.xmax-R3, rc.ymax-R3, R3, 0, Math.PI/2, false);
    }
    this.context.lineTo(rc.xmin+R4, rc.ymax);
    if (R4>0) {
      this.context.arc(rc.xmin+R4, rc.ymax-R4, R4, Math.PI/2, Math.PI, false);
    }
    this.context.lineTo(rc.xmin, rc.ymin+R1);
    if (R1>0) {
      this.context.arc(rc.xmin+R1, rc.ymin+R1, R1, Math.PI, Math.PI*1.5, false);
    }
    this.context.closePath();

    var oldStyle,
        gr = (this.linearGradientEnabled()? this.__current.linearGradient.createDrawStyle(this.context, rc): null);

    if (__not_null(gr) && this.__current.linearGradient.fillEnabled()) {
      // fill by linearGradient
      oldStyle = this.context.fillStyle;
      this.context.fillStyle = gr;
      this.context.fill();       
      this.context.fillStyle = oldStyle;
    }
    else if (this.fillEnabled()) {
      // fill by color
      this.context.fill();
    }

    if (__not_null(gr) && this.__current.linearGradient.strokeEnabled()) {
      // stroke by linearGradient
      oldStyle = this.context.strokeStyle;
      this.context.strokeStyle = gr;
      this.context.stroke();       
      this.context.strokeStyle = oldStyle;
    }
    else if (this.strokeEnabled()) {
      // stroke by color
      this.context.stroke();
    }

    //?? if (__not_null(this.__current.fillImage)) {
    //??   this.context.drawImage(this.__current.fillImage, rc.xmin, rc.ymin, rc.width, rc.height);
    //?? }

    if (this.__selectable) {
      var rgba = this.getRGBA();
      if (this.fillEnabled() || this.linearGradientEnabled(0) || __not_null(this.__current.fillImage)) {
        //TODO?? fillRoundRect
        Bresenham.fillRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, rgba);
      }
      if (this.strokeEnabled() || this.linearGradientEnabled(1)) {
        //TODO?? strokeRoundRect
        Bresenham.strokeRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, this.context.lineWidth, rgba);
      }
    }
  },

  drawCircle : function (centerX, centerY, radius) {
    this.context.arc(centerX, centerY, radius, 0, Math.PI*2, true);

    if (this.__selectable) {
      var rgba = this.getRGBA();
      if (this.fillEnabled()) {
        Bresenham.fillCircle(this.__bresenhamDC, centerX, centerY, radius, rgba);
      }
      if (this.strokeEnabled()) {
        Bresenham.strokeCircle(this.__bresenhamDC, centerX, centerY, radius, this.context.lineWidth, rgba);
      }
    }
  },

  drawBezier : function (start, end, cp1, cp2) {
    this.context.moveTo(start.x, start.y);
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    if (this.__selectable) {
      Bresenham.drawCubicBezier(this.__bresenhamDC,
        start.x, start.y, cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y,
        this.context.lineWidth+2, this.getRGBA());
    }
  },

  drawRect : function (rc, text) {
    var oldStyle,
        gr = (this.linearGradientEnabled()? this.__current.linearGradient.createDrawStyle(this.context, rc): null);

    if (__not_null(gr) && this.__current.linearGradient.fillEnabled()) {
      // fill by linearGradient
      oldStyle = this.context.fillStyle;
      this.context.fillStyle = gr;
      this.context.fill();       
      this.context.fillStyle = oldStyle;
    }
    else if (this.fillEnabled()) {
      // fill by color
      this.context.fillRect(rc.xmin, rc.ymin, rc.width, rc.height);
    }

    if (__not_null(gr) && this.__current.linearGradient.strokeEnabled()) {
      // stroke by linearGradient
      oldStyle = this.context.strokeStyle;
      this.context.strokeStyle = gr;
      this.context.stroke();       
      this.context.strokeStyle = oldStyle;
    }
    else if (this.strokeEnabled()) {
      // stroke by color
      this.context.strokeRect(rc.xmin, rc.ymin, rc.width, rc.height);
    }

    // draw rect image of render
    if (__not_null(this.__current.fillImage)) {
      this.context.drawImage(this.__current.fillImage, rc.xmin, rc.ymin, rc.width, rc.height);
    }

    // draw rect text
    if (__not_empty(text)) {
      this.drawText(text, rc);
    }

    if (this.__selectable) {
      var rgba = this.getRGBA();
      if (this.fillEnabled() || this.linearGradientEnabled(0) || __not_null(this.__current.fillImage)) {
        Bresenham.fillRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, rgba);
      }
      if (this.strokeEnabled() || this.linearGradientEnabled(1)) {
        Bresenham.strokeRect(this.__bresenhamDC, rc.xmin, rc.ymin, rc.xmax, rc.ymax, this.context.lineWidth, rgba);
      }
    }
  },

  drawText : function (text, rect) {
    var textWidth = this.context.measureText(text).width;
    while (textWidth > rect.width && text.length>3) {
      text = text.slice(0, text.length-3);
      text += "..";
      textWidth = this.context.measureText(text).width;
    }

    var savedStyle = this.context.fillStyle;
    
    this.context.fillStyle = this.__current.textStyle;

    if (this.context.textAlign==="left") {
      this.context.fillText(text, rect.xmin, rect.ymin);
    }
    else if (this.context.textAlign==="right") {
      this.context.fillText(text, rect.xmax, rect.ymin);
    }
    else {
      this.context.fillText(text, (rect.xmin+rect.xmax)/2, rect.ymin);
    }

    this.context.fillStyle = savedStyle;
  }
};

