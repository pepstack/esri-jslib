/**
 * GeoFlowEditor.NodeDialogParam class
 */
GeoFlowEditor.NodeDialogWidth = 570;
GeoFlowEditor.NodeDialogHeight = 360;

GeoFlowEditor.__divNodeState = "__divNodeState"; // DO NOT change it!
GeoFlowEditor.__serviceURLs = "__serviceURLs"; // DO NOT change it!

GeoFlowEditor.NodeDialogParam = function (divID) {
  this.dlgDIV = __get_elem(divID);
  this.dlgSelector = "#"+divID;
  this.autoOpen = true;
  this.content = "";
  this.width = GeoFlowEditor.NodeDialogWidth;
  this.height = GeoFlowEditor.NodeDialogHeight;
  this.title = "";
  this.buttons = {};
};

GeoFlowEditor.NodeDialogParam.prototype.init = function (flowEditor, geoNode) {
  GeoFlowEditor.instance = flowEditor;

  this.autoOpen = true;  
  this.content = "";
  this.width = GeoFlowEditor.NodeDialogWidth;
  this.height = GeoFlowEditor.NodeDialogHeight;

  this.thisNode = geoNode;
  this.title = geoNode.getTitle() + (flowEditor.readOnly? " (Read only)" : "");

  this.buttons = {};
  if (flowEditor.readOnly) {
    this.buttons.Close = GeoFlowEditor.NodeDialogParam.onClose;
  }
  else {
    this.buttons.Ok = GeoFlowEditor.NodeDialogParam.onOk;
    this.buttons.Cancel = GeoFlowEditor.NodeDialogParam.onCancel;
    this.buttons.Apply = GeoFlowEditor.NodeDialogParam.onApply;
  }
};

GeoFlowEditor.NodeDialogParam.prototype.updateDlg = function () {
  this.dlgDIV.innerHTML = this.content;
};

GeoFlowEditor.NodeDialogParam.prototype.showDlg = function () {
  $(this.dlgSelector).dialog(this);

  var divOut = __get_elem(GeoFlowEditor.__divNodeState);
  if (__not_null(divOut)) {
    var sel = __get_elem(GeoFlowEditor.__serviceURLs);
    if (__not_null(sel)) {
      if (__not_null(sel.options)) {
        for (var i=0; i<sel.options.length; i++) {
          if (sel.options[i].text==this.thisNode.serviceName) {
            sel.selectedIndex = i;
            divOut.innerHTML = this.thisNode.getServiceState();
            break;
          }
        }
      }
      else if (sel.value==this.thisNode.serviceName) {
        divOut.innerHTML = this.thisNode.getServiceState();
      }
    }
  }

  this.disableButton("Ok", "Apply", "Cancel");
};

GeoFlowEditor.NodeDialogParam.prototype.disableButton = function () {
  var btns = Array.prototype.slice.call(arguments);
  if (btns.length===0) {
    return;
  }

  $(this.dlgSelector).parent().find("button").each(function() {
    var btnName = $(this).text();
    for (var i=0; i<btns.length; i++) {
      if (btns[i]==btnName) {
        $(this).attr('disabled', true).addClass("ui-button-disabled");
      }
    }
  });
};

GeoFlowEditor.NodeDialogParam.prototype.enableButton = function () {
  var btns = Array.prototype.slice.call(arguments);
  if (btns.length===0) {
    return;
  }
  $(this.dlgSelector).parent().find("button").each(function() {
    var btnName = $(this).text();
    for (var i=0; i<btns.length; i++) {
      if (btns[i]==btnName) {
        $(this).attr('disabled', false).removeClass("ui-button-disabled");
      }
    }
  });
};

GeoFlowEditor.NodeDialogParam.prototype.isButtonDisabled = function (btnName) {
  //??TODO:
  return false;
};

GeoFlowEditor.NodeDialogParam.prototype.setButtons = function (btnOk, btnCancel, btnApply) {
  this.buttons = {};  
  if (btnOk===1) {
    this.buttons.Ok = GeoFlowEditor.NodeDialogParam.onOk;
  }
  if (btnCancel===1) {
    this.buttons.Cancel = GeoFlowEditor.NodeDialogParam.onCancel;
  }
  if (btnApply===1) {
    this.buttons.Apply = GeoFlowEditor.NodeDialogParam.onApply;
  }
};

GeoFlowEditor.NodeDialogParam.onClose = function () {
  $(this).dialog("close");
};

GeoFlowEditor.NodeDialogParam.onOk = function () {
  if (!dlgParam.isButtonDisabled("Apply")) {
    GeoFlowEditor.NodeDialogParam.onApply();
  }
  $(this).dialog("close");
};

GeoFlowEditor.NodeDialogParam.onCancel = function () {
  $(this).dialog("close");
};

GeoFlowEditor.NodeDialogParam.onApply = function () {
  try{
    GeoFlowEditor.instance.updateNode(dlgParam.thisNode, dlgParam.nodeJSON, dlgParam.nodeURL);
    var divState = __get_elem(GeoFlowEditor.__divNodeState);
    dlgParam.thisNode.setServiceState(divState.name, divState.innerHTML);
    dlgParam.disableButton("Apply");

    // change dialog title
    $(dlgParam.dlgSelector).dialog('option', 'title', dlgParam.thisNode.getTitle());
  }
  catch(e) {
    __log("GeoFlowEditor.NodeDialogParam.onApply exception: ", e.message);
  }
};

