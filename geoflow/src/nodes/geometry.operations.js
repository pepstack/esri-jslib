/**
 * Geometry.operations
 */
Geometry.operations = {
  "areasAndLengths": {
    "name": "areasAndLengths",
    "displayName": "Areas And Lengths",
    "enabled": true,
    "description": "This operation calculates areas and perimeter lengths for each polygon specified in the input array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?areasAndLengths.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Polygons",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons whose areas and lengths are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input polygons",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "lengthUnit",
        "dataType": "GPString",
        "displayName": "Length Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The length unit in which perimeters of polygons will be calculated",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "areaUnit",
        "dataType": "GPString",
        "displayName": "Area Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The area unit in which areas of polygons will be calculated",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "autoComplete": {
    "name": "autoComplete",
    "displayName": "AutoComplete",
    "enabled": true,
    "description": "It constructs polygons that fill in the gaps between existing polygons and a set of polylines",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?autoComplete.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Polygons",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons that will provide some boundaries for new polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "polylines",
        "dataType": "Geometries",
        "displayName": "Polylines",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons that will provide some boundaries for new polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polygons and polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "buffer": {
    "name": "buffer",
    "displayName": "Buffer",
    "enabled": true,
    "description": "The result of this operation is buffer polygons at the specified distances for the input geometry array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?buffer.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be buffered",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "inSR",
        "dataType": "GPString",
        "displayName": "In Spatial Reference",        
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "outSR",
        "dataType": "GPString", 
        "displayName": "Out Spatial Reference",               
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the returned geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "bufferSR",
        "dataType": "GPString",
        "displayName": "Buffer Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object in which the geometries are buffered",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "distances",
        "dataType": "GPString",
        "displayName": "Distances",
        "direction": "esriGPParameterDirectionInput",
        "description": "The distances the input geometries are buffered",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "unit",
        "dataType": "GPString",
        "displayName": "unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The units for calculating each buffer distance",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "unionResults",
        "dataType": "GPBoolean",
        "displayName": "Union Results",
        "direction": "esriGPParameterDirectionInput",
        "description": "If true, all geometries buffered at a given distance are unioned into a single (possibly multipart) polygon, and the unioned geometry is placed in the output array",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "convexHull": {
    "name": "convexHull",
    "displayName": "ConvexHull",
    "enabled": true,
    "description": "The convexHull operation returns the convex hull of the input geometry",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?convexHull.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Polygons",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometries whose convex hull is to be created",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
       "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the output geometry",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "cut": {
    "name": "cut",
    "displayName": "Cut",
    "enabled": true,
    "description": "This operation splits the input polyline or polygon where it crosses a cutting polyline",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?cut.html",
    "parameters": [
      {
        "name": "cutter",
        "dataType": "Geometries",
        "displayName": "Cutter",
        "direction": "esriGPParameterDirectionInput",
        "description": "The polyline that will be used to divide the target into pieces where it crosses the target",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "target",
        "dataType": "Geometries",
        "displayName": "Target",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polylines/polygons to be cut",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometry",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "densify": {
    "name": "densify",
    "displayName": "Densify",
    "enabled": true,
    "description": "This operation densifies geometries by plotting points between existing vertices",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?densify.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be densified",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "maxSegmentLength",
        "dataType": "GPString",
        "displayName": "Max Segment Length",
        "direction": "esriGPParameterDirectionInput",
        "description": "All segments longer than maxSegmentLength are replaced with sequences of lines no longer than maxSegmentLength",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "geodesic",
        "dataType": "GPString",
        "displayName": "Max Segment Length",
        "direction": "esriGPParameterDirectionInput",
        "description": "A flag that can be set to true if GCS spatial references are used or densify geodesic is to be performed",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "lengthUnit",
        "dataType": "GPString",
        "displayName": "Length Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The length unit of maxSegmentLength, can be any esriUnits constant",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "difference": {
    "name": "difference",
    "displayName": "Difference",
    "enabled": true,
    "description": "This operation constructs the set-theoretic difference between an array of geometries and another geometry",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?difference.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "An array of points, multipoints, polylines or polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometry",
        "dataType": "Geometries",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "A single geometry of any type, of dimension equal to or greater than the elements of geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "distance":{
    "name": "distance",
    "displayName": "Distance",
    "enabled": true,
    "description": "It reports the planar (projected space) or geodesic shortest distance between A and B",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?distance.html",
    "parameters": [
      {
        "name": "geometry1",
        "dataType": "Geometries",
        "displayName": "Geometry1",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometry from where the distance is to be measured",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometry2",
        "dataType": "Geometries",
        "displayName": "Geometry2",
        "direction": "esriGPParameterDirectionInput",
        "description": "The geometry to which the distance is to be measured",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "distanceUnit",
        "dataType": "GPString",
        "displayName": "Distance Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "Specifies the units for measuring distance between the geometry1 and geometry2 geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "geodesic",
        "dataType": "GPString",
        "displayName": "Geodesic",
        "direction": "esriGPParameterDirectionInput",
        "description": "If true then measures the geodesic distance between the geometries geometry1 and geometry2",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "generalize": {
    "name": "generalize",
    "displayName": "Generalize",
    "enabled": true,
    "description": "It returns generalized (Douglas-Poiker) versions of the input geometries",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?generalize.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be generalized",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "maxDeviation",
        "dataType": "GPString",
        "displayName": "Max Deviation",
        "direction": "esriGPParameterDirectionInput",
        "description": "Specifies the maximum deviation for constructing a generalized geometry based on the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "deviationUnit",
        "dataType": "GPString",
        "displayName": "Deviation Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "A unit for maximum deviation",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "intersect":{
    "name": "intersect",
    "displayName": "Intersect",
    "enabled": true,
    "description": "This operation constructs the set-theoretic intersection between an array of geometries and another geometry",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?intersect.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "An array of points, multipoints, polylines or polygons",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometry",
        "dataType": "Geometries",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "A single geometry of any type, of dimension equal to or greater than the elements of geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "labelPoints": {
    "name": "labelPoints",
    "displayName": "Label Points",
    "enabled": true,
    "description": "This operation calculates an interior point for each polygon specified in the input array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?labelPoints.html",
    "parameters": [
      {
        "name": "polygons",
        "dataType": "Geometries",
        "displayName": "Geometry",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polygons whose label points are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input polygons",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "lengths": {
    "name": "lengths",
    "displayName": "Lengths",
    "enabled": true,
    "description": "The array of polylines whose lengths are to be computed",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?lengths.html",
    "parameters": [
      {
        "name": "polylines",
        "dataType": "Geometries",
        "displayName": "Polylines",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of polylines whose lengths are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "lengthUnit",
        "dataType": "GPString",
        "displayName": "Length Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "The length unit in which perimeters of polygons will be calculated",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "geodesic",
        "dataType": "GPString",
        "displayName": "Geodesic",
        "direction": "esriGPParameterDirectionInput",
        "description": "If polylines are in geographic coordinate system, then geodesic needs to be set to true in order to calculate the ellipsoidal shortest path distance between each pair of the vertices in the polylines. If lengthUnit is not specificed, then output is always returned in meters",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "offset": {
    "name": "offset",
    "displayName": "Offset",
    "enabled": true,
    "description": "Offset constructs the offset of the given input geometries",    
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?offset.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be offset",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "offsetDistance",
        "dataType": "GPString",
        "displayName": "Offset Distance",
        "direction": "esriGPParameterDirectionInput",
        "description": "Specifies the distance for constructing an offset based on the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "offsetUnit",
        "dataType": "GPString",
        "displayName": "Offset Unit",
        "direction": "esriGPParameterDirectionInput",
        "description": "A unit for offset distance",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "offsetHow",
        "dataType": "GPString",
        "displayName": "Offset How",
        "direction": "esriGPParameterDirectionInput",
        "description": "It is one of esriGeometryOffsetMitered, esriGeometryOffsetBevelled, esriGeometryOffsetRounded",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "bevelRatio",
        "dataType": "GPString",
        "displayName": "Bevel Ratio",
        "direction": "esriGPParameterDirectionInput",
        "description": "bevelRatio is multiplied by the offset distance and the result determines how far a mitered offset intersection can be located before it is bevelled",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "project": {
    "name": "project",
    "displayName": "Project",
    "enabled": true,
    "description" : "This resource projects an array of input geometries from an input spatial reference to an output spatial reference",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?project.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be projected",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "inSR",
        "dataType": "GPString",
        "displayName": "In Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "outSR",
        "dataType": "GPString",
        "displayName": "Out Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the returned geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "relation": {
    "name": "relation",
    "displayName": "Relation",
    "enabled": true,
    "description": "This operation determines the pairs of geometries from the input geometry arrays that participate in the specified spatial relation",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?relation.html",
    "parameters": [
      {
        "name": "geometries1",
        "dataType": "Geometries",
        "displayName": "Geometries1",
        "direction": "esriGPParameterDirectionInput",
        "description": "The first array of geometries to compute the relations",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "geometries2",
        "dataType": "Geometries",
        "displayName": "Geometries2",
        "direction": "esriGPParameterDirectionInput",
        "description": "The second array of geometries to compute the relations",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "relation",
        "dataType": "GPString",
        "displayName": "Relation",
        "direction": "esriGPParameterDirectionInput",
        "description": "The spatial relationship to be tested between the two input geometry arrays",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "relationParam",
        "dataType": "GPString",
        "displayName": "Relation Param",
        "direction": "esriGPParameterDirectionInput",
        "description": "The Shape-Comparison-Language string to be evaluated",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "reshape": {
    "name": "reshape",
    "displayName": "Reshape",
    "enabled": true,
    "description": "It reshapes a polyline or a part of a polygon using a reshaping line",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?reshape.html",
    "parameters": [
      {
        "name": "target",
        "dataType": "Geometries",
        "displayName": "Target",
        "direction": "esriGPParameterDirectionInput",
        "description": "The polyline or polygon to be reshaped",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "reshaper",
        "dataType": "Geometries",
        "displayName": "Reshaper",
        "direction": "esriGPParameterDirectionInput",
        "description": "The single-part polyline that does the reshaping",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input geometry",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "simplify": {
    "name": "simplify",
    "displayName": "Simplify",
    "enabled": true,
    "description": "Simplify permanently alters the input geometry so that the geometry becomes topologically consistent",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?simplify.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be simplified",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID of the spatial reference or a spatial reference json object for the input and output geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "trimExtend": {
    "name": "trimExtend",
    "displayName": "TrimExtend",
    "enabled": true,
    "description": "This operation trims or extends each polyline specified in the input array, using the user specified guide polylines",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?trimExtend.html",
    "parameters": [
      {
        "name": "polylines",
        "dataType": "Geometries",
        "displayName": "Polylines",
        "direction": "esriGPParameterDirectionInput",
        "description": "An array of polylines whose lengths are to be computed",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "trimExtendTo",
        "dataType": "Geometries",
        "displayName": "Trim Extend To",
        "direction": "esriGPParameterDirectionInput",
        "description": "A polyline which is used as a guide for trimming or extending input polylines",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input polylines",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "extendHow",
        "dataType": "GPString",
        "displayName": "Extend How",
        "direction": "esriGPParameterDirectionInput",
        "description": "A flag which is used along with the trimExtend operation",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  },
  "union": {
    "name": "union",
    "displayName": "Union",
    "enabled": true,
    "description": "This operation constructs the set-theoretic union of the geometries in the input array",
    "url": "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
    "executionType": "esriExecutionTypeGeometry",
    "helpUrl": "http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html?union.html",
    "parameters": [
      {
        "name": "geometries",
        "dataType": "Geometries",
        "displayName": "Geometries",
        "direction": "esriGPParameterDirectionInput",
        "description": "The array of geometries to be unioned",
        "parameterType": "esriGPParameterTypeRequired"
      },
      {
        "name": "sr",
        "dataType": "GPString",
        "displayName": "Spatial Reference",
        "direction": "esriGPParameterDirectionInput",
        "description": "The well-known ID or a spatial reference json object for the input geometries",
        "parameterType": "esriGPParameterTypeOptional"
      },
      {
        "name": "result",
        "dataType": "Geometries",
        "displayName": "Result",
        "direction": "esriGPParameterDirectionOutput",
        "description": "Result geometries for this operation",
        "parameterType": "esriGPParameterTypeRequired"
      }
    ]
  }
};

