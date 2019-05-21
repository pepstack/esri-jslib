PREFIX = .
SRC_DIR = ${PREFIX}/src
DIST_DIR = ${PREFIX}/dist
DEP_DIR = ${PREFIX}/../~dep
BUILD_DIR = ${PREFIX}/../~build

PLUGINS = $(shell ls -p ${SRC_DIR} | grep / | xargs)
PLUGINS_JS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.js" 2> /dev/null),"")
PLUGINS_CSS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.css" 2> /dev/null),"")

JS_MODULES = ${SRC_DIR}/header.txt\
	${SRC_DIR}/begin.js\
	${SRC_DIR}/attributesmap.js\
	${SRC_DIR}/imageloader.js\
	${SRC_DIR}/mapwidget.js\
	${SRC_DIR}/mapcanvas.js\
	${SRC_DIR}/mapbound.js\
	${SRC_DIR}/maplayer.js\
	${SRC_DIR}/mappoint.js\
	${SRC_DIR}/maprender.js\
	${SRC_DIR}/maprender.radialgradient.js\
	${SRC_DIR}/maprender.lineargradient.js\
	${SRC_DIR}/mapshape.js\
	${SRC_DIR}/mapsymbol.js\
	${SRC_DIR}/shapetrace.js\
	${SRC_DIR}/pairarray.js\
	${SRC_DIR}/pointtype.js\
	${SRC_DIR}/recttype.js\
	${SRC_DIR}/viewport.js\
	${SRC_DIR}/bresenham.js\
	${SRC_DIR}/drawinfo.js\
	${SRC_DIR}/end.js

MAP = ${DIST_DIR}/esri2.map.js
MAP_MIN = ${DIST_DIR}/esri2.map.min.js
#MAP_CSS = ${DIST_DIR}/esri2.map.css
#MAP_CSS_MIN = ${DIST_DIR}/esri2.map.min.css

MAP_VER = `cat version.txt`
VER = sed s/@VERSION/${MAP_VER}/

JS_ENGINE = `which node`
JS_LINT = ${JS_ENGINE} $(PREFIX)/jslint-check.js
JS_MINIFIER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --extra
CSS_MINIFIER = java -Xmx96m -jar ${BUILD_DIR}/yuicompressor.jar

DATE=`git log --pretty=format:'%ad' -1`

all: clean lint min
	@@echo ${PLUGIN_JS}
	@@echo "all built successfully!"
	
map: ${JS_MODULES}
	@@mkdir -p ${DIST_DIR}
	@@echo "building map... success!"
	@@echo "Enabled plugins: " $(if ${PLUGINS},"${PLUGINS:%/=%}", "None")
	@@cat ${JS_MODULES} | sed 's/@DATE/'"${DATE}"'/' | ${VER} > ${MAP};
	@@echo "map built successfully"

lint: map
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Checking against JSLint... "; \
		${JS_LINT}; \
	else \
		echo "You must have NodeJS installed in order to test map against JSLint."; \
	fi

min: map
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Minifying JS... "; \
		head -18 ${MAP} > ${MAP_MIN}; \
		${JS_MINIFIER} ${MAP} > ${MAP_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${MAP_MIN}.tmp > ${MAP_MIN}; \
		rm -rf $(MAP_MIN).tmp; \
		echo "Success!"; \
	else \
		echo "You must have NodeJS installed in order to minify map JS."; \
	fi

.PHONY: clean update

update:

clean:
	@@echo "clean: removing directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
