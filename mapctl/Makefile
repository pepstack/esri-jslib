PREFIX = .
SRC_DIR = ${PREFIX}/src
DIST_DIR = ${PREFIX}/dist
DEP_DIR = ${PREFIX}/../~dep
BUILD_DIR = ${PREFIX}/../~build

COMMON_JS = ${DEP_DIR}/esri2.utility.js

#jquery dialog: jquery-ui-1.8.18.custom
JQUERY_MIN_JS = ${DEP_DIR}/jquery-ui-1.8.18.custom/js/jquery-1.7.1.min.js
JQUERY_UI_MIN_JS = ${DEP_DIR}/jquery-ui-1.8.18.custom/js/jquery-ui-1.8.18.custom.min.js
JQUERY_UI_CSS_DIR = ${DEP_DIR}/jquery-ui-1.8.18.custom/css/cupertino

MAP_CORE = ${PREFIX}/../mapcore
MAP_JS = ${MAP_CORE}/dist/esri2.map.js
MAPMIN_JS = ${MAP_CORE}/dist/esri2.map.min.js

PLUGINS = $(shell ls -p ${SRC_DIR} | grep / | xargs)
PLUGINS_JS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.js" 2> /dev/null),"")
PLUGINS_CSS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.css" 2> /dev/null),"")

JS_MODULES = ${SRC_DIR}/header.txt\
	${SRC_DIR}/begin.js\
	${SRC_DIR}/mapctl.js\
	${SRC_DIR}/end.js

MAPCTL = ${DIST_DIR}/script/esri2.mapctl.js
MAPCTL_MIN = ${DIST_DIR}/script/esri2.mapctl.min.js
#MAPCTL_CSS = ${DIST_DIR}/style/mapctl.css
#MAPCTL_CSS_MIN = ${DIST_DIR}/style/mapctl.min.css

MAPCTL_VER = `cat version.txt`
VER = sed s/@VERSION/${MAPCTL_VER}/

JS_ENGINE = `which node`
JS_LINT = ${JS_ENGINE} $(PREFIX)/jslint-check.js
JS_MINIFIER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --extra
CSS_MINIFIER = java -Xmx96m -jar ${BUILD_DIR}/yuicompressor.jar

DATE=`git log --pretty=format:'%ad' -1`

all: clean lint min
	@@echo ${PLUGIN_JS}
	@@echo "all built successfully!"

mapctl: ${JS_MODULES}
	@@mkdir -p ${DIST_DIR}
	@@mkdir -p ${DIST_DIR}/script
	@@mkdir -p ${DIST_DIR}/style
	@@mkdir -p ${DIST_DIR}/img
	@@echo "building mapctl... success!"
	@@echo "Enabled plugins: " $(if ${PLUGINS},"${PLUGINS:%/=%}", "None")
	@@cat ${JS_MODULES} | sed 's/@DATE/'"${DATE}"'/' | ${VER} > ${MAPCTL};
	@@echo "mapctl built successfully"

lint: mapctl
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Checking against JSLint... "; \
		${JS_LINT}; \
	else \
		echo "You must have NodeJS installed in order to test mapctl against JSLint."; \
	fi

min: mapctl
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Minifying JS... "; \
		head -18 ${MAPCTL} > ${MAPCTL_MIN}; \
		${JS_MINIFIER} ${MAPCTL} > ${MAPCTL_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${MAPCTL_MIN}.tmp > ${MAPCTL_MIN}; \
		rm -rf $(MAPCTL_MIN).tmp; \
		echo "Success!"; \
	else \
		echo "You must have NodeJS installed in order to minify mapctl JS."; \
	fi

.PHONY: clean update

update:
	@@echo "copying " ${SRC_DIR}/*.html "to" ${DIST_DIR}
	@@cp ${SRC_DIR}/*.html ${DIST_DIR}
	@@echo "copying " ${SRC_DIR}/mapctl.css "to" ${DIST_DIR}/style
	@@cp ${SRC_DIR}/mapctl.css ${DIST_DIR}/style
	@@echo "copying " ${PREFIX}/img "to" ${DIST_DIR}/img
	@@cp ${PREFIX}/img/*.* ${DIST_DIR}/img
	@@echo "copying " ${COMMON_JS} "to" ${DIST_DIR}/script
	@@cp ${COMMON_JS} ${DIST_DIR}/script
	@@echo "copying " ${JQUERY_MIN_JS} "to" ${DIST_DIR}/script
	@@cp ${JQUERY_MIN_JS} ${DIST_DIR}/script
	@@echo "copying " ${MAP_JS} "to" ${DIST_DIR}/script
	@@cp ${MAP_JS} ${DIST_DIR}/script
	@@echo "copying " ${MAPMIN_JS} "to" ${DIST_DIR}/script
	@@cp ${MAPMIN_JS} ${DIST_DIR}/script

clean:
	@@echo "clean: removing directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
