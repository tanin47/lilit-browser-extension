/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ts/content.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ts/content.ts":
/*!***************************!*\
  !*** ./src/ts/content.ts ***!
  \***************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_process_file__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/_process_file */ "./src/ts/lib/_process_file.ts");
/* harmony import */ var _lib_process_pull_request__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/_process_pull_request */ "./src/ts/lib/_process_pull_request.ts");


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    process();
    sendResponse(null);
    return true;
});
function process() {
    console.log('[Codelab] Detect github.');
    var tokens = window.location.href.split('/');
    if (tokens[5] == 'blob' || tokens[5] == 'tree') {
        Object(_lib_process_file__WEBPACK_IMPORTED_MODULE_0__["processFile"])();
    }
    else if (tokens[5] == 'pull') {
        Object(_lib_process_pull_request__WEBPACK_IMPORTED_MODULE_1__["processPullRequest"])();
    }
    else {
        console.log('[Codelab] The page is neither a file nor a pull request.');
    }
}
// Invoke process when the page is first loaded.
process();


/***/ }),

/***/ "./src/ts/lib/_file_highlighter.ts":
/*!*****************************************!*\
  !*** ./src/ts/lib/_file_highlighter.ts ***!
  \*****************************************/
/*! exports provided: FileHighlighter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FileHighlighter", function() { return FileHighlighter; });
/* harmony import */ var _line_tokenizer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_line_tokenizer */ "./src/ts/lib/_line_tokenizer.ts");

var FileHighlighter = /** @class */ (function () {
    function FileHighlighter(options) {
        this.highlightedLines = new Set();
        this.repoName = options.repoName;
        this.revision = options.revision;
        this.branch = options.branch;
        this.selectedNodeId = options.selectedNodeId;
        this.lineTokens = options.lineTokens;
    }
    FileHighlighter.prototype.run = function () {
        if (this.lineTokens.length == 0) {
            return;
        }
        for (var _i = 0, _a = this.lineTokens; _i < _a.length; _i++) {
            var lineToken = _a[_i];
            var tokenizer = new _line_tokenizer__WEBPACK_IMPORTED_MODULE_0__["LineTokenizer"]({
                repoName: this.repoName,
                revision: this.revision,
                branch: this.branch,
                selectedNodeId: this.selectedNodeId,
                line: lineToken.line,
                sortedTokens: lineToken.tokens
            });
            var lineElem = document.querySelector("#LC" + lineToken.line);
            var shouldLineBeHighlighted = tokenizer.process(lineElem);
            if (shouldLineBeHighlighted) {
                this.highlightedLines.add(lineToken.line);
            }
        }
        this.highlightedLines.forEach(function (line) {
            var lineElem = document.querySelector("#LC" + line);
            lineElem.classList.add('highlighted');
        });
    };
    return FileHighlighter;
}());



/***/ }),

/***/ "./src/ts/lib/_helpers.ts":
/*!********************************!*\
  !*** ./src/ts/lib/_helpers.ts ***!
  \********************************/
/*! exports provided: sortAndFilterTokens, combineUsagesAndDefinitions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sortAndFilterTokens", function() { return sortAndFilterTokens; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "combineUsagesAndDefinitions", function() { return combineUsagesAndDefinitions; });
function sortAndFilterTokens(unsortedTokens) {
    return unsortedTokens
        .filter(function (a) { return !!a.location; })
        .sort(function (a, b) {
        if (!a.location) {
            return -1;
        }
        if (!b.location) {
            return 1;
        }
        if (a.location.start.line < b.location.start.line) {
            return -2;
        }
        else if (a.location.start.line > b.location.start.line) {
            return 2;
        }
        else {
            if (a.location.start.col < b.location.start.col) {
                return -1;
            }
            else if (a.location.start.col > b.location.start.col) {
                return 1;
            }
            else {
                return 0;
            }
        }
    });
}
function combineUsagesAndDefinitions(usages, definitions) {
    var tokens = [];
    usages.forEach(function (u) { return tokens.push(u); });
    definitions.forEach(function (d) { return tokens.push(d); });
    return tokens;
}


/***/ }),

/***/ "./src/ts/lib/_line_tokenizer.ts":
/*!***************************************!*\
  !*** ./src/ts/lib/_line_tokenizer.ts ***!
  \***************************************/
/*! exports provided: LineTokens, LineTokenizer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LineTokens", function() { return LineTokens; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LineTokenizer", function() { return LineTokenizer; });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_helpers */ "./src/ts/lib/_helpers.ts");

var LineTokens = /** @class */ (function () {
    function LineTokens(line, tokens) {
        this.line = line;
        this.tokens = tokens;
    }
    LineTokens.build = function (fileResponse) {
        var tokens = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["sortAndFilterTokens"])(Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["combineUsagesAndDefinitions"])(fileResponse.usages, fileResponse.definitions));
        var lines = [];
        var currentLine = null;
        var currentTokens = [];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            if (!token.location) {
                continue;
            }
            if (currentLine === null) {
                currentLine = token.location.start.line;
            }
            if (currentLine === token.location.start.line) {
                currentTokens.push(token);
            }
            else {
                lines.push(new LineTokens(currentLine, currentTokens));
                currentTokens = [token];
                currentLine = token.location.start.line;
            }
        }
        if (currentTokens.length > 0 && currentLine) {
            lines.push(new LineTokens(currentLine, currentTokens));
        }
        return lines;
    };
    return LineTokens;
}());

var LineTokenizer = /** @class */ (function () {
    function LineTokenizer(options) {
        this.index = 0;
        this.col = 1;
        this.shouldBeHighlighted = false;
        this.repoName = options.repoName;
        this.revision = options.revision;
        this.branch = options.branch;
        this.selectedNodeId = options.selectedNodeId;
        this.tokens = options.sortedTokens;
        this.line = options.line;
    }
    LineTokenizer.prototype.makeUrl = function (token) {
        switch (token.type) {
            case "usage":
                var usage = token;
                if (!usage.definition || !usage.definition.location) {
                    return 'javascript:return false;';
                }
                if (usage.definition.module == 'Jdk') {
                    return "http://localhost:9000/github/" + this.repoName + "/" + this.revision + "/jdk/" + usage.definition.location.path + "?p=" + usage.definition.nodeId;
                }
                else if (usage.definition.module == 'Jar') {
                    return "http://localhost:9000/github/" + this.repoName + "/" + this.revision + "/jar/" + usage.definition.jarId + "/" + usage.definition.location.path + "?p=" + usage.definition.nodeId;
                }
                else if (usage.definition.module == 'User') {
                    return "/" + this.repoName + "/blob/" + (this.branch || this.revision) + "/" + usage.definition.location.path + "?p=" + usage.definition.nodeId + "#L" + usage.definition.location.start.line;
                }
                else {
                    throw "Unrecognized module " + usage.definition.module;
                }
            case "definition":
                var definition = token;
                if (!definition.location) {
                    return 'javascript:return false;';
                }
                return "http://localhost:9000/github/" + this.repoName + "/" + this.revision + "/usage/" + definition.nodeId;
            default:
                throw "Unrecognized token type " + token.type;
        }
    };
    LineTokenizer.getRelevantNodeId = function (token) {
        var nodeId = '';
        switch (token.type) {
            case "usage":
                nodeId = token.definition.nodeId;
                break;
            case "definition":
                nodeId = token.nodeId;
                break;
        }
        return nodeId;
    };
    LineTokenizer.prototype.modify = function (elem) {
        var _this = this;
        var s = elem.nodeValue;
        var elemStart = this.col;
        var elemEnd = this.col + s.length - 1;
        var relevantTokens = [];
        while (this.index < this.tokens.length &&
            this.tokens[this.index].location.start.line == this.line &&
            this.tokens[this.index].location.start.col >= elemStart &&
            this.tokens[this.index].location.start.col <= elemEnd) {
            relevantTokens.push(this.tokens[this.index]);
            this.index++;
        }
        if (!relevantTokens) {
            return null;
        }
        var nodes = [];
        var start = 0;
        relevantTokens.forEach(function (token) {
            var tStart = token.location.start.col - _this.col;
            var tEnd = token.location.end.col - _this.col;
            if (start > tStart) {
                return;
            }
            if (tStart > 0) {
                nodes.push(document.createTextNode(s.substring(start, tStart)));
            }
            var anchor = document.createElement('a');
            anchor.href = _this.makeUrl(token);
            anchor.classList.add('codelab-link');
            if (_this.selectedNodeId && _this.selectedNodeId == LineTokenizer.getRelevantNodeId(token)) {
                anchor.classList.add('codelab-highlighted');
                _this.shouldBeHighlighted = true;
            }
            anchor.text = s.substring(tStart, tEnd + 1);
            nodes.push(anchor);
            start = tEnd + 1;
        });
        if (start <= (s.length - 1)) {
            nodes.push(document.createTextNode(s.substring(start)));
        }
        return nodes;
    };
    LineTokenizer.prototype.runIndex = function () {
        while (this.index < this.tokens.length && this.tokens[this.index].location.start.col < this.col) {
            this.index++;
        }
    };
    LineTokenizer.prototype.walk = function (elem) {
        this.runIndex();
        if (elem.nodeType == Node.TEXT_NODE) {
            var size = elem.nodeValue.length;
            var newChildren = this.modify(elem);
            this.col += size;
            return newChildren;
        }
        else {
            var childNodes_2 = [];
            elem.childNodes.forEach(function (child) { return childNodes_2.push(child); });
            for (var _i = 0, childNodes_1 = childNodes_2; _i < childNodes_1.length; _i++) {
                var child = childNodes_1[_i];
                var newChildNodes = this.walk(child);
                if (newChildNodes) {
                    child.replaceWith.apply(child, newChildNodes);
                }
            }
            return null;
        }
    };
    LineTokenizer.prototype.process = function (elem) {
        this.col = 1;
        this.walk(elem);
        return this.shouldBeHighlighted;
    };
    return LineTokenizer;
}());



/***/ }),

/***/ "./src/ts/lib/_process_file.ts":
/*!*************************************!*\
  !*** ./src/ts/lib/_process_file.ts ***!
  \*************************************/
/*! exports provided: processFile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "processFile", function() { return processFile; });
/* harmony import */ var _file_highlighter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_file_highlighter */ "./src/ts/lib/_file_highlighter.ts");
/* harmony import */ var _line_tokenizer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_line_tokenizer */ "./src/ts/lib/_line_tokenizer.ts");


function processFile() {
    console.log("[Codelab] Process the page as a file: " + window.location.href);
    var permalink = document.querySelector('.js-permalink-shortcut');
    if (!permalink) {
        console.error("Unable to detect a commit sha. This shouldn't have happened.");
        return;
    }
    var urlTokens = permalink.getAttribute('href').split('/');
    var repoName = urlTokens[1] + "/" + urlTokens[2];
    var revision = urlTokens[4];
    var path = urlTokens.slice(5).join('/');
    console.log("[Codelab] repo: " + repoName + ", revision: " + revision + ", file: " + path);
    var branch = window.location.href.split('/')[6];
    var selectedNodeId = new URLSearchParams(window.location.search).get('p');
    if (!path.endsWith('.java')) {
        console.log('[Codelab] Do nothing. This is not a java file.');
        return;
    }
    console.log("[Codelab] Fetch data from " + "http://localhost:9000");
    chrome.runtime.sendMessage({
        repoName: repoName,
        files: [{ revision: revision, path: path }]
    }, function (resp) {
        if (resp.data && resp.data.success) {
            console.log('[Codelab] Fetched data successfully ', resp);
            new _file_highlighter__WEBPACK_IMPORTED_MODULE_0__["FileHighlighter"]({
                repoName: repoName,
                revision: revision,
                branch: branch,
                selectedNodeId: selectedNodeId,
                lineTokens: _line_tokenizer__WEBPACK_IMPORTED_MODULE_1__["LineTokens"].build(resp.data.files[0])
            }).run();
        }
        else {
            console.log('[Codelab] Failed to fetch data.', resp);
        }
    });
}


/***/ }),

/***/ "./src/ts/lib/_process_pull_request.ts":
/*!*********************************************!*\
  !*** ./src/ts/lib/_process_pull_request.ts ***!
  \*********************************************/
/*! exports provided: processPullRequest */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "processPullRequest", function() { return processPullRequest; });
/* harmony import */ var _pull_request_file_highlighter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_pull_request_file_highlighter */ "./src/ts/lib/_pull_request_file_highlighter.ts");
/* harmony import */ var _line_tokenizer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_line_tokenizer */ "./src/ts/lib/_line_tokenizer.ts");


function processPullRequest() {
    console.log("[Codelab] Process the page as a pull request: " + window.location.href);
    var urlTokens = window.location.href.split('/');
    if (urlTokens[7] !== 'files') {
        console.log('[Codelab] The tab "Files changed" is not visible. Do nothing.');
        return;
    }
    var repoName = urlTokens[3] + "/" + urlTokens[4];
    var startRevision = document.querySelector('input[name=comparison_start_oid]').value;
    var endRevision = document.querySelector('input[name=comparison_end_oid]').value;
    console.log("[Codelab] Base revision: " + startRevision + ", target revision: " + endRevision);
    var fileViews = document.querySelectorAll('#files .js-file');
    console.log("[Codelab] Found " + fileViews.length + " files.");
    var files = [];
    fileViews.forEach(function (fileView) {
        var path = fileView.querySelector('.js-file-header').getAttribute('data-path');
        if (path.endsWith('.java')) {
            files.push({ revision: startRevision, path: path });
            files.push({ revision: endRevision, path: path });
        }
    });
    console.log("[Codelab] Fetch data from " + "http://localhost:9000");
    chrome.runtime.sendMessage({
        repoName: repoName,
        files: files
    }, function (resp) {
        if (resp.data && resp.data.success) {
            console.log('[Codelab] Fetched data successfully ', resp);
            var dataByRevisionAndPath_1 = buildData(resp.data.files);
            fileViews.forEach(function (fileView) {
                var path = fileView.querySelector('.js-file-header').getAttribute('data-path');
                var startFileResponse = dataByRevisionAndPath_1.get(startRevision).get(path);
                var endFileResponse = dataByRevisionAndPath_1.get(endRevision).get(path);
                new _pull_request_file_highlighter__WEBPACK_IMPORTED_MODULE_0__["PullRequestFileHighlighter"]({
                    repoName: repoName,
                    fileView: fileView,
                    startTokenSet: new _pull_request_file_highlighter__WEBPACK_IMPORTED_MODULE_0__["PullRequestFileTokenSet"](startRevision, _line_tokenizer__WEBPACK_IMPORTED_MODULE_1__["LineTokens"].build(startFileResponse)),
                    endTokenSet: new _pull_request_file_highlighter__WEBPACK_IMPORTED_MODULE_0__["PullRequestFileTokenSet"](endRevision, _line_tokenizer__WEBPACK_IMPORTED_MODULE_1__["LineTokens"].build(endFileResponse))
                }).run();
            });
        }
        else {
            console.log('[Codelab] Failed to fetch data.', resp);
        }
    });
}
function buildData(files) {
    var map = new Map();
    files.forEach(function (file) {
        if (!map.has(file.revision)) {
            map.set(file.revision, new Map());
        }
        var revisionMap = map.get(file.revision);
        revisionMap.set(file.path, file);
    });
    return map;
}


/***/ }),

/***/ "./src/ts/lib/_pull_request_file_highlighter.ts":
/*!******************************************************!*\
  !*** ./src/ts/lib/_pull_request_file_highlighter.ts ***!
  \******************************************************/
/*! exports provided: PullRequestFileTokenSet, PullRequestFileHighlighter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PullRequestFileTokenSet", function() { return PullRequestFileTokenSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PullRequestFileHighlighter", function() { return PullRequestFileHighlighter; });
/* harmony import */ var _line_tokenizer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_line_tokenizer */ "./src/ts/lib/_line_tokenizer.ts");

var PullRequestFileTokenSet = /** @class */ (function () {
    function PullRequestFileTokenSet(revision, lineTokens) {
        var _this = this;
        this.revision = revision;
        this.lineTokensByLine = new Map();
        lineTokens.forEach(function (lineToken) {
            _this.lineTokensByLine.set(lineToken.line, lineToken);
        });
    }
    return PullRequestFileTokenSet;
}());

var PullRequestFileHighlighter = /** @class */ (function () {
    function PullRequestFileHighlighter(options) {
        this.fileView = options.fileView;
        this.repoName = options.repoName;
        this.startTokenSet = options.startTokenSet;
        this.endTokenSet = options.endTokenSet;
    }
    PullRequestFileHighlighter.prototype.processView = function (cell, line, tokenSet) {
        var tokenizer = new _line_tokenizer__WEBPACK_IMPORTED_MODULE_0__["LineTokenizer"]({
            repoName: this.repoName,
            revision: tokenSet.revision,
            branch: null,
            selectedNodeId: null,
            line: line,
            sortedTokens: tokenSet.lineTokensByLine.has(line) ? tokenSet.lineTokensByLine.get(line).tokens : []
        });
        tokenizer.process(cell);
    };
    PullRequestFileHighlighter.prototype.run = function () {
        var _this = this;
        this.fileView.querySelectorAll('.file-diff-split tr').forEach(function (row) {
            // Having 4 children looks like a diff.
            if (row.children.length == 4) {
                var startRevisionLine = row.children.item(0).getAttribute('data-line-number');
                if (startRevisionLine) {
                    _this.processView(row.children.item(1).querySelector('.blob-code-inner'), parseInt(startRevisionLine), _this.startTokenSet);
                }
                var endRevisionLine = row.children.item(2).getAttribute('data-line-number');
                console.log(endRevisionLine);
                if (endRevisionLine) {
                    console.log(row.children.item(3).querySelector('.blob-code-inner'));
                    console.log(_this.endTokenSet);
                    _this.processView(row.children.item(3).querySelector('.blob-code-inner'), parseInt(endRevisionLine), _this.endTokenSet);
                }
            }
        });
    };
    return PullRequestFileHighlighter;
}());



/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2NvbnRlbnQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2xpYi9fZmlsZV9oaWdobGlnaHRlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHMvbGliL19oZWxwZXJzLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9saWIvX2xpbmVfdG9rZW5pemVyLnRzIiwid2VicGFjazovLy8uL3NyYy90cy9saWIvX3Byb2Nlc3NfZmlsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHMvbGliL19wcm9jZXNzX3B1bGxfcmVxdWVzdC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHMvbGliL19wdWxsX3JlcXVlc3RfZmlsZV9oaWdobGlnaHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBeUMsaUNBQWlDO0FBQzFFLHdIQUFnSCxtQkFBbUIsRUFBRTtBQUNySTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQUE7QUFB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QUFDLENBQUM7b0JBQ3RFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUM5QixLQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBRSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBRSxFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3pIO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxpQ0FBQztBQUFELENBQUMiLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3RzL2NvbnRlbnQudHNcIik7XG4iLCJpbXBvcnQge3Byb2Nlc3NGaWxlfSBmcm9tIFwiLi9saWIvX3Byb2Nlc3NfZmlsZVwiO1xuaW1wb3J0IHtwcm9jZXNzUHVsbFJlcXVlc3R9IGZyb20gXCIuL2xpYi9fcHJvY2Vzc19wdWxsX3JlcXVlc3RcIjtcblxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gIChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIHByb2Nlc3MoKTtcbiAgICBzZW5kUmVzcG9uc2UobnVsbCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIHByb2Nlc3MoKTogdm9pZCB7XG4gIGNvbnNvbGUubG9nKCdbQ29kZWxhYl0gRGV0ZWN0IGdpdGh1Yi4nKTtcbiAgbGV0IHRva2VucyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcvJyk7XG5cbiAgaWYgKHRva2Vuc1s1XSA9PSAnYmxvYicgfHwgdG9rZW5zWzVdID09ICd0cmVlJykge1xuICAgIHByb2Nlc3NGaWxlKCk7XG4gIH0gZWxzZSBpZiAodG9rZW5zWzVdID09ICdwdWxsJykge1xuICAgIHByb2Nlc3NQdWxsUmVxdWVzdCgpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdbQ29kZWxhYl0gVGhlIHBhZ2UgaXMgbmVpdGhlciBhIGZpbGUgbm9yIGEgcHVsbCByZXF1ZXN0LicpO1xuICB9XG59XG5cbi8vIEludm9rZSBwcm9jZXNzIHdoZW4gdGhlIHBhZ2UgaXMgZmlyc3QgbG9hZGVkLlxucHJvY2VzcygpO1xuIiwiaW1wb3J0IHtMaW5lVG9rZW5pemVyLCBMaW5lVG9rZW5zfSBmcm9tIFwiLi9fbGluZV90b2tlbml6ZXJcIjtcblxuZXhwb3J0IGNsYXNzIEZpbGVIaWdobGlnaHRlciB7XG4gIHJlcG9OYW1lOiBzdHJpbmc7XG4gIHJldmlzaW9uOiBzdHJpbmc7XG4gIGJyYW5jaDogc3RyaW5nO1xuICBsaW5lVG9rZW5zOiBMaW5lVG9rZW5zW107XG4gIHNlbGVjdGVkTm9kZUlkOiBzdHJpbmcgfCBudWxsO1xuXG4gIGhpZ2hsaWdodGVkTGluZXM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHJlcG9OYW1lOiBzdHJpbmc7XG4gICAgICByZXZpc2lvbjogc3RyaW5nO1xuICAgICAgYnJhbmNoOiBzdHJpbmc7XG4gICAgICBzZWxlY3RlZE5vZGVJZDogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGxpbmVUb2tlbnM6IExpbmVUb2tlbnNbXTtcbiAgICB9XG4gICkge1xuICAgIHRoaXMucmVwb05hbWUgPSBvcHRpb25zLnJlcG9OYW1lO1xuICAgIHRoaXMucmV2aXNpb24gPSBvcHRpb25zLnJldmlzaW9uO1xuICAgIHRoaXMuYnJhbmNoID0gb3B0aW9ucy5icmFuY2g7XG4gICAgdGhpcy5zZWxlY3RlZE5vZGVJZCA9IG9wdGlvbnMuc2VsZWN0ZWROb2RlSWQ7XG4gICAgdGhpcy5saW5lVG9rZW5zID0gb3B0aW9ucy5saW5lVG9rZW5zO1xuICB9XG5cbiAgcnVuKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmxpbmVUb2tlbnMubGVuZ3RoID09IDApIHsgcmV0dXJuOyB9XG5cbiAgICBmb3IgKGxldCBsaW5lVG9rZW4gb2YgdGhpcy5saW5lVG9rZW5zKSB7XG4gICAgICBsZXQgdG9rZW5pemVyID0gbmV3IExpbmVUb2tlbml6ZXIoe1xuICAgICAgICByZXBvTmFtZTogdGhpcy5yZXBvTmFtZSxcbiAgICAgICAgcmV2aXNpb246IHRoaXMucmV2aXNpb24sXG4gICAgICAgIGJyYW5jaDogdGhpcy5icmFuY2gsXG4gICAgICAgIHNlbGVjdGVkTm9kZUlkOiB0aGlzLnNlbGVjdGVkTm9kZUlkLFxuICAgICAgICBsaW5lOiBsaW5lVG9rZW4ubGluZSxcbiAgICAgICAgc29ydGVkVG9rZW5zOiBsaW5lVG9rZW4udG9rZW5zXG4gICAgICB9KTtcbiAgICAgIGxldCBsaW5lRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNMQyR7bGluZVRva2VuLmxpbmV9YCkhO1xuXG4gICAgICBsZXQgc2hvdWxkTGluZUJlSGlnaGxpZ2h0ZWQgPSB0b2tlbml6ZXIucHJvY2VzcyhsaW5lRWxlbSk7XG5cbiAgICAgIGlmIChzaG91bGRMaW5lQmVIaWdobGlnaHRlZCkge1xuICAgICAgICB0aGlzLmhpZ2hsaWdodGVkTGluZXMuYWRkKGxpbmVUb2tlbi5saW5lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmhpZ2hsaWdodGVkTGluZXMuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgbGV0IGxpbmVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI0xDJHtsaW5lfWApITtcbiAgICAgIGxpbmVFbGVtLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodGVkJyk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG4iLCJpbXBvcnQge0RlZmluaXRpb24sIFRva2VuLCBVc2FnZX0gZnJvbSBcIi4vX21vZGVsXCI7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRBbmRGaWx0ZXJUb2tlbnModW5zb3J0ZWRUb2tlbnM6IFRva2VuW10pOiBUb2tlbltdIHtcbiAgcmV0dXJuIHVuc29ydGVkVG9rZW5zXG4gICAgLmZpbHRlcigoYSkgPT4gISFhLmxvY2F0aW9uKVxuICAgIC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoIWEubG9jYXRpb24pIHsgcmV0dXJuIC0xOyB9XG4gICAgICBpZiAoIWIubG9jYXRpb24pIHsgcmV0dXJuIDE7IH1cblxuICAgICAgaWYgKGEubG9jYXRpb24uc3RhcnQubGluZSA8IGIubG9jYXRpb24uc3RhcnQubGluZSkgeyByZXR1cm4gLTI7IH1cbiAgICAgIGVsc2UgaWYgKGEubG9jYXRpb24uc3RhcnQubGluZSA+IGIubG9jYXRpb24uc3RhcnQubGluZSkgeyByZXR1cm4gMjsgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChhLmxvY2F0aW9uLnN0YXJ0LmNvbCA8IGIubG9jYXRpb24uc3RhcnQuY29sKSB7IHJldHVybiAtMTsgfVxuICAgICAgICBlbHNlIGlmIChhLmxvY2F0aW9uLnN0YXJ0LmNvbCA+IGIubG9jYXRpb24uc3RhcnQuY29sKSB7IHJldHVybiAxOyB9XG4gICAgICAgIGVsc2UgeyByZXR1cm4gMDsgfVxuICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVVzYWdlc0FuZERlZmluaXRpb25zKHVzYWdlczogVXNhZ2VbXSwgZGVmaW5pdGlvbnM6IERlZmluaXRpb25bXSk6IFRva2VuW10ge1xuICBsZXQgdG9rZW5zOiBUb2tlbltdID0gW107XG5cbiAgdXNhZ2VzLmZvckVhY2goKHUpID0+IHRva2Vucy5wdXNoKHUpKTtcbiAgZGVmaW5pdGlvbnMuZm9yRWFjaCgoZCkgPT4gdG9rZW5zLnB1c2goZCkpO1xuXG4gIHJldHVybiB0b2tlbnM7XG59IiwiaW1wb3J0IHtEZWZpbml0aW9uLCBGaWxlUmVzcG9uc2UsIFRva2VuLCBVc2FnZX0gZnJvbSBcIi4vX21vZGVsXCI7XG5pbXBvcnQge2NvbWJpbmVVc2FnZXNBbmREZWZpbml0aW9ucywgc29ydEFuZEZpbHRlclRva2Vuc30gZnJvbSBcIi4vX2hlbHBlcnNcIjtcblxuZXhwb3J0IGNsYXNzIExpbmVUb2tlbnMge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbGluZTogbnVtYmVyLFxuICAgIHB1YmxpYyB0b2tlbnM6IFRva2VuW11cbiAgKSB7fVxuXG5cbiAgc3RhdGljIGJ1aWxkKGZpbGVSZXNwb25zZTogRmlsZVJlc3BvbnNlKTogTGluZVRva2Vuc1tdIHtcbiAgICBsZXQgdG9rZW5zID0gc29ydEFuZEZpbHRlclRva2Vucyhjb21iaW5lVXNhZ2VzQW5kRGVmaW5pdGlvbnMoZmlsZVJlc3BvbnNlLnVzYWdlcywgZmlsZVJlc3BvbnNlLmRlZmluaXRpb25zKSk7XG4gICAgbGV0IGxpbmVzID0gW107XG5cbiAgICBsZXQgY3VycmVudExpbmU6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIGxldCBjdXJyZW50VG9rZW5zOiBUb2tlbltdID0gW107XG5cbiAgICBmb3IgKGxldCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICghdG9rZW4ubG9jYXRpb24pIHsgY29udGludWU7IH1cbiAgICAgIGlmIChjdXJyZW50TGluZSA9PT0gbnVsbCkgeyBjdXJyZW50TGluZSA9IHRva2VuLmxvY2F0aW9uLnN0YXJ0LmxpbmU7IH1cblxuICAgICAgaWYgKGN1cnJlbnRMaW5lID09PSB0b2tlbi5sb2NhdGlvbi5zdGFydC5saW5lKSB7XG4gICAgICAgIGN1cnJlbnRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaW5lcy5wdXNoKG5ldyBMaW5lVG9rZW5zKGN1cnJlbnRMaW5lLCBjdXJyZW50VG9rZW5zKSk7XG4gICAgICAgIGN1cnJlbnRUb2tlbnMgPSBbdG9rZW5dO1xuICAgICAgICBjdXJyZW50TGluZSA9IHRva2VuLmxvY2F0aW9uLnN0YXJ0LmxpbmU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRUb2tlbnMubGVuZ3RoID4gMCAmJiBjdXJyZW50TGluZSkge1xuICAgICAgbGluZXMucHVzaChuZXcgTGluZVRva2VucyhjdXJyZW50TGluZSwgY3VycmVudFRva2VucykpO1xuICAgIH1cblxuICAgIHJldHVybiBsaW5lcztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGluZVRva2VuaXplciB7XG4gIHJlYWRvbmx5IHJlcG9OYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHJldmlzaW9uOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGJyYW5jaDogc3RyaW5nIHwgbnVsbDtcbiAgcmVhZG9ubHkgc2VsZWN0ZWROb2RlSWQ6IHN0cmluZyB8IG51bGw7XG4gIHJlYWRvbmx5IHRva2VuczogVG9rZW5bXTtcbiAgcmVhZG9ubHkgbGluZTogbnVtYmVyO1xuXG4gIGluZGV4OiBudW1iZXIgPSAwO1xuICBjb2w6IG51bWJlciA9IDE7XG5cbiAgc2hvdWxkQmVIaWdobGlnaHRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtcbiAgICByZXBvTmFtZTogc3RyaW5nO1xuICAgIHJldmlzaW9uOiBzdHJpbmc7XG4gICAgYnJhbmNoOiBzdHJpbmcgfCBudWxsO1xuICAgIHNlbGVjdGVkTm9kZUlkOiBzdHJpbmcgfCBudWxsO1xuICAgIGxpbmU6IG51bWJlcjtcbiAgICBzb3J0ZWRUb2tlbnM6IFRva2VuW11cbiAgfSkge1xuICAgIHRoaXMucmVwb05hbWUgPSBvcHRpb25zLnJlcG9OYW1lO1xuICAgIHRoaXMucmV2aXNpb24gPSBvcHRpb25zLnJldmlzaW9uO1xuICAgIHRoaXMuYnJhbmNoID0gb3B0aW9ucy5icmFuY2g7XG4gICAgdGhpcy5zZWxlY3RlZE5vZGVJZCA9IG9wdGlvbnMuc2VsZWN0ZWROb2RlSWQ7XG4gICAgdGhpcy50b2tlbnMgPSBvcHRpb25zLnNvcnRlZFRva2VucztcbiAgICB0aGlzLmxpbmUgPSBvcHRpb25zLmxpbmU7XG4gIH1cblxuICBtYWtlVXJsKHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICBjYXNlIFwidXNhZ2VcIjpcbiAgICAgICAgbGV0IHVzYWdlID0gdG9rZW4gYXMgVXNhZ2U7XG4gICAgICAgIGlmICghdXNhZ2UuZGVmaW5pdGlvbiB8fCAhdXNhZ2UuZGVmaW5pdGlvbi5sb2NhdGlvbikge1xuICAgICAgICAgIHJldHVybiAnamF2YXNjcmlwdDpyZXR1cm4gZmFsc2U7JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1c2FnZS5kZWZpbml0aW9uLm1vZHVsZSA9PSAnSmRrJykge1xuICAgICAgICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDo5MDAwL2dpdGh1Yi8ke3RoaXMucmVwb05hbWV9LyR7dGhpcy5yZXZpc2lvbn0vamRrLyR7dXNhZ2UuZGVmaW5pdGlvbi5sb2NhdGlvbi5wYXRofT9wPSR7dXNhZ2UuZGVmaW5pdGlvbi5ub2RlSWR9YDtcbiAgICAgICAgfSBlbHNlIGlmICh1c2FnZS5kZWZpbml0aW9uLm1vZHVsZSA9PSAnSmFyJykge1xuICAgICAgICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDo5MDAwL2dpdGh1Yi8ke3RoaXMucmVwb05hbWV9LyR7dGhpcy5yZXZpc2lvbn0vamFyLyR7dXNhZ2UuZGVmaW5pdGlvbi5qYXJJZH0vJHt1c2FnZS5kZWZpbml0aW9uLmxvY2F0aW9uLnBhdGh9P3A9JHt1c2FnZS5kZWZpbml0aW9uLm5vZGVJZH1gO1xuICAgICAgICB9IGVsc2UgaWYgKHVzYWdlLmRlZmluaXRpb24ubW9kdWxlID09ICdVc2VyJykge1xuICAgICAgICAgIHJldHVybiBgLyR7dGhpcy5yZXBvTmFtZX0vYmxvYi8ke3RoaXMuYnJhbmNoIHx8IHRoaXMucmV2aXNpb259LyR7dXNhZ2UuZGVmaW5pdGlvbi5sb2NhdGlvbi5wYXRofT9wPSR7dXNhZ2UuZGVmaW5pdGlvbi5ub2RlSWR9I0wke3VzYWdlLmRlZmluaXRpb24ubG9jYXRpb24uc3RhcnQubGluZX1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGBVbnJlY29nbml6ZWQgbW9kdWxlICR7dXNhZ2UuZGVmaW5pdGlvbi5tb2R1bGV9YDtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcImRlZmluaXRpb25cIjpcbiAgICAgICAgbGV0IGRlZmluaXRpb24gPSB0b2tlbiBhcyBEZWZpbml0aW9uO1xuXG4gICAgICAgIGlmICghZGVmaW5pdGlvbi5sb2NhdGlvbikge1xuICAgICAgICAgIHJldHVybiAnamF2YXNjcmlwdDpyZXR1cm4gZmFsc2U7JztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDo5MDAwL2dpdGh1Yi8ke3RoaXMucmVwb05hbWV9LyR7dGhpcy5yZXZpc2lvbn0vdXNhZ2UvJHtkZWZpbml0aW9uLm5vZGVJZH1gO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBgVW5yZWNvZ25pemVkIHRva2VuIHR5cGUgJHt0b2tlbi50eXBlfWA7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdldFJlbGV2YW50Tm9kZUlkKHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG4gICAgbGV0IG5vZGVJZDogc3RyaW5nID0gJyc7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICBjYXNlIFwidXNhZ2VcIjpcbiAgICAgICAgbm9kZUlkID0gKHRva2VuIGFzIFVzYWdlKS5kZWZpbml0aW9uLm5vZGVJZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZGVmaW5pdGlvblwiOlxuICAgICAgICBub2RlSWQgPSAodG9rZW4gYXMgRGVmaW5pdGlvbikubm9kZUlkO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVJZDtcbiAgfVxuXG4gIHByaXZhdGUgbW9kaWZ5KGVsZW06IE5vZGUpOiBOb2RlW10gfCBudWxsIHtcbiAgICBsZXQgcyA9IGVsZW0ubm9kZVZhbHVlITtcbiAgICBsZXQgZWxlbVN0YXJ0ID0gdGhpcy5jb2w7XG4gICAgbGV0IGVsZW1FbmQgPSB0aGlzLmNvbCArIHMubGVuZ3RoIC0gMTtcblxuICAgIGxldCByZWxldmFudFRva2VucyA9IFtdO1xuXG4gICAgd2hpbGUgKFxuICAgICAgdGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAmJlxuICAgICAgdGhpcy50b2tlbnNbdGhpcy5pbmRleF0ubG9jYXRpb24hLnN0YXJ0LmxpbmUgPT0gdGhpcy5saW5lICYmXG4gICAgICB0aGlzLnRva2Vuc1t0aGlzLmluZGV4XS5sb2NhdGlvbiEuc3RhcnQuY29sID49IGVsZW1TdGFydCAmJlxuICAgICAgdGhpcy50b2tlbnNbdGhpcy5pbmRleF0ubG9jYXRpb24hLnN0YXJ0LmNvbCA8PSBlbGVtRW5kXG4gICAgICApIHtcbiAgICAgIHJlbGV2YW50VG9rZW5zLnB1c2godGhpcy50b2tlbnNbdGhpcy5pbmRleF0pO1xuICAgICAgdGhpcy5pbmRleCsrO1xuICAgIH1cblxuICAgIGlmICghcmVsZXZhbnRUb2tlbnMpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIGxldCBub2RlcyA9IFtdO1xuICAgIGxldCBzdGFydCA9IDA7XG5cbiAgICByZWxldmFudFRva2Vucy5mb3JFYWNoKCh0b2tlbikgPT4ge1xuICAgICAgbGV0IHRTdGFydCA9IHRva2VuLmxvY2F0aW9uIS5zdGFydC5jb2wgLSB0aGlzLmNvbDtcbiAgICAgIGxldCB0RW5kID0gdG9rZW4ubG9jYXRpb24hLmVuZC5jb2wgLSB0aGlzLmNvbDtcblxuICAgICAgaWYgKHN0YXJ0ID4gdFN0YXJ0KSB7IHJldHVybjsgfVxuXG4gICAgICBpZiAodFN0YXJ0ID4gMCkge1xuICAgICAgICBub2Rlcy5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMuc3Vic3RyaW5nKHN0YXJ0LCB0U3RhcnQpKSk7XG4gICAgICB9XG5cbiAgICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBhbmNob3IuaHJlZiA9IHRoaXMubWFrZVVybCh0b2tlbik7XG4gICAgICBhbmNob3IuY2xhc3NMaXN0LmFkZCgnY29kZWxhYi1saW5rJyk7XG4gICAgICBpZiAodGhpcy5zZWxlY3RlZE5vZGVJZCAmJiB0aGlzLnNlbGVjdGVkTm9kZUlkID09IExpbmVUb2tlbml6ZXIuZ2V0UmVsZXZhbnROb2RlSWQodG9rZW4pKSB7XG4gICAgICAgIGFuY2hvci5jbGFzc0xpc3QuYWRkKCdjb2RlbGFiLWhpZ2hsaWdodGVkJyk7XG4gICAgICAgIHRoaXMuc2hvdWxkQmVIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICBhbmNob3IudGV4dCA9IHMuc3Vic3RyaW5nKHRTdGFydCwgdEVuZCArIDEpO1xuICAgICAgbm9kZXMucHVzaChhbmNob3IpO1xuXG4gICAgICBzdGFydCA9IHRFbmQgKyAxO1xuICAgIH0pO1xuXG4gICAgaWYgKHN0YXJ0IDw9IChzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBub2Rlcy5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMuc3Vic3RyaW5nKHN0YXJ0KSkpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIHByaXZhdGUgcnVuSW5kZXgoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGggJiYgdGhpcy50b2tlbnNbdGhpcy5pbmRleF0ubG9jYXRpb24hLnN0YXJ0LmNvbCA8IHRoaXMuY29sKSB7XG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB3YWxrKGVsZW06IE5vZGUpOiBOb2RlW10gfCBudWxsIHtcbiAgICB0aGlzLnJ1bkluZGV4KCk7XG5cbiAgICBpZiAoZWxlbS5ub2RlVHlwZSA9PSBOb2RlLlRFWFRfTk9ERSkge1xuICAgICAgbGV0IHNpemUgPSBlbGVtLm5vZGVWYWx1ZSEubGVuZ3RoO1xuICAgICAgbGV0IG5ld0NoaWxkcmVuID0gdGhpcy5tb2RpZnkoZWxlbSk7XG4gICAgICB0aGlzLmNvbCArPSBzaXplO1xuXG4gICAgICByZXR1cm4gbmV3Q2hpbGRyZW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBjaGlsZE5vZGVzOiBDaGlsZE5vZGVbXSA9IFtdO1xuICAgICAgZWxlbS5jaGlsZE5vZGVzLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZE5vZGVzLnB1c2goY2hpbGQpKTtcblxuICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGROb2Rlcykge1xuICAgICAgICBsZXQgbmV3Q2hpbGROb2RlcyA9IHRoaXMud2FsayhjaGlsZCk7XG4gICAgICAgIGlmIChuZXdDaGlsZE5vZGVzKSB7XG4gICAgICAgICAgY2hpbGQucmVwbGFjZVdpdGgoLi4ubmV3Q2hpbGROb2Rlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJvY2VzcyhlbGVtOiBOb2RlKTogYm9vbGVhbiB7XG4gICAgdGhpcy5jb2wgPSAxO1xuICAgIHRoaXMud2FsayhlbGVtKTtcbiAgICByZXR1cm4gdGhpcy5zaG91bGRCZUhpZ2hsaWdodGVkO1xuICB9XG59XG4iLCJpbXBvcnQge0ZpbGVIaWdobGlnaHRlcn0gZnJvbSBcIi4vX2ZpbGVfaGlnaGxpZ2h0ZXJcIjtcbmltcG9ydCB7TGluZVRva2Vuc30gZnJvbSBcIi4vX2xpbmVfdG9rZW5pemVyXCI7XG5cbmRlY2xhcmUgbGV0IF9fSE9TVF9fOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRmlsZSgpOiB2b2lkIHtcbiAgY29uc29sZS5sb2coYFtDb2RlbGFiXSBQcm9jZXNzIHRoZSBwYWdlIGFzIGEgZmlsZTogJHt3aW5kb3cubG9jYXRpb24uaHJlZn1gKTtcblxuICBsZXQgcGVybWFsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXBlcm1hbGluay1zaG9ydGN1dCcpO1xuICBpZiAoIXBlcm1hbGluaykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gZGV0ZWN0IGEgY29tbWl0IHNoYS4gVGhpcyBzaG91bGRuJ3QgaGF2ZSBoYXBwZW5lZC5cIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IHVybFRva2VucyA9IHBlcm1hbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSEuc3BsaXQoJy8nKTtcblxuICBsZXQgcmVwb05hbWUgPSBgJHt1cmxUb2tlbnNbMV19LyR7dXJsVG9rZW5zWzJdfWA7XG4gIGxldCByZXZpc2lvbiA9IHVybFRva2Vuc1s0XTtcbiAgbGV0IHBhdGggPSB1cmxUb2tlbnMuc2xpY2UoNSkuam9pbignLycpO1xuXG4gIGNvbnNvbGUubG9nKGBbQ29kZWxhYl0gcmVwbzogJHtyZXBvTmFtZX0sIHJldmlzaW9uOiAke3JldmlzaW9ufSwgZmlsZTogJHtwYXRofWApO1xuXG4gIGxldCBicmFuY2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnLycpWzZdO1xuXG4gIGxldCBzZWxlY3RlZE5vZGVJZCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KCdwJyk7XG5cbiAgaWYgKCFwYXRoLmVuZHNXaXRoKCcuamF2YScpKSB7XG4gICAgY29uc29sZS5sb2coJ1tDb2RlbGFiXSBEbyBub3RoaW5nLiBUaGlzIGlzIG5vdCBhIGphdmEgZmlsZS4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zb2xlLmxvZyhgW0NvZGVsYWJdIEZldGNoIGRhdGEgZnJvbSAke19fSE9TVF9ffWApO1xuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcbiAgICB7XG4gICAgICByZXBvTmFtZTogcmVwb05hbWUsXG4gICAgICBmaWxlczogW3sgcmV2aXNpb246IHJldmlzaW9uLCBwYXRoOiBwYXRoIH1dXG4gICAgfSxcbiAgICAocmVzcCkgPT4ge1xuICAgICAgaWYgKHJlc3AuZGF0YSAmJiByZXNwLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICBjb25zb2xlLmxvZygnW0NvZGVsYWJdIEZldGNoZWQgZGF0YSBzdWNjZXNzZnVsbHkgJywgcmVzcCk7XG4gICAgICAgIG5ldyBGaWxlSGlnaGxpZ2h0ZXIoe1xuICAgICAgICAgIHJlcG9OYW1lOiByZXBvTmFtZSxcbiAgICAgICAgICByZXZpc2lvbjogcmV2aXNpb24sXG4gICAgICAgICAgYnJhbmNoOiBicmFuY2gsXG4gICAgICAgICAgc2VsZWN0ZWROb2RlSWQ6IHNlbGVjdGVkTm9kZUlkLFxuICAgICAgICAgIGxpbmVUb2tlbnM6IExpbmVUb2tlbnMuYnVpbGQocmVzcC5kYXRhLmZpbGVzWzBdKVxuICAgICAgICB9KS5ydW4oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbQ29kZWxhYl0gRmFpbGVkIHRvIGZldGNoIGRhdGEuJywgcmVzcCk7XG4gICAgICB9XG4gICAgfVxuICApO1xufVxuXG4iLCJpbXBvcnQge0ZpbGVSZXNwb25zZX0gZnJvbSBcIi4vX21vZGVsXCI7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmlsZUhpZ2hsaWdodGVyLCBQdWxsUmVxdWVzdEZpbGVUb2tlblNldH0gZnJvbSBcIi4vX3B1bGxfcmVxdWVzdF9maWxlX2hpZ2hsaWdodGVyXCI7XG5pbXBvcnQge0xpbmVUb2tlbnN9IGZyb20gXCIuL19saW5lX3Rva2VuaXplclwiO1xuXG5kZWNsYXJlIGxldCBfX0hPU1RfXzogc3RyaW5nO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc1B1bGxSZXF1ZXN0KCk6IHZvaWQge1xuICBjb25zb2xlLmxvZyhgW0NvZGVsYWJdIFByb2Nlc3MgdGhlIHBhZ2UgYXMgYSBwdWxsIHJlcXVlc3Q6ICR7d2luZG93LmxvY2F0aW9uLmhyZWZ9YCk7XG5cbiAgbGV0IHVybFRva2VucyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcvJyk7XG5cbiAgaWYgKHVybFRva2Vuc1s3XSAhPT0gJ2ZpbGVzJykge1xuICAgIGNvbnNvbGUubG9nKCdbQ29kZWxhYl0gVGhlIHRhYiBcIkZpbGVzIGNoYW5nZWRcIiBpcyBub3QgdmlzaWJsZS4gRG8gbm90aGluZy4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgcmVwb05hbWUgPSBgJHt1cmxUb2tlbnNbM119LyR7dXJsVG9rZW5zWzRdfWA7XG5cbiAgbGV0IHN0YXJ0UmV2aXNpb24gPSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1jb21wYXJpc29uX3N0YXJ0X29pZF0nKSEgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWU7XG4gIGxldCBlbmRSZXZpc2lvbiA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPWNvbXBhcmlzb25fZW5kX29pZF0nKSEgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWU7XG5cbiAgY29uc29sZS5sb2coYFtDb2RlbGFiXSBCYXNlIHJldmlzaW9uOiAke3N0YXJ0UmV2aXNpb259LCB0YXJnZXQgcmV2aXNpb246ICR7ZW5kUmV2aXNpb259YCk7XG5cbiAgbGV0IGZpbGVWaWV3cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNmaWxlcyAuanMtZmlsZScpO1xuICBjb25zb2xlLmxvZyhgW0NvZGVsYWJdIEZvdW5kICR7ZmlsZVZpZXdzLmxlbmd0aH0gZmlsZXMuYCk7XG5cbiAgbGV0IGZpbGVzOiBvYmplY3RbXSA9IFtdO1xuICBmaWxlVmlld3MuZm9yRWFjaCgoZmlsZVZpZXcpID0+IHtcbiAgICBsZXQgcGF0aCA9IGZpbGVWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5qcy1maWxlLWhlYWRlcicpIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGF0aCcpITtcblxuICAgIGlmIChwYXRoLmVuZHNXaXRoKCcuamF2YScpKSB7XG4gICAgICBmaWxlcy5wdXNoKHtyZXZpc2lvbjogc3RhcnRSZXZpc2lvbiwgcGF0aDogcGF0aH0pO1xuICAgICAgZmlsZXMucHVzaCh7cmV2aXNpb246IGVuZFJldmlzaW9uLCBwYXRoOiBwYXRofSk7XG4gICAgfVxuICB9KTtcblxuICBjb25zb2xlLmxvZyhgW0NvZGVsYWJdIEZldGNoIGRhdGEgZnJvbSAke19fSE9TVF9ffWApO1xuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcbiAgICB7XG4gICAgICByZXBvTmFtZTogcmVwb05hbWUsXG4gICAgICBmaWxlczogZmlsZXNcbiAgICB9LFxuICAgIChyZXNwKSA9PiB7XG4gICAgICBpZiAocmVzcC5kYXRhICYmIHJlc3AuZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbQ29kZWxhYl0gRmV0Y2hlZCBkYXRhIHN1Y2Nlc3NmdWxseSAnLCByZXNwKTtcblxuICAgICAgICBsZXQgZGF0YUJ5UmV2aXNpb25BbmRQYXRoID0gYnVpbGREYXRhKHJlc3AuZGF0YS5maWxlcyk7XG5cbiAgICAgICAgZmlsZVZpZXdzLmZvckVhY2goKGZpbGVWaWV3KSA9PiB7XG4gICAgICAgICAgbGV0IHBhdGggPSBmaWxlVmlldy5xdWVyeVNlbGVjdG9yKCcuanMtZmlsZS1oZWFkZXInKSEuZ2V0QXR0cmlidXRlKCdkYXRhLXBhdGgnKSE7XG4gICAgICAgICAgbGV0IHN0YXJ0RmlsZVJlc3BvbnNlID0gZGF0YUJ5UmV2aXNpb25BbmRQYXRoLmdldChzdGFydFJldmlzaW9uKSEuZ2V0KHBhdGgpITtcbiAgICAgICAgICBsZXQgZW5kRmlsZVJlc3BvbnNlID0gZGF0YUJ5UmV2aXNpb25BbmRQYXRoLmdldChlbmRSZXZpc2lvbikhLmdldChwYXRoKSE7XG5cbiAgICAgICAgICBuZXcgUHVsbFJlcXVlc3RGaWxlSGlnaGxpZ2h0ZXIoe1xuICAgICAgICAgICAgcmVwb05hbWU6IHJlcG9OYW1lLFxuICAgICAgICAgICAgZmlsZVZpZXc6IGZpbGVWaWV3LFxuICAgICAgICAgICAgc3RhcnRUb2tlblNldDogbmV3IFB1bGxSZXF1ZXN0RmlsZVRva2VuU2V0KFxuICAgICAgICAgICAgICBzdGFydFJldmlzaW9uLFxuICAgICAgICAgICAgICBMaW5lVG9rZW5zLmJ1aWxkKHN0YXJ0RmlsZVJlc3BvbnNlKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGVuZFRva2VuU2V0OiBuZXcgUHVsbFJlcXVlc3RGaWxlVG9rZW5TZXQoXG4gICAgICAgICAgICAgIGVuZFJldmlzaW9uLFxuICAgICAgICAgICAgICBMaW5lVG9rZW5zLmJ1aWxkKGVuZEZpbGVSZXNwb25zZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KS5ydW4oKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnW0NvZGVsYWJdIEZhaWxlZCB0byBmZXRjaCBkYXRhLicsIHJlc3ApO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gYnVpbGREYXRhKGZpbGVzOiBGaWxlUmVzcG9uc2VbXSk6IE1hcDxTdHJpbmcsIE1hcDxTdHJpbmcsIEZpbGVSZXNwb25zZT4+IHtcbiAgbGV0IG1hcCA9IG5ldyBNYXAoKTtcblxuICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgaWYgKCFtYXAuaGFzKGZpbGUucmV2aXNpb24pKSB7XG4gICAgICBtYXAuc2V0KGZpbGUucmV2aXNpb24sIG5ldyBNYXAoKSk7XG4gICAgfVxuXG4gICAgbGV0IHJldmlzaW9uTWFwID0gbWFwLmdldChmaWxlLnJldmlzaW9uKTtcbiAgICByZXZpc2lvbk1hcC5zZXQoZmlsZS5wYXRoLCBmaWxlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cbiIsImltcG9ydCB7TGluZVRva2VuaXplciwgTGluZVRva2Vuc30gZnJvbSBcIi4vX2xpbmVfdG9rZW5pemVyXCI7XG5cblxuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0RmlsZVRva2VuU2V0IHtcbiAgbGluZVRva2Vuc0J5TGluZTogTWFwPG51bWJlciwgTGluZVRva2Vucz47XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZXZpc2lvbjogc3RyaW5nLFxuICAgIGxpbmVUb2tlbnM6IExpbmVUb2tlbnNbXVxuICApIHtcbiAgIHRoaXMubGluZVRva2Vuc0J5TGluZSA9IG5ldyBNYXAoKTtcblxuICAgbGluZVRva2Vucy5mb3JFYWNoKChsaW5lVG9rZW4pID0+IHtcbiAgICAgdGhpcy5saW5lVG9rZW5zQnlMaW5lLnNldChsaW5lVG9rZW4ubGluZSwgbGluZVRva2VuKTtcbiAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdEZpbGVIaWdobGlnaHRlciB7XG4gIGZpbGVWaWV3OiBFbGVtZW50O1xuICByZXBvTmFtZTogc3RyaW5nO1xuXG4gIHN0YXJ0VG9rZW5TZXQ6IFB1bGxSZXF1ZXN0RmlsZVRva2VuU2V0O1xuICBlbmRUb2tlblNldDogUHVsbFJlcXVlc3RGaWxlVG9rZW5TZXQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0aW9uczoge1xuICAgICAgcmVwb05hbWU6IHN0cmluZyxcbiAgICAgIGZpbGVWaWV3OiBFbGVtZW50LFxuICAgICAgc3RhcnRUb2tlblNldDogUHVsbFJlcXVlc3RGaWxlVG9rZW5TZXQsXG4gICAgICBlbmRUb2tlblNldDogUHVsbFJlcXVlc3RGaWxlVG9rZW5TZXRcbiAgICB9XG4gICkge1xuICAgIHRoaXMuZmlsZVZpZXcgPSBvcHRpb25zLmZpbGVWaWV3O1xuICAgIHRoaXMucmVwb05hbWUgPSBvcHRpb25zLnJlcG9OYW1lO1xuICAgIHRoaXMuc3RhcnRUb2tlblNldCA9IG9wdGlvbnMuc3RhcnRUb2tlblNldDtcbiAgICB0aGlzLmVuZFRva2VuU2V0ID0gb3B0aW9ucy5lbmRUb2tlblNldDtcbiAgfVxuXG4gIHByaXZhdGUgcHJvY2Vzc1ZpZXcoY2VsbDogRWxlbWVudCwgbGluZTogbnVtYmVyLCB0b2tlblNldDogUHVsbFJlcXVlc3RGaWxlVG9rZW5TZXQpOiB2b2lkIHtcbiAgICBsZXQgdG9rZW5pemVyID0gbmV3IExpbmVUb2tlbml6ZXIoe1xuICAgICAgcmVwb05hbWU6IHRoaXMucmVwb05hbWUsXG4gICAgICByZXZpc2lvbjogdG9rZW5TZXQucmV2aXNpb24sXG4gICAgICBicmFuY2g6IG51bGwsXG4gICAgICBzZWxlY3RlZE5vZGVJZDogbnVsbCxcbiAgICAgIGxpbmU6IGxpbmUsXG4gICAgICBzb3J0ZWRUb2tlbnM6IHRva2VuU2V0LmxpbmVUb2tlbnNCeUxpbmUuaGFzKGxpbmUpID8gdG9rZW5TZXQubGluZVRva2Vuc0J5TGluZS5nZXQobGluZSkhLnRva2VucyA6IFtdXG4gICAgfSk7XG5cbiAgICB0b2tlbml6ZXIucHJvY2VzcyhjZWxsKTtcblxuICB9XG5cbiAgcnVuKCk6IHZvaWQge1xuICAgIHRoaXMuZmlsZVZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmZpbGUtZGlmZi1zcGxpdCB0cicpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgLy8gSGF2aW5nIDQgY2hpbGRyZW4gbG9va3MgbGlrZSBhIGRpZmYuXG4gICAgICBpZiAocm93LmNoaWxkcmVuLmxlbmd0aCA9PSA0KSB7XG4gICAgICAgIGxldCBzdGFydFJldmlzaW9uTGluZSA9IHJvdy5jaGlsZHJlbi5pdGVtKDApIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGluZS1udW1iZXInKTtcbiAgICAgICAgaWYgKHN0YXJ0UmV2aXNpb25MaW5lKSB7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzVmlldyhyb3cuY2hpbGRyZW4uaXRlbSgxKSEucXVlcnlTZWxlY3RvcignLmJsb2ItY29kZS1pbm5lcicpISwgcGFyc2VJbnQoc3RhcnRSZXZpc2lvbkxpbmUpLCB0aGlzLnN0YXJ0VG9rZW5TZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVuZFJldmlzaW9uTGluZSA9IHJvdy5jaGlsZHJlbi5pdGVtKDIpIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGluZS1udW1iZXInKTtcbiAgICAgICAgY29uc29sZS5sb2coZW5kUmV2aXNpb25MaW5lKTtcbiAgICAgICAgaWYgKGVuZFJldmlzaW9uTGluZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJvdy5jaGlsZHJlbi5pdGVtKDMpIS5xdWVyeVNlbGVjdG9yKCcuYmxvYi1jb2RlLWlubmVyJykhKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmVuZFRva2VuU2V0KTtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NWaWV3KHJvdy5jaGlsZHJlbi5pdGVtKDMpIS5xdWVyeVNlbGVjdG9yKCcuYmxvYi1jb2RlLWlubmVyJykhLCBwYXJzZUludChlbmRSZXZpc2lvbkxpbmUpLCB0aGlzLmVuZFRva2VuU2V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9