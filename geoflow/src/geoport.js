/**
 * GeoPort class
 */
var GeoPort = function (id, type, name, geoNode) {
  this._init(id, type, name, geoNode);
};

GeoPort.DirectionInput = "esriGPParameterDirectionInput";
GeoPort.DirectionOutput = "esriGPParameterDirectionOutput";

GeoPort.ParameterRequired = "esriGPParameterTypeRequired";
GeoPort.ParameterOptional = "esriGPParameterTypeOptional";

GeoPort.create = function (geoNode, portJSON) {
  if (portJSON.direction===GeoPort.DirectionInput) {
    if (geoNode.inports.size() > NodeTypes.MaxPorts) {
      throw new Error("GeoPort.create: exceed max inports: "+NodeTypes.MaxPorts);
    }
    var inPort = new GeoPort(portJSON.name, "IN", portJSON.name, geoNode);
    inPort.setData(portJSON);
    geoNode.inports.insert(inPort.id, inPort);
    return inPort;
  }
  else if (portJSON.direction===GeoPort.DirectionOutput) {
    if (geoNode.outports.size() > NodeTypes.MaxPorts) {
      throw new Error("GeoPort.create: exceed max outports: "+NodeTypes.MaxPorts);
    }
    var outPort = new GeoPort(portJSON.name, "OUT", portJSON.name, geoNode);
    outPort.setData(portJSON);
    geoNode.outports.insert(outPort.id, outPort);
    return outPort;
  }
  else {
    throw new Error("GeoPort.create: invalid port type: "+portJSON.direction);
  }
};

GeoPort.prototype = {
  _init : function (id, type, name, geoNode) {
    this.id = id;
    this.type = type; // IN, OUT
    this.name = name;
    this.displayName = this.name;
    this.required = false;
    this.parentNode = geoNode;

    this.tagShape = null; // dot shape of node symbol
    this.links = {};      // all links to this port

    // set by create function and not change it
    this.dataType = "";
    this.defaultValue = "";

    this.validateResult = "";
  },

  getTypeId : function () {
    return (this.type+":"+this.id); // IN:2
  },

  // GeoPort.setData
  setData : function (portJSON) {
    this.displayName = portJSON.displayName;
    this.description = __not_null(portJSON.description)? portJSON.description : "";
    this.dataType = portJSON.dataType;
    this.defaultValue = portJSON.defaultValue;
    this.required = (portJSON.parameterType===GeoPort.ParameterRequired)? true : false;

    if (__not_null(this.defaultValue)) {
      try{
        var defaultValueString = JSON.stringify(this.defaultValue);
        __log("===", this.displayName, defaultValueString);
        if (defaultValueString.length > 0) {
          // required=false when port has a non-empty defaultValue
          this.required = false;
        }
      }
      catch(e) {
        __log("GeoPort.setData(): Invalid JSON object.");
      }
    }
  },

  isValid : function () {
    return true;
  },

  toString : function () {
    return "GeoPort class";
  },

  getNextLink : function (curLink) {
    var linkId, link = curLink;
    for (linkId in this.links) {
      if (this.links.hasOwnProperty(linkId)) {
        if (__is_null(link)) {
          // get first link
          return this.links[linkId];
        }
        else if (linkId===curLink.id) {
          // find current, set return next time
          link = null;
        }
      }
    }
    return null;
  },

  getLinkedPort : function () {
    var link = this.getNextLink();
    if (__not_null(link)) {
      if (this===link.fromPort) {
        return link.toPort;
      }
      else if (this===link.toPort) {
        return link.fromPort;
      }
      else {
        throw new Error("GeoPort.getLinkedPort(): Critical Error. should never run to this");
      }
    }
    return null;
  },

  attachLink : function (link) {
    this.links[link.id] = link;
  },

  detachLink : function (link) {
    delete(this.links[link.id]);
    this.links = [];
  },

  getPosition : function (mapCanvas) {
    var nodePt = this.parentNode.tagShape.item(0);
    var nodePos = mapCanvas.toViewPos(nodePt.x, nodePt.y);
    var pos = this.tagShape.item(0).spawn();
    pos.offset(nodePos.x, nodePos.y);
    return pos;
  },

  getPoint : function (mapCanvas) {
    var pos = this.getPosition(mapCanvas);
    return mapCanvas.toMapPoint(pos.x, pos.y);
  },

  setPoint : function (mapCanvas) {
    var pos = this.getPosition(mapCanvas);
    var pt = mapCanvas.toMapPoint(pos.x, pos.y);
    this.tagShape.item(0).x = pt.x;
    this.tagShape.item(0).y = pt.y;
  },

  getIconShape : function () {
    var nodeSymbol = this.parentNode.typedNode.getNodeSymbol();
    return nodeSymbol.getAttribute(this.getTypeId());
  },

  matchPort : function (port) {
    if (__not_null(this.getNextLink())) {
      // has linked
      return false;
    }
    if (__is_empty(port.dataType) || __is_empty(this.dataType)) {
      return true;
    }

    if (port.dataType===this.dataType) {
      return true;
    }

    if ((port.dataType==="GPFeatureRecordSetLayer" && this.dataType==="Geometries") ||
        (this.dataType==="GPFeatureRecordSetLayer" && port.dataType==="Geometries")) {
      return true;
    }
    if (port.dataType !== this.dataType) {
      __log("port dataTypes not matched: ", port.dataType, this.dataType);
      return false;
    }

    //??TODO: check port value type
    return true;
  },

  validate : function () {
    this.validateResult = "";
    var link = this.getNextLink();
    if (this.required) {
      if (__is_null(link)) {
        this.validateResult = "A required port " + this.getTypeId() +
          " (node " + this.parentNode.id + ": " +
          this.parentNode.displayName +") has no link found";

        throw new Error(this.validateResult);
      }
    }
  },

  getDefaultValueJson: function () {
    var defValString = "";
    if (__is_null(this.defaultValue)) {
      defValString = __quot_str(defValString);
    }
    else if (typeof this.defaultValue==="object") {
      defValString = JSON.stringify(this.defaultValue);
      return defValString;
    }
    else if (typeof this.defaultValue==="number") {
      defValString = __quot_str(this.defaultValue);
    }
    else {
      try {
        defValString = JSON.stringify(JSON.parse(this.defaultValue));
        return defValString;
      }
      catch (e) {
        // not a JSON object
      }
      defValString = this.defaultValue+"";
      defValString = defValString.replace(/\"/g, "");
      defValString = __quot_str(defValString);
    }
    return defValString;
  },

  // GeoPort.toJsonString
  toJsonString : function() {
    var json = "";

    json += __indent_spc+__indent_spc+__indent_spc;
    json += __quot_str(this.name);
    json += ":{\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("id");
    json += ":";
    json += __quot_str(this.id);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("displayName");
    json += ":";
    json += __quot_str(this.displayName);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;
    
    json += __quot_str("description");
    json += ":";
    json += __quot_str(this.description);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("type");
    json += ":";
    json += __quot_str(this.dataType);
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    json += __quot_str("required");
    json += ":";
    json += this.required;
    json += ",\n";
    json += __indent_spc+__indent_spc+__indent_spc+__indent_spc;

    // GeoPort.defaultValue
    json += __quot_str("defaultValue");
    json += ":";
    json += this.getDefaultValueJson();
    json += "\n";
    json += __indent_spc+__indent_spc+__indent_spc;
    json += "}";

    return json;
  }
};

