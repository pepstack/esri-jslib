PREFIX = .
SRC_DIR = ${PREFIX}/src
DIST_DIR = ${PREFIX}/dist
DEP_DIR = ${PREFIX}/../~dep
BUILD_DIR = ${PREFIX}/../~build

COMMON_JS = ${DEP_DIR}/esri2.utility.js

#jquery dialog: jquery-ui-1.8.17.custom
#JQUERY_MIN_JS = ${DEP_DIR}/jquery-ui-1.8.17.custom/js/jquery-1.7.1.min.js
#JQUERY_UI_MIN_JS = ${DEP_DIR}/jquery-ui-1.8.17.custom/js/jquery-ui-1.8.17.custom.min.js
#JQUERY_UI_CSS_DIR = ${DEP_DIR}/jquery-ui-1.8.17.custom/css/ui-lightness

#jquery dialog: jquery-ui-1.8.18.custom
JQUERY_MIN_JS = ${DEP_DIR}/jquery-ui-1.8.18.custom/js/jquery-1.7.1.min.js
JQUERY_UI_MIN_JS = ${DEP_DIR}/jquery-ui-1.8.18.custom/js/jquery-ui-1.8.18.custom.min.js
JQUERY_UI_CSS_DIR = ${DEP_DIR}/jquery-ui-1.8.18.custom/css/cupertino

PLUGINS = $(shell ls -p ${SRC_DIR} | grep / | xargs)
PLUGINS_JS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.js" 2> /dev/null),"")
PLUGINS_CSS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.css" 2> /dev/null),"")

JS_MODULES = ${SRC_DIR}/header.txt\
	${SRC_DIR}/begin.js\
	${SRC_DIR}/editor.js\
	${SRC_DIR}/editor.gpservices.js\
	${SRC_DIR}/editor.nodedialog.js\
	${SRC_DIR}/editor.config.js\
	${SRC_DIR}/end.js

FLOWEDITOR = ${DIST_DIR}/script/floweditor.js
FLOWEDITOR_MIN = ${DIST_DIR}/script/floweditor.min.js
#FLOWEDITOR_CSS = ${DIST_DIR}/style/editor.css
#FLOWEDITOR_CSS_MIN = ${DIST_DIR}/style/editor.min.css

FLOWEDITOR_VER = `cat version.txt`
VER = sed s/@VERSION/${FLOWEDITOR_VER}/

JS_ENGINE = `which node`
JS_LINT = ${JS_ENGINE} $(PREFIX)/jslint-check.js
JS_MINIFIER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --extra
CSS_MINIFIER = java -Xmx96m -jar ${BUILD_DIR}/yuicompressor.jar

DATE=`git log --pretty=format:'%ad' -1`

all: clean lint min
	@@echo ${PLUGIN_JS}
	@@echo "all built successfully!"

floweditor: ${JS_MODULES}
	@@mkdir -p ${DIST_DIR}
	@@mkdir -p ${DIST_DIR}/script
	@@mkdir -p ${DIST_DIR}/style
	@@mkdir -p ${DIST_DIR}/style/jquery-ui
	@@mkdir -p ${DIST_DIR}/img
	@@echo "building floweditor... success!"
	@@echo "Enabled plugins: " $(if ${PLUGINS},"${PLUGINS:%/=%}", "None")
	@@cat ${JS_MODULES} | sed 's/@DATE/'"${DATE}"'/' | ${VER} > ${FLOWEDITOR};
	@@echo "floweditor built successfully"

lint: floweditor
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Checking against JSLint... "; \
		${JS_LINT}; \
	else \
		echo "You must have NodeJS installed in order to test floweditor against JSLint."; \
	fi

min: floweditor
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Minifying JS... "; \
		head -18 ${FLOWEDITOR} > ${FLOWEDITOR_MIN}; \
		${JS_MINIFIER} ${FLOWEDITOR} > ${FLOWEDITOR_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${FLOWEDITOR_MIN}.tmp > ${FLOWEDITOR_MIN}; \
		rm -rf $(FLOWEDITOR_MIN).tmp; \
		echo "Success!"; \
	else \
		echo "You must have NodeJS installed in order to minify floweditor JS."; \
	fi

.PHONY: clean update

update:
	@@echo "copying " ${SRC_DIR}/editor.html "to" ${DIST_DIR}
	@@cp ${SRC_DIR}/editor.html ${DIST_DIR}
	@@echo "copying " ${SRC_DIR}/editor.css "to" ${DIST_DIR}/style
	@@cp ${SRC_DIR}/editor.css ${DIST_DIR}/style
	@@echo "copying " ${COMMON_JS} "to" ${DIST_DIR}/script
	@@cp ${COMMON_JS} ${DIST_DIR}/script
	@@echo "copying " ${PREFIX}/img "to" ${DIST_DIR}/img
	@@cp -r ${PREFIX}/img ${DIST_DIR}
	@@echo "copying " ${JQUERY_MIN_JS} "to" ${DIST_DIR}/script
	@@cp ${JQUERY_MIN_JS} ${DIST_DIR}/script
	@@echo "copying " ${JQUERY_UI_MIN_JS} "to" ${DIST_DIR}/script
	@@cp ${JQUERY_UI_MIN_JS} ${DIST_DIR}/script
	@@echo "copying all from " ${JQUERY_UI_CSS_DIR} "to" ${DIST_DIR}/style/jquery-ui
	@@cp -r ${JQUERY_UI_CSS_DIR} ${DIST_DIR}/style/jquery-ui

clean:
	@@echo "clean: removing directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
