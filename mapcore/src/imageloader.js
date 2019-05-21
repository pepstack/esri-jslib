/**
 * ImageLoader
 *   HTML5 preload images
 */
var ImageLoader = function (afterLoadFunc, opt_param) {
  this._init(afterLoadFunc, opt_param);
};

ImageLoader.prototype = new AttributesMap();

ImageLoader.prototype._init = function (afterLoadFunc, opt_param) {
  this.__map = {};  // used by AttributesMap
  this.onImageLoad = afterLoadFunc; // function (imgState)
  this.param = opt_param;
  this.readyCount = 0;
};

ImageLoader.prototype.toString = function () {
  return "ImageLoader class";
};

ImageLoader.prototype.addImage = function (imgName, imgSrc, opt_param) {
  __log("add image: ", imgName, "=>", imgSrc);
  this.addAttribute(imgName, new ImageLoader.ImageState(imgName, imgSrc, this, opt_param));
};

ImageLoader.prototype.getImagesCount = function () {
  return this.getAttributesCount();
};

ImageLoader.prototype.loadAll = function () {
  var i = 0,
      num = this.getImagesCount(),
      imgState;

  for (; i<num; i++) {
    imgState = this.getAttributeAt(i);
    imgState._doLoad();
  }
};

ImageLoader.prototype.allReady = function () {
  return (this.getImagesCount()==this.readyCount);
};

ImageLoader.prototype.getImageState = function (name) {
  return this.getAttribute(name);
};

ImageLoader.prototype.getImage = function (name) {
  var imgState = this.getImageState(name);
  if (__not_null(imgState) && imgState.ready) {
    return imgState.image;
  }
  return null;
};

ImageLoader.ImageState = function (name, imgSrc, imageLoader, opt_param) {
  this.name = name;
  this.ready = false;
  this.imgSrc = imgSrc;
  this.param = opt_param;
  this.loader = imageLoader;
  this.image = new Image();
};

ImageLoader.ImageState.prototype._doLoad = function () {
  this.image.addEventListener('load', ImageLoader.ImageState.onReady(this), false);
  this.image.src = this.imgSrc;
};

ImageLoader.ImageState.onReady = function (imgState) {
  return function () {
    imgState.ready = true;
    imgState.loader.readyCount++;

    __log("image loaded: ", imgState.name, "<=", imgState.imgSrc);
    if (__not_null(imgState.loader.onImageLoad)) {
      imgState.loader.onImageLoad(imgState);
    }
  };
};

