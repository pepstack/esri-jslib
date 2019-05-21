PREFIX = .
SRC_DIR = ${PREFIX}/src
DIST_DIR = ${PREFIX}/dist
DEP_DIR = ${PREFIX}/../~dep
BUILD_DIR = ${PREFIX}/../~build

COMMON_JS = ${DEP_DIR}/esri2.utility.js

PLUGINS = $(shell ls -p ${SRC_DIR} | grep / | xargs)
PLUGINS_JS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.js" 2> /dev/null),"")
PLUGINS_CSS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.css" 2> /dev/null),"")

JS_MODULES = ${SRC_DIR}/header.txt\
	${SRC_DIR}/begin.js\
	${SRC_DIR}/nodetypes.js\
	${SRC_DIR}/eventhandlers.js\
	${SRC_DIR}/geoflow.js\
	${SRC_DIR}/geoflow.trackinglink.js\
	${SRC_DIR}/geoflow.linkcutter.js\
	${SRC_DIR}/geonode.js\
	${SRC_DIR}/geoport.js\
	${SRC_DIR}/geolink.js\
	${PLUGINS_JS}\
	${SRC_DIR}/end.js	

GEOFLOW = ${DIST_DIR}/esri2.geoflow.js
GEOFLOW_MIN = ${DIST_DIR}/esri2.geoflow.min.js
#GEOFLOW_CSS = ${DIST_DIR}/esri2.geoflow.css
#GEOFLOW_CSS_MIN = ${DIST_DIR}/esri2.geoflow.min.css

GEOFLOW_VER = `cat version.txt`
VER = sed s/@VERSION/${GEOFLOW_VER}/

JS_ENGINE = `which node`
JS_LINT = ${JS_ENGINE} $(PREFIX)/jslint-check.js
JS_MINIFIER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --extra
CSS_MINIFIER = java -Xmx96m -jar ${BUILD_DIR}/yuicompressor.jar

DATE=`git log --pretty=format:'%ad' -1`

all: clean lint min
	@@echo ${PLUGIN_JS}
	@@echo "all built successfully!"

geoflow: ${JS_MODULES}
	@@mkdir -p ${DIST_DIR}
	@@echo "building geoflow... success!"
	@@echo "Enabled plugins: " $(if ${PLUGINS},"${PLUGINS:%/=%}", "None")
	@@cat ${JS_MODULES} | sed 's/@DATE/'"${DATE}"'/' | ${VER} > ${GEOFLOW};
	@@echo "geoflow built successfully"

lint: geoflow
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Checking against JSLint... "; \
		${JS_LINT}; \
	else \
		echo "You must have NodeJS installed in order to test geoflow against JSLint."; \
	fi

min: geoflow
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Minifying JS... "; \
		head -18 ${GEOFLOW} > ${GEOFLOW_MIN}; \
		${JS_MINIFIER} ${GEOFLOW} > ${GEOFLOW_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${GEOFLOW_MIN}.tmp > ${GEOFLOW_MIN}; \
		rm -rf $(GEOFLOW_MIN).tmp; \
		echo "Success!"; \
	else \
		echo "You must have NodeJS installed in order to minify geoflow JS."; \
	fi

.PHONY: clean update

update:
	@@echo "copying " ${COMMON_JS} "to" ${DIST_DIR}
	@@cp ${COMMON_JS} ${DIST_DIR}
	
clean:
	@@echo "clean: removing directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
