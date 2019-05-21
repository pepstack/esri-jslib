PREFIX = .
DEP_DIR = ${PREFIX}/~dep
BUILD_DIR = ${PREFIX}/~build
SUBDIRS = ${PREFIX}/mapcore ${PREFIX}/geoflow ${PREFIX}/mapctl ${PREFIX}/floweditor

DIST_DIR = ${PREFIX}/../GeoFlow/WebContent/editor
FLOWEDITOR_DIST_DIR = ${PREFIX}/floweditor/dist

all:
	@list='$(SUBDIRS)';\
	echo "Make all in $$list";\
	for subdir in $$list; do\
		echo "Build all in $$subdir ...";\
		(cd $$subdir && make all);\
	done;

.PHONY: clean update

updnolog:
	@@chmod -R 777 ${PREFIX}/*
	@list='$(SUBDIRS)';\
	echo "Update in $$list";\
	for subdir in $$list; do\
		echo "Update in $$subdir";\
		(cd $$subdir && make update);\
	done;
	@@echo "update files in: " ${FLOWEDITOR_DIST_DIR}/script

	@@sed /__log\.*/d ${PREFIX}/geoflow/dist/esri2.geoflow.js >> ${PREFIX}/geoflow/dist/esri2.geoflow.js.nolog
	@@mv ${PREFIX}/geoflow/dist/esri2.geoflow.js.nolog ${PREFIX}/geoflow/dist/esri2.geoflow.js
	@@cp ${PREFIX}/geoflow/dist/esri2.geoflow.js ${FLOWEDITOR_DIST_DIR}/script

	@@sed /__log\.*/d ${PREFIX}/mapcore/dist/esri2.map.js >> ${PREFIX}/mapcore/dist/esri2.map.js.nolog
	@@mv ${PREFIX}/mapcore/dist/esri2.map.js.nolog ${PREFIX}/mapcore/dist/esri2.map.js
	@@cp ${PREFIX}/mapcore/dist/esri2.map.js ${FLOWEDITOR_DIST_DIR}/script

	@@cp ${PREFIX}/mapcore/dist/esri2.map.min.js ${FLOWEDITOR_DIST_DIR}/script

	@@sed /__log\.*/d ${FLOWEDITOR_DIST_DIR}/script/floweditor.js >> ${FLOWEDITOR_DIST_DIR}/script/floweditor.js.nolog
	@@mv ${FLOWEDITOR_DIST_DIR}/script/floweditor.js.nolog ${FLOWEDITOR_DIST_DIR}/script/floweditor.js

	@@echo "update nolog all in: " ${DIST_DIR}
	@@cp -af ${FLOWEDITOR_DIST_DIR}/* ${DIST_DIR}

updnologmin:
	@@chmod -R 777 ${PREFIX}/*
	@list='$(SUBDIRS)';\
	echo "Update in $$list";\
	for subdir in $$list; do\
		echo "Update in $$subdir";\
		(cd $$subdir && make update);\
	done;
	@@echo "update files in: " ${FLOWEDITOR_DIST_DIR}/script

	@@sed /__log\.*/d ${PREFIX}/geoflow/dist/esri2.geoflow.js >> ${PREFIX}/geoflow/dist/esri2.geoflow.js.nolog
	@@mv ${PREFIX}/geoflow/dist/esri2.geoflow.js.nolog ${PREFIX}/geoflow/dist/esri2.geoflow.js
	@@cp ${PREFIX}/geoflow/dist/esri2.geoflow.js ${FLOWEDITOR_DIST_DIR}/script
	@@cp ${PREFIX}/geoflow/dist/esri2.geoflow.min.js ${FLOWEDITOR_DIST_DIR}/script

	@@sed /__log\.*/d ${PREFIX}/mapcore/dist/esri2.map.js >> ${PREFIX}/mapcore/dist/esri2.map.js.nolog
	@@mv ${PREFIX}/mapcore/dist/esri2.map.js.nolog ${PREFIX}/mapcore/dist/esri2.map.js
	@@cp ${PREFIX}/mapcore/dist/esri2.map.js ${FLOWEDITOR_DIST_DIR}/script
	@@cp ${PREFIX}/mapcore/dist/esri2.map.min.js ${FLOWEDITOR_DIST_DIR}/script

	@@sed /__log\.*/d ${FLOWEDITOR_DIST_DIR}/script/floweditor.js >> ${FLOWEDITOR_DIST_DIR}/script/floweditor.js.nolog
	@@mv ${FLOWEDITOR_DIST_DIR}/script/floweditor.js.nolog ${FLOWEDITOR_DIST_DIR}/script/floweditor.js

	@@mv ${FLOWEDITOR_DIST_DIR}/script/esri2.map.min.js ${FLOWEDITOR_DIST_DIR}/script/esri2.map.js
	@@mv ${FLOWEDITOR_DIST_DIR}/script/esri2.geoflow.min.js ${FLOWEDITOR_DIST_DIR}/script/esri2.geoflow.js
	@@mv ${FLOWEDITOR_DIST_DIR}/script/floweditor.min.js ${FLOWEDITOR_DIST_DIR}/script/floweditor.js

	@@echo "update nolog min all in: " ${DIST_DIR}
	@@cp -af ${FLOWEDITOR_DIST_DIR}/* ${DIST_DIR}

	
update:
	@@chmod -R 777 ${PREFIX}/*
	@list='$(SUBDIRS)';\
	echo "Update in $$list";\
	for subdir in $$list; do\
		echo "Update in $$subdir";\
		(cd $$subdir && make update);\
	done;
	@@echo "update files in: " ${FLOWEDITOR_DIST_DIR}/script
	@@cp ${PREFIX}/geoflow/dist/esri2.geoflow.js ${FLOWEDITOR_DIST_DIR}/script
	@@cp ${PREFIX}/geoflow/dist/esri2.geoflow.min.js ${FLOWEDITOR_DIST_DIR}/script
	@@cp ${PREFIX}/mapcore/dist/esri2.map.js ${FLOWEDITOR_DIST_DIR}/script
	@@cp ${PREFIX}/mapcore/dist/esri2.map.min.js ${FLOWEDITOR_DIST_DIR}/script
	@@echo "update all in: " ${DIST_DIR}
	@@cp -af ${FLOWEDITOR_DIST_DIR}/* ${DIST_DIR}

	
clean:
	@list='$(SUBDIRS)';\
	echo "Clean in $$list";\
	for subdir in $$list; do\
		echo "Clean in $$subdir";\
        (cd $$subdir && make clean);\
    done;
