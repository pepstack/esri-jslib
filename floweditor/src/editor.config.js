/**
 * GeoFlowEditor functions class
 *   these should be implemented by caller
 */
GeoFlowEditor.instance = null;  // GeoFlowEditor instance
GeoFlowEditor.nodeDialog = null;

GeoFlowEditor.getParamsHTML = function (parameters, paramType) {
  var html="";
  for (var i=0; i<parameters.length; i++) {
    var param = parameters[i];
    if (param.direction===paramType) {
      html += "<br/><span style='margin-left:20px; font-size:9pt'><b>"+param.displayName+"</b></span>"+
        "<ul style='padding-left:40px; list-style-type:circle; width:auto; min-height:0; margin:0;'>"+
          "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+param.dataType+"</li>"+
          "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+param.parameterType+"</li>";
          if (__not_null(param.description)) {
            html += "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+param.description+"</li>";
          }
      html += "</ul>";
    }
  }
  return html;
};

GeoFlowEditor.getNodeHTML = function (nodeURL, data) {
  var html =
    "<p><a href='javascript:void(0);' onclick='window.open(\""+nodeURL+"\");return false;'>"+
    "<span style='color:green;margin-left:0px;font-size:11pt;'><strong>"+data.displayName+"</strong></span></a></p>";

    if (__not_null(data.description)) {
      html += "<ul style='padding-left:40px; list-style-type:circle; width:auto; min-height:0; margin:0;'>"+
                "<li style='margin-left:0px; font-size:8pt; list-style-type:inherit; width:auto;'>"+data.description+"</li>"+
              "</ul>";
    }

    html +=
    "<p/><strong>Input Parameters:</strong></p>"+
      GeoFlowEditor.getParamsHTML(data.parameters, "esriGPParameterDirectionInput")+
    "<p/><strong>Output Parameters:</strong></p>"+
      GeoFlowEditor.getParamsHTML(data.parameters, "esriGPParameterDirectionOutput")+
    "<p/>"+
    "<p>"+
      "<a href='javascript:void(0);' onclick='window.open(\""+data.helpUrl+"\");return false;'>"+
      "<span style='color:green;margin-left:0px;font-size:11pt'><strong>Help</strong></span></a>"+
    "</p>";
  return html;
};

GeoFlowEditor.ajaxGetNodeJSON = function (svcName, nodeURL, divOutput) {
  $.ajax({
    url: nodeURL,
    dataType: 'jsonp', // cross domain using: jsonp
    timeout: 6000,
    data: {f:"json", pretty:"true"},
    success: function(data){
      dlgParam.nodeJSON = data;
      dlgParam.nodeURL = nodeURL;
      divOutput.name = svcName;
      divOutput.innerHTML = GeoFlowEditor.getNodeHTML(nodeURL, data);
      dlgParam.enableButton("Ok", "Cancel", "Apply");
    },
    error: function(data){
      var errMsg = "<h3>Error to get URL:<h3>"+"<p><a href='"+nodeURL+"'>"+nodeURL+"</a></p>";
      errMsg += "<p>"+data.statusText+"</p>";
      divOutput.name = svcName;
      divOutput.innerHTML = errMsg;    
    }
  });
};

GeoFlowEditor.refreshNodeURL = function (nodeTypeName, urlID, outputID) {
  var elUrl = __get_elem(urlID),
      elOut = __get_elem(outputID),
      selOpt;

  switch(nodeTypeName) {
  case esri2.GeoFlow.NodeTypes.NodeGpSync:
  case esri2.GeoFlow.NodeTypes.NodeGpAsync:
    selOpt = elUrl.options[elUrl.selectedIndex];
    GeoFlowEditor.ajaxGetNodeJSON(selOpt.text, selOpt.value, elOut);
    break;

  case esri2.GeoFlow.NodeTypes.NodePubInput:
  case esri2.GeoFlow.NodeTypes.NodePubOutput:
    break;

  case esri2.GeoFlow.NodeTypes.NodeGeometry:
    selOpt = elUrl.options[elUrl.selectedIndex];
    dlgParam.nodeJSON = esri2.GeoFlow.Node.Geometry.operations[selOpt.value];
    dlgParam.nodeURL = dlgParam.nodeJSON.url + "/" + dlgParam.nodeJSON.name;
    elOut.name = selOpt.text;
    elOut.innerHTML = GeoFlowEditor.getNodeHTML(dlgParam.nodeURL, dlgParam.nodeJSON);
    dlgParam.enableButton("Ok", "Cancel", "Apply");
    break;

  case esri2.GeoFlow.NodeTypes.NodeFeature:
    // send to server to test node json
    var nodeURL = elUrl.value;
    $.ajax({
      url: nodeURL,
      dataType: 'jsonp', // cross domain using: jsonp
      timeout : 6000,
      data: {f:"json", pretty:"true"},
      success: function(data){
        dlgParam.nodeURL = nodeURL;
        var queryJSON = esri2.GeoFlow.Node.Feature.operations.query;

        for (var p=0; p<queryJSON.parameters.length; p++) {
          if (queryJSON.parameters[p].name==="inSR" || queryJSON.parameters[p].name==="outSR") {
            try {
              queryJSON.parameters[p].defaultValue = "\""+data.extent.spatialReference.wkid+"\"";
            }
            catch (e) {
              queryJSON.parameters[p].defaultValue = "\"\"";
            }          
          }
        }
        queryJSON.name = data.name;
        queryJSON.displayName = data.type +": "+queryJSON.name;

        dlgParam.nodeJSON = queryJSON; // from client config
        dlgParam.nodeJSON.url = nodeURL; // ---replaced by user input---

        elOut.name = nodeURL;
        elOut.innerHTML = GeoFlowEditor.getNodeHTML(dlgParam.nodeURL, dlgParam.nodeJSON);
        dlgParam.enableButton("Ok", "Cancel", "Apply");
      },
      error: function(data){
        var errMsg = "<h3>Error to get:<h3>"+"<p><a href='"+nodeURL+"'>"+nodeURL+"</a></p>";
        errMsg += "<p>"+data.statusText+"</p>";
        elOut.name = nodeURL;
        elOut.innerHTML = errMsg;
      }
    });
    break;
  }
};

GeoFlowEditor.getNodeStatusHTML = function (geoNode) {
  var divHTML = "";
  if (!geoNode.isDefaultStatus()) {
    divHTML = 
      "<div style='padding-left:10px; border:3px solid "+geoNode.getStatusColor()+";'>"+
        "JobStatus: "+geoNode.execStatus+
        "<br />Message: "+geoNode.errMessage+
      "</div>";
  }
  return divHTML;
};

GeoFlowEditor.getGpSyncDlgContent = function (geoNode) {
  var urls = GeoFlowEditor.GPServicesList[esri2.GeoFlow.NodeTypes.NodeGpSync];
  if (__is_null(urls)) {
    throw new Error("GeoFlowEditor.GPServicesList: GpSync not found");
  }

  var i, li, html;
  html = "<p>service URL:"+
           "<select id='__serviceURLs'>";
             
  for (i=0; i<urls.length; i++) {
    li = urls[i];
    html +=  "<option value='" + li.url + "'>" + li.name + "</option>";
  }
  html +=  "</select>"+
             "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
               esri2.GeoFlow.NodeTypes.NodeGpSync+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getGpAsyncDlgContent = function (geoNode) {
  var urls = GeoFlowEditor.GPServicesList[esri2.GeoFlow.NodeTypes.NodeGpAsync];
  if (__is_null(urls)) {
    throw new Error("GeoFlowEditor.GPServicesList: GpAsync not found");
  }
  var i, li, html;
  html = "<p>service URL:"+
           "<select id='__serviceURLs'>";
  for (i=0; i<urls.length; i++) {
    li = urls[i];
    html +=  "<option value='" + li.url + "'>" + li.name + "</option>";
  }
  html +=  "</select>"+
             "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
               esri2.GeoFlow.NodeTypes.NodeGpAsync+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getPubInputDlgContent = function (geoNode) {
  var outPort = geoNode.getOutPort(1);
  var html =
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<table>"+
      "<tr><td>Input Name:</td><td>"+geoNode.name+"</td></tr>"+
      "<tr><td>Data Type:</td><td>"+outPort.dataType+"</td></tr>"+
      "<tr><td>Default Value:</td><td>"+outPort.defaultValue+"</td></tr>"+
    "</table>";
  return html;
};

GeoFlowEditor.getPubOutputDlgContent = function (geoNode) {
  var inPort = geoNode.getInPort(1);
  var html =
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<table>"+
      "<tr><td>Output Name:</td><td>"+geoNode.name+"</td></tr>"+
      "<tr><td>Data Type:</td><td>"+inPort.dataType+"</td></tr>"+
      "<tr><td>Default Value:</td><td>"+inPort.defaultValue+"</td></tr>"+
      "<tr><td>Callout URL:</td><td>"+
        "<input id='__calloutURL' type='text' size='40' maxlength='1200' value='"+
          geoNode.typedNode.callout+"' oninput='GeoFlowEditor.checkInputValue(\""+
          esri2.GeoFlow.NodeTypes.NodePubOutput+"\", \"__calloutURL\");' />"+
        "</td></tr>"+
    "</table>";
  return html;
};

GeoFlowEditor.getGeometryDlgContent = function (geoNode) {
 var i, li, html, opId, op,
     operations = esri2.GeoFlow.Node.Geometry.operations;

  html = "<p>service URL:"+
           "<select id='__serviceURLs'>";
  for (opId in operations) {
    op = operations[opId];
    if (op.enabled) {
      html += "<option value='"+opId+"'>" + op.displayName + "</option>";
    }
  }
  html +=  "</select>";
  html +=  "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
             esri2.GeoFlow.NodeTypes.NodeGeometry+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getFeatureDlgContent = function (geoNode) {
  var html;
  // FeatureDemoURL = http://10.112.18.110:6080/arcgis/rest/services/GeoFlow/pm25_usa/FeatureServer/0
  html = "<p>"+
           "<input id='__serviceURLs' type='text' size='60' maxlength='1200' value='"+
           geoNode.url+
           "'/>"+
           "<input type='button' value='select' onclick='GeoFlowEditor.refreshNodeURL(\""+
              esri2.GeoFlow.NodeTypes.NodeFeature+"\", \"__serviceURLs\", \"__divNodeState\");' />"+
         "</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><div id='__divNodeState'></p>";
  return html;
};

GeoFlowEditor.getDispatchDlgContent = function (geoNode) {
  var i, html = "";
  html +=
    "<p><span style='color:green;margin-left:0px;font-size:11pt;'><strong>"+geoNode.displayName+"</strong></span></p>"+
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<p/><strong>Inputs:</strong></p>";

  var numInPorts = geoNode.getInPort();
  for (i=1; i<=numInPorts; i++) {
    var inPort = geoNode.getInPort(i);
    if (i!==1) {
      html += "<br/>";
    }
    html += "<span style='margin-left:20px; font-size:9pt'><b>"+inPort.displayName+"</b></span>";
      var inPort2 = inPort.getLinkedPort();
      if (__not_null(inPort2)) {
        html += "<span style='margin-left:20px; font-size:9pt'>("+inPort2.parentNode.getTitle()+")</span>";
      }
      html += "<br/><span style='margin-left:40px; font-size:9pt'>"+inPort.dataType+"</span>";    
  }

  html +=
    "<p/><strong>Outputs:</strong></p>";

  var numOutPorts = geoNode.getOutPort();
  for (i=1; i<numOutPorts; i++) {
    var outPort = geoNode.getOutPort(i);
    if (i!==1) {
      html += "<br/>";
    }
    html += "<span style='margin-left:20px; font-size:9pt'><b>"+outPort.displayName+"</b></span>";
    var outPort2 = outPort.getLinkedPort();
    if (__not_null(outPort2)) {
      html += "<span style='margin-left:20px; font-size:9pt'>("+outPort2.parentNode.getTitle()+")</span>";
    }
    html += "<br/><span style='margin-left:40px; font-size:9pt'>"+outPort.dataType+"</span>";
  }
  return html;
};

GeoFlowEditor.getDefaultValDlgContent = function (geoNode) {
  var html = "";
  html += 
    GeoFlowEditor.getNodeStatusHTML(geoNode)+
    "<table>";

  var num = geoNode.getOutPort();
  for (var i = 1; i< num; i++) {
    var port = geoNode.getOutPort(i);
    html += 
      "<tr>"+
        "<td>"+port.displayName+":</td>"+
        "<td><textarea rows='3' cols='40' style='resize:none;' id='"+port.name+"' oninput='GeoFlowEditor.checkInputValue(\""+
        esri2.GeoFlow.NodeTypes.NodeDefaultVal+"\",\""+port.name+"\");'>"+
        port.defaultValue+
        "</textarea></td>"+
        "<td>("+port.dataType+")</td>"+
      "</tr>";
  }

  html +=
    "</table>";

  if (num===1) {
    html = "<p>No link found with this node</p>";
  }
  return html;
};

GeoFlowEditor.getAssignmentDlgContent = function (geoNode) {
  var html;
  html = "<p>Description:</p>"+
         GeoFlowEditor.getNodeStatusHTML(geoNode)+
         "<p><input id='assignment_desc' type='text' size='60' "+ 
         (GeoFlowEditor.instance.readOnly? "readonly='true' " : " ") +
            "maxlength='1200' value='"+
            geoNode.typedNode.description+
            "' oninput='GeoFlowEditor.checkInputValue(\""+
            esri2.GeoFlow.NodeTypes.NodeAssignment+
            "\", \"assignment_desc\");' />"+
         "</p>";
  return html;
};

GeoFlowEditor.checkInputValue = function (nodeType, inputID) {
  var inp = __get_elem(inputID);
  __log(inp.value);

  //??TODO: check inp.value
  if (nodeType===esri2.GeoFlow.NodeTypes.NodeAssignment) {
    dlgParam.thisNode.setServiceState(inputID, inp.value);
    dlgParam.enableButton("Ok", "Cancel", "Apply");
  }
  else if (nodeType===esri2.GeoFlow.NodeTypes.NodeDefaultVal){
    dlgParam.enableButton("Ok", "Cancel", "Apply");
  }
  else if (nodeType===esri2.GeoFlow.NodeTypes.NodePubOutput) {
    dlgParam.enableButton("Ok", "Cancel");
  }
};

GeoFlowEditor.updateNodeAssignment = function (geoNode) {
  geoNode.typedNode.description = geoNode.getServiceState();
};

GeoFlowEditor.updateNodeDefaultVal = function (geoNode) {
  var num = geoNode.getOutPort();
  for (var i = 1; i< num; i++) {
    port = geoNode.getOutPort(i);
    port.defaultValue = __get_elem(port.name).value;
    __log(port.name + " = " + port.defaultValue);
    geoNode.typedNode.updateOutPort(port.getNextLink());
  }
};

GeoFlowEditor.updateNodePubOutput = function (geoNode) {
  geoNode.typedNode.setCallout(__get_elem("__calloutURL").value);
};

GeoFlowEditor.updateNodePubInput = function (geoNode) {
};
