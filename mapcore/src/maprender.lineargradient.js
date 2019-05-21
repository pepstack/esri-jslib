/**
 * MapRender.LinearGradient
 */
MapRender.LinearGradient = function (style, direction) {
  this._init(style, direction);
};

MapRender.LinearGradient.Directions = ['WE', 'EW', 'SN', 'NS', 'SWNE', 'NESW', 'NWSE', 'SENW'];
MapRender.LinearGradient.Styles = ['fill', 'stroke', 'both'];

MapRender.LinearGradient.prototype._init = function (style, direction) {
  var i;
  this.style = -1;
  this.direction = -1;

  for (i=0; i<MapRender.LinearGradient.Directions.length; i++) {
    if (MapRender.LinearGradient.Directions[i]===direction) {
      this.direction = i;
      break;
    }
  }

  for (i=0; i<MapRender.LinearGradient.Styles.length; i++) {
    if (MapRender.LinearGradient.Styles[i]===style) {
      this.style = i;
      break;
    }
  }

  this.colors = {};
};

MapRender.LinearGradient.prototype.addColorStop = function (at, color) {
  this.colors[at] = color;
};

MapRender.LinearGradient.prototype.isValid = function () {
  return (this.style!==-1 && this.direction!==-1);
};

MapRender.LinearGradient.prototype.fillEnabled = function () {
  return (this.style===0||this.style===2);
};

MapRender.LinearGradient.prototype.strokeEnabled = function () {
  return (this.style===1||this.style===2);
};

// (xmin,ymin) N
//       +----------+
//  W    |          |   E
//       |          |
//       +----------+ (xmax, ymax)
//             S
MapRender.LinearGradient.prototype.createDrawStyle = function (context, rect) {
  var at, grObj, x1, y1, x2, y2;

  switch (this.direction) {
  case 0:
    x1=rect.xmin;
    y1=rect.ymin;
    x2=rect.xmax;
    y2=rect.ymin;
    break;
  case 1:
    x1=rect.xmax;
    y1=rect.ymin;
    x2=rect.xmin;
    y2=rect.ymin;
    break;
  case 2:
    x1=rect.xmin;
    y1=rect.ymax;
    x2=rect.xmin;
    y2=rect.ymin;
    break;
  case 3:
    x2=rect.xmin;
    y2=rect.ymax;
    x1=rect.xmin;
    y1=rect.ymin;
    break;
  case 4:
    x1=rect.xmin;
    y1=rect.ymax;
    x2=rect.xmax;
    y2=rect.ymin;
    break;
  case 5:
    x2=rect.xmin;
    y2=rect.ymax;
    x1=rect.xmax;
    y1=rect.ymin;
    break;
  case 6:
    x1=rect.xmin;
    y1=rect.ymin;
    x2=rect.xmax;
    y2=rect.ymax;
    break;
  case 7:
    x2=rect.xmin;
    y2=rect.ymin;
    x1=rect.xmax;
    y1=rect.ymax;
    break;
  }

  grObj = context.createLinearGradient(x1, y1, x2, y2);

  // Add the color stops
  for (at in this.colors) {
    grObj.addColorStop(at, this.colors[at]);
  }

  return grObj;
};
