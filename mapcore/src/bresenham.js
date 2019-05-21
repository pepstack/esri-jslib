/**
 * bresenham.js
 *   implement bresenham algorithm for drawing shape
 * 2012/12/20 : Liang_Zhang@esri.com
 *
 * TODO: polygon, arc, roundrect, ...
 */
var Bresenham = function () {
};

/**
 * Bresenham's fill point
 */
Bresenham.drawPoint = function (drawContext, // Bresenham.DrawContext
  x, y,        // position of point
  size,        // size of point
  rgba)        // red = rgba[0], green = rgba[1], blue = rgba[2], alpha = rgba[3]
{
  if (size<=1) {
    drawContext.setPixel(x, y, rgba);
  }
  else {
    var u, v, w = Math.floor(size/2);
    for (u=x-w; u<x+w+1; u++) {
      for (v=y-w; v<y+w+1; v++) {
        drawContext.setPixel(u, v, rgba);
      }
    }
  }
};

/**
 * Bresenham's fill rectangle
 */
Bresenham.fillRect = function (drawContext,
  x1, y1, // point 1
  x2, y2, // point 2
  rgba) {
  var x0 = Math.min(x1, x2),
      y0 = Math.min(y1, y2),
      xm = Math.max(x1, x2),
      ym = Math.max(y1, y2);

  var x, y;
  for (x = x0; x < xm; x++) {
    for (y = y0; y < ym; y++) {
      drawContext.setPixel(x, y, rgba);
    }
  }
};

/**
 * Bresenham's draw rectangle
 */
Bresenham.strokeRect = function (drawContext,
  x1, y1,
  x2, y2,
  penWidth,
  rgba) {
  Bresenham.drawLine(drawContext, x1, y1, x1, y2, penWidth, rgba);
  Bresenham.drawLine(drawContext, x1, y2, x2, y2, penWidth, rgba);
  Bresenham.drawLine(drawContext, x2, y2, x2, y1, penWidth, rgba);
  Bresenham.drawLine(drawContext, x2, y1, x1, y1, penWidth, rgba);
};

/**
 * Bresenham's draw line algorithm
 */
Bresenham.drawLine = function (drawContext,
          x1, y1, // start point
          x2, y2, // send point
          penWidth,
          rgba) {
  x1 = Math.floor(x1+0.5);
  y1 = Math.floor(y1+0.5);
  x2 = Math.floor(x2+0.5);
  y2 = Math.floor(y2+0.5);

  var dx = Math.abs(x2 - x1),
      dy = Math.abs(y2 - y1),
      yy = 0,
      t;
  if (dx < dy) {
    yy = 1;
    t=x1; x1=y1; y1=t;
    t=x2; x2=y2; y2=t;
    t=dx; dx=dy; dy=t;
  }
  var ix = (x2 - x1) > 0 ? 1 : -1,
      iy = (y2 - y1) > 0 ? 1 : -1,
      cx = x1,
      cy = y1,
      n2dy = dy * 2,
      n2dydx = (dy - dx) * 2,
      d = dy * 2 - dx;
  if(yy==1) {
    while(cx != x2) {
      if(d < 0) {   
        d += n2dy;
      }
      else {
        cy += iy; 
        d += n2dydx;
      }
      Bresenham.drawPoint(drawContext, cy, cx, penWidth, rgba);
      cx += ix;
    }
  }
  else {   
    while(cx != x2) {    
      if(d < 0) {    
        d += n2dy;    
      }
      else {    
        cy += iy;    
        d += n2dydx;    
      }
      Bresenham.drawPoint(drawContext, cx, cy, penWidth, rgba);
      cx += ix;
    }
  }
};

/**
 * CubicBezier              _           _  _     _
 *                         |  1  0  0  0 || X0 Y0 |
 * [Xt, Yt] = [1 t t^2 t^3]| -3  3  0  0 || X1 Y1 |  t := [0, 1]
 *                         |  3 -6  3  0 || X2 Y2 |
 *                         |_-1  3 -3  1_||_X3 Y3_|
 * or:
 * P(t) = P0*(1-t)^3 + 3*P1*t*(1-t)^2 + 3*P2*t^2*(1-t) + P3*t^3;
 */
Bresenham.drawCubicBezier = function (drawContext,
          x0, y0,     // start point
          x1, y1,     // control point 1
          x2, y2,     // control point 2
          x3, y3,     // end point
          penWidth,
          rgba)       // color of pen
{
  var n = Math.abs(x3-x0) + Math.abs(y3-y0),
      d = 1.0/(n+1),
      t = d,
      x = x0,
      y = y0,
      Xt,
      Yt;

  var cubicBezier = (function(){
    return function(a, b, c, d, t) {
      return (a*(1-t)*(1-t)*(1-t) + 3*b*t*(1-t)*(1-t) + 3*c*t*t*(1-t) + d*t*t*t);
    };
  })();

  for (; t<1; t+=d) {
    Xt = cubicBezier(x0, x1, x2, x3, t);
    Yt = cubicBezier(y0, y1, y2, y3, t);
    if (Math.abs(Xt-x) + Math.abs(Yt - y) >= 1) {
      Bresenham.drawPoint(drawContext, x, y, penWidth, rgba);
      x = Xt;
      y = Yt;
    }
  }
  Bresenham.drawPoint(drawContext, x3, y3, penWidth, rgba);
};

/**
 * Bresenham's draw circle
 */
Bresenham.fillCircle = function (drawContext,
  centerX, centerY, radius, rgba) {
  var x = 0,
      y = radius,
      yi,
      d = 3 - 2 * radius;

  while (x <= y) {
    for (yi = x; yi <= y; yi ++) {
      drawContext._set_circle_8(centerX, centerY, x, yi, rgba);
    }
    if (d < 0) {
      d = d + 4 * x + 6;
    }
    else {
      d = d + 4 * (x - y);
      y--;
    }
    x++;
  }
};

Bresenham.strokeCircle = function (drawContext,
  centerX, centerY, radius, penWidth, rgba) {
  var x = 0,
      y = radius,
      d = 3 - 2 * radius;

  while (x <= y) {
    drawContext._set_circle_8_w(centerX, centerY, x, y, rgba, penWidth);
    if (d < 0) {
      d = d + 4 * x + 6;
    }
    else {
      d = d + 4 * (x - y);
      y--;
    }
    x++;
  }
};

/**
 * Bresenham.DrawContext
 *   draw pixel directly onto pixel array
 */
Bresenham.DrawContext = function (pixelArray, width, height, hasAlpha) {
  this._init(pixelArray, width, height);
};

Bresenham.DrawContext.prototype = {
  _init : function (pixelArray, width, height, hasAlpha) {
    this._pa = pixelArray;
    this._cx = width;
    this._cy = height;
    this._alpha = ((hasAlpha===null||hasAlpha===undefined)? false : hasAlpha);
  },

  _setRGB : function (x, y, r, g, b) {
    if (x>=0 && x<this._cx && y>=0 && y<this._cy) {
      y = (y*this._cx+x) * 4;
      this._pa[y] = r;
      this._pa[y+1] = g;
      this._pa[y+2] = b;
    }
  },

  _setRGBA : function (x, y, r, g, b, a) {
    if (x>=0 && x<this._cx && y>=0 && y<this._cy) {
      y = (y*this._cx+x) * 4;
      this._pa[y] = r;
      this._pa[y+1] = g;
      this._pa[y+2] = b;
      this._pa[y+3] = a;
    }
  },

  _get : function (x, y) {
    var rgba = [];
    if (x>=0 && x<this._cx && y>=0 && y<this._cy) {
      y = (y*this._cx+x) * 4;
      rgba.push(this._pa[y]);
      rgba.push(this._pa[y+1]);
      rgba.push(this._pa[y+2]);
      if (this._alpha) {
        rgba.push(this._pa[y+3]);
      }
      return rgba;
    }
    return null;
  },

  _set_circle_8 : function (xc, yc, x, y, rgba) {
    this.setPixel(xc+x, yc+y, rgba);
    this.setPixel(xc-x, yc+y, rgba);
    this.setPixel(xc+x, yc-y, rgba);
    this.setPixel(xc-x, yc-y, rgba);
    this.setPixel(xc+y, yc+x, rgba);
    this.setPixel(xc-y, yc+x, rgba);
    this.setPixel(xc+y, yc-x, rgba);
    this.setPixel(xc-y, yc-x, rgba);
  },

  _set_circle_8_w : function (xc, yc, x, y, rgba, penWidth) {
    var w = Math.floor(penWidth/2);
    if (w<1) {
      return this._set_circle_8(xc, yc, x, y, rgba);
    }
    else {
      var u, v;
      for (u=xc-w; u<xc+w+1; u++) {
        for (v=yc-w; v<yc+w+1; v++) {
          this._set_circle_8(u, v, x, y, rgba);
        }
      }
    }
  },

  getPixel : function (x, y) {
    x = Math.floor(x+0.5);
    y = Math.floor(x+0.5);
    return this._get(x, y);
  },

  setPixel : function (x, y, rgba) {
    x = Math.floor(x+0.5);
    y = Math.floor(y+0.5);
    if (this._alpha) {
      this._setRGBA(x, y, rgba[0], rgba[1], rgba[2], rgba[3]);
    }
    else {
      this._setRGB(x, y, rgba[0], rgba[1], rgba[2]);
    }
  }
};

