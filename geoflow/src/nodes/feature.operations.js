/**
 * Feature.operations
 * http://10.112.18.110:6080/arcgis/rest/services/GeoFlow/pm25_usa/FeatureServer/0
 */
Feature.operations = {
  "query": {
    "name": "feature",
    "displayName": "Feature",
    "enabled": true,
    "url": "---replaced by user input---",
    "description": "The query operation is performed on a feature service layer resource. The result of this operation is either a feature set or an array of feature ids",
    "executionType": "esriExecutionTypeFeature",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/fsquery.html",
    "parameters": [
      {
        "name": "where",
        "dataType": "GPString",
        "displayName": "Where",
        "direction": "esriGPParameterDirectionInput",
        "description": "A where clause for the query filter",
        "parameterType": "esriGPParameterTypeRequired",
        "defaultValue": "1=1"
      },
      {
        "name": "geometry",
        "dataType": "GPString",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometry to apply as the spatial filter",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": ""
      },
      {
        "name": "geometryType",
        "dataType": "GPString",
        "displayName": "Geometry Type",
        "direction": "esriGPParameterDirectionInput",
        "description": "The type of geometry specified by the geometry parameter",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": "esriGeometryEnvelope"
      },
      {
        "name": "inSR",
        "dataType": "GPString",
        "displayName": "In Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial reference of the input geometry",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": ""
      },
      {
        "name": "outSR",
        "dataType": "GPString",
        "displayName": "Out Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial reference of the returned geometry",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": ""        
      },
      {
        "name": "spatialRel",
        "dataType": "GPString",
        "displayName": "Spatial Relationship",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial relationship to be applied on the input geometry while performing the query",
        "parameterType": "esriGPParameterTypeOptional",
        "defaultValue": "esriSpatialRelIntersects"
      },
      {
        "name": "outFields",
        "dataType": "GPString",
        "displayName": "Out Fields",
        "direction": "esriGPParameterDirectionInput",
        "description": "The list of fields to be included in the returned resultset",
        "parameterType": "esriGPParameterTypeRequired",
        "defaultValue": "*"
      },
      {
        "name": "result",
        "dataType": "GPFeatureRecordSetLayer",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Output result",
        "parameterType": "esriGPParameterTypeOptional"
      }
    ]
  }
};
