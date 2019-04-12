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
/* harmony import */ var _lib_highlighter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/_highlighter */ "./src/ts/lib/_highlighter.ts");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    install();
    sendResponse(null);
    return true;
});
function install() {
    console.log('[Codelab] Detect github.');
    var permalink = document.querySelector('.js-permalink-shortcut');
    var urlTokens = permalink.getAttribute('href').split('/');
    var repoName = urlTokens[1] + "/" + urlTokens[2];
    var revision = urlTokens[4];
    var file = urlTokens.slice(5).join('/');
    console.log("[Codelab] repo: " + repoName + ", revision: " + revision + ", file: " + file);
    var baseUrl = window.location.href.split('/').slice(3, 7).join('/');
    var selectedNodeId = new URLSearchParams(window.location.search).get('p');
    if (!file.endsWith('.java')) {
        console.log('[Codelab] Do nothing. This is not a java file.');
        return;
    }
    console.log("[Codelab] Fetch data from " + "http://localhost:9000");
    chrome.runtime.sendMessage({ repoName: repoName, revision: revision, file: file }, function (resp) {
        if (resp.data.success) {
            console.log('[Codelab] Fetched data successfully ', resp);
            var usages = resp.data.usages;
            var defs = resp.data.definitions;
            var tokens_1 = [];
            usages.forEach(function (u) { return tokens_1.push(u); });
            defs.forEach(function (d) { return tokens_1.push(d); });
            new _lib_highlighter__WEBPACK_IMPORTED_MODULE_0__["Highlighter"]({
                repoName: repoName,
                revision: revision,
                baseUrl: baseUrl,
                selectedNodeId: selectedNodeId,
                unsortedTokens: tokens_1
            }).run();
        }
        else {
            console.log('[Codelab] Failed to fetch data.', resp);
        }
    });
}
install();


/***/ }),

/***/ "./src/ts/lib/_highlighter.ts":
/*!************************************!*\
  !*** ./src/ts/lib/_highlighter.ts ***!
  \************************************/
/*! exports provided: Highlighter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Highlighter", function() { return Highlighter; });
var Highlighter = /** @class */ (function () {
    function Highlighter(options) {
        this.tokenIndex = 0;
        this.col = 1;
        this.highlightedLines = new Set();
        this.repoName = options.repoName;
        this.revision = options.revision;
        this.baseUrl = options.baseUrl;
        this.selectedNodeId = options.selectedNodeId;
        this.tokens = options.unsortedTokens
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
        this.line = this.tokens[this.tokenIndex].location.start.line;
    }
    Highlighter.prototype.makeUrl = function (token) {
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
                    return "/" + this.baseUrl + "/" + usage.definition.location.path + "?p=" + usage.definition.nodeId + "#L" + usage.definition.location.start.line;
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
    Highlighter.getRelevantNodeId = function (token) {
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
    Highlighter.prototype.modify = function (elem) {
        var _this = this;
        var s = elem.nodeValue;
        var elemStart = this.col;
        var elemEnd = this.col + s.length - 1;
        var relevantTokens = [];
        while (this.tokenIndex < this.tokens.length &&
            this.tokens[this.tokenIndex].location.start.line == this.line &&
            this.tokens[this.tokenIndex].location.start.col >= elemStart &&
            this.tokens[this.tokenIndex].location.start.col <= elemEnd) {
            relevantTokens.push(this.tokens[this.tokenIndex]);
            this.tokenIndex++;
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
            if (_this.selectedNodeId && _this.selectedNodeId == Highlighter.getRelevantNodeId(token)) {
                anchor.classList.add('codelab-highlighted');
                _this.highlightedLines.add(_this.line);
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
    Highlighter.prototype.runUsageIndex = function () {
        while (this.tokenIndex < this.tokens.length &&
            (this.tokens[this.tokenIndex].location.start.line < this.line ||
                (this.tokens[this.tokenIndex].location.start.line == this.line && this.tokens[this.tokenIndex].location.start.col < this.col))) {
            this.tokenIndex++;
        }
    };
    Highlighter.prototype.walk = function (elem) {
        this.runUsageIndex();
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
    Highlighter.prototype.run = function () {
        if (this.tokens.length == 0) {
            return;
        }
        while (this.line <= this.tokens[this.tokens.length - 1].location.start.line) {
            this.col = 1;
            this.runUsageIndex();
            var lineElem = document.querySelector("#LC" + this.tokens[this.tokenIndex].location.start.line);
            this.walk(lineElem);
            this.line++;
        }
        this.highlightedLines.forEach(function (line) {
            var lineElem = document.querySelector("#LC" + line);
            lineElem.classList.add('highlighted');
        });
    };
    return Highlighter;
}());



/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2NvbnRlbnQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2xpYi9faGlnaGxpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2pGQTtBQUFBO0FBQStDO0FBSS9DLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDbEMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVk7SUFDNUIsT0FBTyxFQUFFLENBQUM7SUFDVixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkIsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDLENBQ0YsQ0FBQztBQUVGLFNBQVMsT0FBTztJQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUV4QyxJQUFJLFNB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O2lCQUNyQzthQUNGO1lBRUQsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFHRCx5QkFBRyxHQUFIO1FBQ0UsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFeEMsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDNUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxLQUFLLENBQUMsSUFBTSxDQUFFLENBQUM7WUFDbEcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDYjtRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1lBQ2pDLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBTSxJQUFNLENBQUUsQ0FBQztZQUNyRCxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxrQkFBQztBQUFELENBQUMiLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3RzL2NvbnRlbnQudHNcIik7XG4iLCJpbXBvcnQge0RlZmluaXRpb24sIFVzYWdlLCBUb2tlbn0gZnJvbSBcIi4vbGliL19tb2RlbFwiO1xuaW1wb3J0IHtIaWdobGlnaHRlcn0gZnJvbSBcIi4vbGliL19oaWdobGlnaHRlclwiO1xuXG5kZWNsYXJlIGxldCBfX0hPU1RfXzogc3RyaW5nO1xuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gIChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGluc3RhbGwoKTtcbiAgICBzZW5kUmVzcG9uc2UobnVsbCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIGluc3RhbGwoKTogdm9pZCB7XG4gIGNvbnNvbGUubG9nKCdbQ29kZWxhYl0gRGV0ZWN0IGdpdGh1Yi4nKTtcblxuICBsZXQgcGVybWFsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXBlcm1hbGluay1zaG9ydGN1dCcpITtcbiAgbGV0IHVybFRva2VucyA9IHBlcm1hbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSEuc3BsaXQoJy8nKTtcblxuICBsZXQgcmVwb05hbWUgPSBgJHt1cmxUb2tlbnNbMV19LyR7dXJsVG9rZW5zWzJdfWA7XG4gIGxldCByZXZpc2lvbiA9IHVybFRva2Vuc1s0XTtcbiAgbGV0IGZpbGUgPSB1cmxUb2tlbnMuc2xpY2UoNSkuam9pbignLycpO1xuXG4gIGNvbnNvbGUubG9nKGBbQ29kZWxhYl0gcmVwbzogJHtyZXBvTmFtZX0sIHJldmlzaW9uOiAke3JldmlzaW9ufSwgZmlsZTogJHtmaWxlfWApO1xuXG4gIGxldCBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJy8nKS5zbGljZSgzLCA3KS5qb2luKCcvJyk7XG5cbiAgbGV0IHNlbGVjdGVkTm9kZUlkID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3AnKTtcblxuICBpZiAoIWZpbGUuZW5kc1dpdGgoJy5qYXZhJykpIHtcbiAgICBjb25zb2xlLmxvZygnW0NvZGVsYWJdIERvIG5vdGhpbmcuIFRoaXMgaXMgbm90IGEgamF2YSBmaWxlLicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKGBbQ29kZWxhYl0gRmV0Y2ggZGF0YSBmcm9tICR7X19IT1NUX199YCk7XG4gIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxuICAgIHtyZXBvTmFtZTogcmVwb05hbWUsIHJldmlzaW9uOiByZXZpc2lvbiwgZmlsZTogZmlsZX0sXG4gICAgKHJlc3ApID0+IHtcbiAgICAgIGlmIChyZXNwLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICBjb25zb2xlLmxvZygnW0NvZGVsYWJdIEZldGNoZWQgZGF0YSBzdWNjZXNzZnVsbHkgJywgcmVzcCk7XG4gICAgICAgIGxldCB1c2FnZXMgPSByZXNwLmRhdGEudXNhZ2VzIGFzIFVzYWdlW107XG4gICAgICAgIGxldCBkZWZzID0gcmVzcC5kYXRhLmRlZmluaXRpb25zIGFzIERlZmluaXRpb25bXTtcbiAgICAgICAgbGV0IHRva2VuczogVG9rZW5bXSA9IFtdO1xuXG4gICAgICAgIHVzYWdlcy5mb3JFYWNoKCh1KSA9PiB0b2tlbnMucHVzaCh1KSk7XG4gICAgICAgIGRlZnMuZm9yRWFjaCgoZCkgPT4gdG9rZW5zLnB1c2goZCkpO1xuXG4gICAgICAgIG5ldyBIaWdobGlnaHRlcih7XG4gICAgICAgICAgcmVwb05hbWU6IHJlcG9OYW1lLFxuICAgICAgICAgIHJldmlzaW9uOiByZXZpc2lvbixcbiAgICAgICAgICBiYXNlVXJsOiBiYXNlVXJsLFxuICAgICAgICAgIHNlbGVjdGVkTm9kZUlkOiBzZWxlY3RlZE5vZGVJZCxcbiAgICAgICAgICB1bnNvcnRlZFRva2VuczogdG9rZW5zXG4gICAgICAgIH0pLnJ1bigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tDb2RlbGFiXSBGYWlsZWQgdG8gZmV0Y2ggZGF0YS4nLCByZXNwKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59XG5cblxuaW5zdGFsbCgpO1xuIiwiaW1wb3J0IHtEZWZpbml0aW9uLCBUb2tlbiwgVXNhZ2V9IGZyb20gXCIuL19tb2RlbFwiO1xuXG5leHBvcnQgY2xhc3MgSGlnaGxpZ2h0ZXIge1xuICByZXBvTmFtZTogc3RyaW5nO1xuICByZXZpc2lvbjogc3RyaW5nO1xuICBiYXNlVXJsOiBzdHJpbmc7XG4gIHRva2VuczogVG9rZW5bXTtcbiAgbGluZTogbnVtYmVyO1xuICBzZWxlY3RlZE5vZGVJZDogc3RyaW5nIHwgbnVsbDtcblxuICB0b2tlbkluZGV4OiBudW1iZXIgPSAwO1xuICBjb2w6IG51bWJlciA9IDE7XG4gIGhpZ2hsaWdodGVkTGluZXM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHJlcG9OYW1lOiBzdHJpbmc7XG4gICAgICByZXZpc2lvbjogc3RyaW5nO1xuICAgICAgYmFzZVVybDogc3RyaW5nO1xuICAgICAgc2VsZWN0ZWROb2RlSWQ6IHN0cmluZyB8IG51bGw7XG4gICAgICB1bnNvcnRlZFRva2VuczogVG9rZW5bXTtcbiAgICB9XG4gICkge1xuICAgIHRoaXMucmVwb05hbWUgPSBvcHRpb25zLnJlcG9OYW1lO1xuICAgIHRoaXMucmV2aXNpb24gPSBvcHRpb25zLnJldmlzaW9uO1xuICAgIHRoaXMuYmFzZVVybCA9IG9wdGlvbnMuYmFzZVVybDtcbiAgICB0aGlzLnNlbGVjdGVkTm9kZUlkID0gb3B0aW9ucy5zZWxlY3RlZE5vZGVJZDtcbiAgICB0aGlzLnRva2VucyA9IG9wdGlvbnMudW5zb3J0ZWRUb2tlbnNcbiAgICAgIC5maWx0ZXIoKGEpID0+ICEhYS5sb2NhdGlvbilcbiAgICAgIC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGlmICghYS5sb2NhdGlvbikgeyByZXR1cm4gLTE7IH1cbiAgICAgICAgaWYgKCFiLmxvY2F0aW9uKSB7IHJldHVybiAxOyB9XG5cbiAgICAgICAgaWYgKGEubG9jYXRpb24uc3RhcnQubGluZSA8IGIubG9jYXRpb24uc3RhcnQubGluZSkgeyByZXR1cm4gLTI7IH1cbiAgICAgICAgZWxzZSBpZiAoYS5sb2NhdGlvbi5zdGFydC5saW5lID4gYi5sb2NhdGlvbi5zdGFydC5saW5lKSB7IHJldHVybiAyOyB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChhLmxvY2F0aW9uLnN0YXJ0LmNvbCA8IGIubG9jYXRpb24uc3RhcnQuY29sKSB7IHJldHVybiAtMTsgfVxuICAgICAgICAgIGVsc2UgaWYgKGEubG9jYXRpb24uc3RhcnQuY29sID4gYi5sb2NhdGlvbi5zdGFydC5jb2wpIHsgcmV0dXJuIDE7IH1cbiAgICAgICAgICBlbHNlIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLmxpbmUgPSB0aGlzLnRva2Vuc1t0aGlzLnRva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5saW5lO1xuICB9XG5cbiAgbWFrZVVybCh0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgY2FzZSBcInVzYWdlXCI6XG4gICAgICAgIGxldCB1c2FnZSA9IHRva2VuIGFzIFVzYWdlO1xuICAgICAgICBpZiAoIXVzYWdlLmRlZmluaXRpb24gfHwgIXVzYWdlLmRlZmluaXRpb24ubG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gJ2phdmFzY3JpcHQ6cmV0dXJuIGZhbHNlOyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXNhZ2UuZGVmaW5pdGlvbi5tb2R1bGUgPT0gJ0pkaycpIHtcbiAgICAgICAgICByZXR1cm4gYGh0dHA6Ly9sb2NhbGhvc3Q6OTAwMC9naXRodWIvJHt0aGlzLnJlcG9OYW1lfS8ke3RoaXMucmV2aXNpb259L2pkay8ke3VzYWdlLmRlZmluaXRpb24ubG9jYXRpb24ucGF0aH0/cD0ke3VzYWdlLmRlZmluaXRpb24ubm9kZUlkfWA7XG4gICAgICAgIH0gZWxzZSBpZiAodXNhZ2UuZGVmaW5pdGlvbi5tb2R1bGUgPT0gJ0phcicpIHtcbiAgICAgICAgICByZXR1cm4gYGh0dHA6Ly9sb2NhbGhvc3Q6OTAwMC9naXRodWIvJHt0aGlzLnJlcG9OYW1lfS8ke3RoaXMucmV2aXNpb259L2phci8ke3VzYWdlLmRlZmluaXRpb24uamFySWR9LyR7dXNhZ2UuZGVmaW5pdGlvbi5sb2NhdGlvbi5wYXRofT9wPSR7dXNhZ2UuZGVmaW5pdGlvbi5ub2RlSWR9YDtcbiAgICAgICAgfSBlbHNlIGlmICh1c2FnZS5kZWZpbml0aW9uLm1vZHVsZSA9PSAnVXNlcicpIHtcbiAgICAgICAgICByZXR1cm4gYC8ke3RoaXMuYmFzZVVybH0vJHt1c2FnZS5kZWZpbml0aW9uLmxvY2F0aW9uLnBhdGh9P3A9JHt1c2FnZS5kZWZpbml0aW9uLm5vZGVJZH0jTCR7dXNhZ2UuZGVmaW5pdGlvbi5sb2NhdGlvbi5zdGFydC5saW5lfWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgYFVucmVjb2duaXplZCBtb2R1bGUgJHt1c2FnZS5kZWZpbml0aW9uLm1vZHVsZX1gO1xuICAgICAgICB9XG4gICAgICBjYXNlIFwiZGVmaW5pdGlvblwiOlxuICAgICAgICBsZXQgZGVmaW5pdGlvbiA9IHRva2VuIGFzIERlZmluaXRpb247XG5cbiAgICAgICAgaWYgKCFkZWZpbml0aW9uLmxvY2F0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuICdqYXZhc2NyaXB0OnJldHVybiBmYWxzZTsnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OjkwMDAvZ2l0aHViLyR7dGhpcy5yZXBvTmFtZX0vJHt0aGlzLnJldmlzaW9ufS91c2FnZS8ke2RlZmluaXRpb24ubm9kZUlkfWA7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IGBVbnJlY29nbml6ZWQgdG9rZW4gdHlwZSAke3Rva2VuLnR5cGV9YDtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0UmVsZXZhbnROb2RlSWQodG9rZW46IFRva2VuKTogc3RyaW5nIHtcbiAgICBsZXQgbm9kZUlkOiBzdHJpbmcgPSAnJztcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJ1c2FnZVwiOlxuICAgICAgICBub2RlSWQgPSAodG9rZW4gYXMgVXNhZ2UpLmRlZmluaXRpb24ubm9kZUlkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJkZWZpbml0aW9uXCI6XG4gICAgICAgIG5vZGVJZCA9ICh0b2tlbiBhcyBEZWZpbml0aW9uKS5ub2RlSWQ7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZUlkO1xuICB9XG5cbiAgcHJpdmF0ZSBtb2RpZnkoZWxlbTogTm9kZSk6IE5vZGVbXSB8IG51bGwge1xuICAgIGxldCBzID0gZWxlbS5ub2RlVmFsdWUhO1xuICAgIGxldCBlbGVtU3RhcnQgPSB0aGlzLmNvbDtcbiAgICBsZXQgZWxlbUVuZCA9IHRoaXMuY29sICsgcy5sZW5ndGggLSAxO1xuXG4gICAgbGV0IHJlbGV2YW50VG9rZW5zID0gW107XG5cbiAgICB3aGlsZSAoXG4gICAgICB0aGlzLnRva2VuSW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGggJiZcbiAgICAgIHRoaXMudG9rZW5zW3RoaXMudG9rZW5JbmRleF0ubG9jYXRpb24hLnN0YXJ0LmxpbmUgPT0gdGhpcy5saW5lICYmXG4gICAgICB0aGlzLnRva2Vuc1t0aGlzLnRva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5jb2wgPj0gZWxlbVN0YXJ0ICYmXG4gICAgICB0aGlzLnRva2Vuc1t0aGlzLnRva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5jb2wgPD0gZWxlbUVuZFxuICAgICAgKSB7XG4gICAgICByZWxldmFudFRva2Vucy5wdXNoKHRoaXMudG9rZW5zW3RoaXMudG9rZW5JbmRleF0pO1xuICAgICAgdGhpcy50b2tlbkluZGV4Kys7XG4gICAgfVxuXG4gICAgaWYgKCFyZWxldmFudFRva2VucykgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgbGV0IG5vZGVzID0gW107XG4gICAgbGV0IHN0YXJ0ID0gMDtcblxuICAgIHJlbGV2YW50VG9rZW5zLmZvckVhY2goKHRva2VuKSA9PiB7XG4gICAgICBsZXQgdFN0YXJ0ID0gdG9rZW4ubG9jYXRpb24hLnN0YXJ0LmNvbCAtIHRoaXMuY29sO1xuICAgICAgbGV0IHRFbmQgPSB0b2tlbi5sb2NhdGlvbiEuZW5kLmNvbCAtIHRoaXMuY29sO1xuXG4gICAgICBpZiAoc3RhcnQgPiB0U3RhcnQpIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmICh0U3RhcnQgPiAwKSB7XG4gICAgICAgIG5vZGVzLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocy5zdWJzdHJpbmcoc3RhcnQsIHRTdGFydCkpKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGFuY2hvci5ocmVmID0gdGhpcy5tYWtlVXJsKHRva2VuKTtcbiAgICAgIGFuY2hvci5jbGFzc0xpc3QuYWRkKCdjb2RlbGFiLWxpbmsnKTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZUlkICYmIHRoaXMuc2VsZWN0ZWROb2RlSWQgPT0gSGlnaGxpZ2h0ZXIuZ2V0UmVsZXZhbnROb2RlSWQodG9rZW4pKSB7XG4gICAgICAgIGFuY2hvci5jbGFzc0xpc3QuYWRkKCdjb2RlbGFiLWhpZ2hsaWdodGVkJyk7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWRMaW5lcy5hZGQodGhpcy5saW5lKTtcbiAgICAgIH1cbiAgICAgIGFuY2hvci50ZXh0ID0gcy5zdWJzdHJpbmcodFN0YXJ0LCB0RW5kICsgMSk7XG4gICAgICBub2Rlcy5wdXNoKGFuY2hvcik7XG5cbiAgICAgIHN0YXJ0ID0gdEVuZCArIDE7XG4gICAgfSk7XG5cbiAgICBpZiAoc3RhcnQgPD0gKHMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIG5vZGVzLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocy5zdWJzdHJpbmcoc3RhcnQpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBydW5Vc2FnZUluZGV4KCk6IHZvaWQge1xuICAgIHdoaWxlIChcbiAgICAgIHRoaXMudG9rZW5JbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAmJlxuICAgICAgKFxuICAgICAgICB0aGlzLnRva2Vuc1t0aGlzLnRva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5saW5lIDwgdGhpcy5saW5lIHx8XG4gICAgICAgICh0aGlzLnRva2Vuc1t0aGlzLnRva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5saW5lID09IHRoaXMubGluZSAmJiB0aGlzLnRva2Vuc1t0aGlzLnRva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5jb2wgPCB0aGlzLmNvbClcbiAgICAgIClcbiAgICApIHtcbiAgICAgIHRoaXMudG9rZW5JbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgd2FsayhlbGVtOiBOb2RlKTogTm9kZVtdIHwgbnVsbCB7XG4gICAgdGhpcy5ydW5Vc2FnZUluZGV4KCk7XG5cbiAgICBpZiAoZWxlbS5ub2RlVHlwZSA9PSBOb2RlLlRFWFRfTk9ERSkge1xuICAgICAgbGV0IHNpemUgPSBlbGVtLm5vZGVWYWx1ZSEubGVuZ3RoO1xuICAgICAgbGV0IG5ld0NoaWxkcmVuID0gdGhpcy5tb2RpZnkoZWxlbSk7XG4gICAgICB0aGlzLmNvbCArPSBzaXplO1xuXG4gICAgICByZXR1cm4gbmV3Q2hpbGRyZW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBjaGlsZE5vZGVzOiBDaGlsZE5vZGVbXSA9IFtdO1xuICAgICAgZWxlbS5jaGlsZE5vZGVzLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZE5vZGVzLnB1c2goY2hpbGQpKTtcblxuICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGROb2Rlcykge1xuICAgICAgICBsZXQgbmV3Q2hpbGROb2RlcyA9IHRoaXMud2FsayhjaGlsZCk7XG4gICAgICAgIGlmIChuZXdDaGlsZE5vZGVzKSB7XG4gICAgICAgICAgY2hpbGQucmVwbGFjZVdpdGgoLi4ubmV3Q2hpbGROb2Rlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cblxuICBydW4oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudG9rZW5zLmxlbmd0aCA9PSAwKSB7IHJldHVybjsgfVxuXG4gICAgd2hpbGUgKHRoaXMubGluZSA8PSB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXS5sb2NhdGlvbiEuc3RhcnQubGluZSkge1xuICAgICAgdGhpcy5jb2wgPSAxO1xuICAgICAgdGhpcy5ydW5Vc2FnZUluZGV4KCk7XG4gICAgICBsZXQgbGluZUVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjTEMke3RoaXMudG9rZW5zW3RoaXMudG9rZW5JbmRleF0ubG9jYXRpb24hLnN0YXJ0LmxpbmV9YCkhO1xuICAgICAgdGhpcy53YWxrKGxpbmVFbGVtKTtcbiAgICAgIHRoaXMubGluZSsrO1xuICAgIH1cblxuICAgIHRoaXMuaGlnaGxpZ2h0ZWRMaW5lcy5mb3JFYWNoKChsaW5lKSA9PiB7XG4gICAgICBsZXQgbGluZUVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjTEMke2xpbmV9YCkhO1xuICAgICAgbGluZUVsZW0uY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0ZWQnKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cbiJdLCJzb3VyY2VSb290IjoiIn0=