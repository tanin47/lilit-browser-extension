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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ts/content-script.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ts/content-script.ts":
/*!**********************************!*\
  !*** ./src/ts/content-script.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

console.log('Detect github.com ' + window.location.href);
var permalink = document.querySelector('.js-permalink-shortcut');
var urlTokens = permalink.getAttribute('href').split('/');
var repoName = urlTokens[1] + "/" + urlTokens[2];
var revision = urlTokens[4];
var file = urlTokens.slice(5).join('/');
console.log(repoName, revision, file);
var baseUrl = window.location.href.split('/').slice(3, 7).join('/');
function makeUrl(token) {
    switch (token.type) {
        case "usage":
            var usage = token;
            if (!usage.definition || !usage.definition.location) {
                return 'javascript:return false;';
            }
            if (usage.definition.module == 'Jdk') {
                return "http://localhost:9000/github/" + repoName + "/" + revision + "/jdk/" + usage.definition.location.path + "?p=" + usage.definition.nodeId;
            }
            else if (usage.definition.module == 'Jar') {
                return "http://localhost:9000/github/" + repoName + "/" + revision + "/jar/" + usage.definition.jarId + "/" + usage.definition.location.path + "?p=" + usage.definition.nodeId;
            }
            else if (usage.definition.module == 'User') {
                return "/" + baseUrl + "/" + usage.definition.location.path + "#L" + usage.definition.location.start.line;
            }
            else {
                throw "Unrecognized module " + usage.definition.module;
            }
        case "definition":
            var definition = token;
            if (!definition.location) {
                return 'javascript:return false;';
            }
            return "http://localhost:9000/github/" + repoName + "/" + revision + "/usage/" + definition.nodeId;
        default:
            throw "Unrecognized token type " + token.type;
    }
}
function highlight(unsortedTokens) {
    if (unsortedTokens.length == 0) {
        return;
    }
    var tokens = unsortedTokens
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
    var tokenIndex = 0;
    var line = tokens[tokenIndex].location.start.line;
    var col = 1;
    function modify(elem, token) {
        var s = elem.nodeValue;
        var adjustedStart = token.location.start.col - col;
        var adjustedEnd = token.location.end.col - col;
        var nodes = [];
        if (adjustedStart > 0) {
            nodes.push(document.createTextNode(s.substring(0, adjustedStart)));
        }
        var anchor = document.createElement('a');
        anchor.href = makeUrl(token);
        anchor.text = s.substring(adjustedStart, adjustedEnd + 1);
        nodes.push(anchor);
        if ((adjustedEnd + 1) <= (s.length - 1)) {
            nodes.push(document.createTextNode(s.substring(adjustedEnd + 1)));
        }
        return nodes;
    }
    function runUsageIndex() {
        while (tokenIndex < tokens.length &&
            (tokens[tokenIndex].location.start.line < line ||
                (tokens[tokenIndex].location.start.line == line && tokens[tokenIndex].location.start.col < col))) {
            tokenIndex++;
        }
    }
    function walk(elem) {
        runUsageIndex();
        if (elem.nodeType == Node.TEXT_NODE) {
            var size = elem.nodeValue.length;
            var newChildren = null;
            if (tokens[tokenIndex].location.start.line == line &&
                tokens[tokenIndex].location.start.col >= col &&
                tokens[tokenIndex].location.start.col <= (col + size - 1)) {
                newChildren = modify(elem, tokens[tokenIndex]);
                tokenIndex++;
            }
            col += size;
            return newChildren;
        }
        else {
            var childNodes_2 = [];
            elem.childNodes.forEach(function (child) { return childNodes_2.push(child); });
            for (var _i = 0, childNodes_1 = childNodes_2; _i < childNodes_1.length; _i++) {
                var child = childNodes_1[_i];
                var newChildNodes = walk(child);
                if (newChildNodes) {
                    child.replaceWith.apply(child, newChildNodes);
                }
            }
            return null;
        }
    }
    console.log(tokens);
    while (line <= tokens[tokens.length - 1].location.start.line) {
        console.log(line);
        col = 1;
        runUsageIndex();
        var lineElem = document.querySelector("#LC" + tokens[tokenIndex].location.start.line);
        walk(lineElem);
        line++;
    }
}
chrome.runtime.sendMessage({ repoName: repoName, revision: revision, file: file }, function (resp) {
    var usages = resp.data.usages;
    var defs = resp.data.definitions;
    var tokens = [];
    usages.forEach(function (u) { return tokens.push(u); });
    defs.forEach(function (d) { return tokens.push(d); });
    highlight(tokens);
});


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RzL2NvbnRlbnQtc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2hGQSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFekQsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBRSxDQUFDO0FBQ2xFLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRTNELElBQUksUUFBUSxHQUFNLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBSSxTQUFTLENBQUMsQ0FBQyxDQUFHLENBQUM7QUFDakQsSUFB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QUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1IsYUFBYSxFQUFFLENBQUM7UUFDaEIsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFTLENBQUMsS0FBSyxDQUFDLElBQU0sQ0FBRSxDQUFDO1FBQ3hGLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNmLElBQUksRUFBRSxDQUFDO0tBQ1I7QUFFSCxDQUFDO0FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQ3hCLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsRUFDcEQsVUFBQyxJQUFJO0lBQ0gsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFpQixDQUFDO0lBQ3pDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBMkIsQ0FBQztJQUNqRCxJQUFJLE1BQU0sR0FBWSxFQUFFLENBQUM7SUFFekIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsSUFBSyxhQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFkLENBQWMsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLElBQUssYUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBZCxDQUFjLENBQUMsQ0FBQztJQUVwQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsQ0FBQyxDQUNGLENBQUMiLCJmaWxlIjoiY29udGVudC1zY3JpcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy90cy9jb250ZW50LXNjcmlwdC50c1wiKTtcbiIsImltcG9ydCB7RGVmaW5pdGlvbiwgVXNhZ2UsIFRva2VufSBmcm9tIFwiLi9saWIvX21vZGVsXCI7XG5cbmNvbnNvbGUubG9nKCdEZXRlY3QgZ2l0aHViLmNvbSAnICsgd2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG5sZXQgcGVybWFsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXBlcm1hbGluay1zaG9ydGN1dCcpITtcbmxldCB1cmxUb2tlbnMgPSBwZXJtYWxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJykhLnNwbGl0KCcvJyk7XG5cbmxldCByZXBvTmFtZSA9IGAke3VybFRva2Vuc1sxXX0vJHt1cmxUb2tlbnNbMl19YDtcbmxldCByZXZpc2lvbiA9IHVybFRva2Vuc1s0XTtcbmxldCBmaWxlID0gdXJsVG9rZW5zLnNsaWNlKDUpLmpvaW4oJy8nKTtcblxuY29uc29sZS5sb2cocmVwb05hbWUsIHJldmlzaW9uLCBmaWxlKTtcblxubGV0IGJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnLycpLnNsaWNlKDMsIDcpLmpvaW4oJy8nKTtcblxuXG5mdW5jdGlvbiBtYWtlVXJsKHRva2VuOiBUb2tlbikge1xuICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICBjYXNlIFwidXNhZ2VcIjpcbiAgICAgIGxldCB1c2FnZSA9IHRva2VuIGFzIFVzYWdlO1xuICAgICAgaWYgKCF1c2FnZS5kZWZpbml0aW9uIHx8ICF1c2FnZS5kZWZpbml0aW9uLmxvY2F0aW9uKSB7XG4gICAgICAgIHJldHVybiAnamF2YXNjcmlwdDpyZXR1cm4gZmFsc2U7JztcbiAgICAgIH1cblxuICAgICAgaWYgKHVzYWdlLmRlZmluaXRpb24ubW9kdWxlID09ICdKZGsnKSB7XG4gICAgICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDo5MDAwL2dpdGh1Yi8ke3JlcG9OYW1lfS8ke3JldmlzaW9ufS9qZGsvJHt1c2FnZS5kZWZpbml0aW9uLmxvY2F0aW9uLnBhdGh9P3A9JHt1c2FnZS5kZWZpbml0aW9uLm5vZGVJZH1gO1xuICAgICAgfSBlbHNlIGlmICh1c2FnZS5kZWZpbml0aW9uLm1vZHVsZSA9PSAnSmFyJykge1xuICAgICAgICByZXR1cm4gYGh0dHA6Ly9sb2NhbGhvc3Q6OTAwMC9naXRodWIvJHtyZXBvTmFtZX0vJHtyZXZpc2lvbn0vamFyLyR7dXNhZ2UuZGVmaW5pdGlvbi5qYXJJZH0vJHt1c2FnZS5kZWZpbml0aW9uLmxvY2F0aW9uLnBhdGh9P3A9JHt1c2FnZS5kZWZpbml0aW9uLm5vZGVJZH1gO1xuICAgICAgfSBlbHNlIGlmICh1c2FnZS5kZWZpbml0aW9uLm1vZHVsZSA9PSAnVXNlcicpIHtcbiAgICAgICAgcmV0dXJuIGAvJHtiYXNlVXJsfS8ke3VzYWdlLmRlZmluaXRpb24ubG9jYXRpb24ucGF0aH0jTCR7dXNhZ2UuZGVmaW5pdGlvbi5sb2NhdGlvbi5zdGFydC5saW5lfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBgVW5yZWNvZ25pemVkIG1vZHVsZSAke3VzYWdlLmRlZmluaXRpb24ubW9kdWxlfWA7XG4gICAgICB9XG4gICAgY2FzZSBcImRlZmluaXRpb25cIjpcbiAgICAgIGxldCBkZWZpbml0aW9uID0gdG9rZW4gYXMgRGVmaW5pdGlvbjtcblxuICAgICAgaWYgKCFkZWZpbml0aW9uLmxvY2F0aW9uKSB7XG4gICAgICAgIHJldHVybiAnamF2YXNjcmlwdDpyZXR1cm4gZmFsc2U7JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OjkwMDAvZ2l0aHViLyR7cmVwb05hbWV9LyR7cmV2aXNpb259L3VzYWdlLyR7ZGVmaW5pdGlvbi5ub2RlSWR9YDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBgVW5yZWNvZ25pemVkIHRva2VuIHR5cGUgJHt0b2tlbi50eXBlfWA7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlnaGxpZ2h0KHVuc29ydGVkVG9rZW5zOiBUb2tlbltdKSB7XG4gIGlmICh1bnNvcnRlZFRva2Vucy5sZW5ndGggPT0gMCkgeyByZXR1cm47IH1cblxuICBsZXQgdG9rZW5zID0gdW5zb3J0ZWRUb2tlbnNcbiAgICAuZmlsdGVyKChhKSA9PiAhIWEubG9jYXRpb24pXG4gICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmICghYS5sb2NhdGlvbikgeyByZXR1cm4gLTE7IH1cbiAgICAgIGlmICghYi5sb2NhdGlvbikgeyByZXR1cm4gMTsgfVxuXG4gICAgICBpZiAoYS5sb2NhdGlvbi5zdGFydC5saW5lIDwgYi5sb2NhdGlvbi5zdGFydC5saW5lKSB7IHJldHVybiAtMjsgfVxuICAgICAgZWxzZSBpZiAoYS5sb2NhdGlvbi5zdGFydC5saW5lID4gYi5sb2NhdGlvbi5zdGFydC5saW5lKSB7IHJldHVybiAyOyB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKGEubG9jYXRpb24uc3RhcnQuY29sIDwgYi5sb2NhdGlvbi5zdGFydC5jb2wpIHsgcmV0dXJuIC0xOyB9XG4gICAgICAgIGVsc2UgaWYgKGEubG9jYXRpb24uc3RhcnQuY29sID4gYi5sb2NhdGlvbi5zdGFydC5jb2wpIHsgcmV0dXJuIDE7IH1cbiAgICAgICAgZWxzZSB7IHJldHVybiAwOyB9XG4gICAgICB9XG4gICAgfSk7XG5cblxuICBsZXQgdG9rZW5JbmRleCA9IDA7XG4gIGxldCBsaW5lID0gdG9rZW5zW3Rva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5saW5lO1xuICBsZXQgY29sID0gMTtcblxuICBmdW5jdGlvbiBtb2RpZnkoZWxlbTogTm9kZSwgdG9rZW46IFRva2VuKTogTm9kZVtdIHtcbiAgICBsZXQgcyA9IGVsZW0ubm9kZVZhbHVlITtcbiAgICBsZXQgYWRqdXN0ZWRTdGFydCA9IHRva2VuLmxvY2F0aW9uIS5zdGFydC5jb2wgLSBjb2w7XG4gICAgbGV0IGFkanVzdGVkRW5kID0gdG9rZW4ubG9jYXRpb24hLmVuZC5jb2wgLSBjb2w7XG5cbiAgICBsZXQgbm9kZXMgPSBbXTtcblxuICAgIGlmIChhZGp1c3RlZFN0YXJ0ID4gMCkge1xuICAgICAgbm9kZXMucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzLnN1YnN0cmluZygwLCBhZGp1c3RlZFN0YXJ0KSkpO1xuICAgIH1cblxuICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYW5jaG9yLmhyZWYgPSBtYWtlVXJsKHRva2VuKTtcbiAgICBhbmNob3IudGV4dCA9IHMuc3Vic3RyaW5nKGFkanVzdGVkU3RhcnQsIGFkanVzdGVkRW5kICsgMSk7XG4gICAgbm9kZXMucHVzaChhbmNob3IpO1xuXG4gICAgaWYgKChhZGp1c3RlZEVuZCArIDEpIDw9IChzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBub2Rlcy5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHMuc3Vic3RyaW5nKGFkanVzdGVkRW5kICsgMSkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICBmdW5jdGlvbiBydW5Vc2FnZUluZGV4KCkge1xuICAgIHdoaWxlIChcbiAgICAgIHRva2VuSW5kZXggPCB0b2tlbnMubGVuZ3RoICYmXG4gICAgICAoXG4gICAgICAgIHRva2Vuc1t0b2tlbkluZGV4XS5sb2NhdGlvbiEuc3RhcnQubGluZSA8IGxpbmUgfHxcbiAgICAgICAgKHRva2Vuc1t0b2tlbkluZGV4XS5sb2NhdGlvbiEuc3RhcnQubGluZSA9PSBsaW5lICYmIHRva2Vuc1t0b2tlbkluZGV4XS5sb2NhdGlvbiEuc3RhcnQuY29sIDwgY29sKVxuICAgICAgKVxuICAgICkge1xuICAgICAgdG9rZW5JbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdhbGsoZWxlbTogTm9kZSk6IE5vZGVbXSB8IG51bGwge1xuICAgIHJ1blVzYWdlSW5kZXgoKTtcbiAgICBpZiAoZWxlbS5ub2RlVHlwZSA9PSBOb2RlLlRFWFRfTk9ERSkge1xuICAgICAgbGV0IHNpemUgPSBlbGVtLm5vZGVWYWx1ZSEubGVuZ3RoO1xuICAgICAgbGV0IG5ld0NoaWxkcmVuID0gbnVsbDtcblxuICAgICAgaWYgKFxuICAgICAgICB0b2tlbnNbdG9rZW5JbmRleF0ubG9jYXRpb24hLnN0YXJ0LmxpbmUgPT0gbGluZSAmJlxuICAgICAgICB0b2tlbnNbdG9rZW5JbmRleF0ubG9jYXRpb24hLnN0YXJ0LmNvbCA+PSBjb2wgJiZcbiAgICAgICAgdG9rZW5zW3Rva2VuSW5kZXhdLmxvY2F0aW9uIS5zdGFydC5jb2wgPD0gKGNvbCArIHNpemUgLSAxKVxuICAgICAgKSB7XG4gICAgICAgIG5ld0NoaWxkcmVuID0gbW9kaWZ5KGVsZW0sIHRva2Vuc1t0b2tlbkluZGV4XSk7XG4gICAgICAgIHRva2VuSW5kZXgrKztcbiAgICAgIH1cblxuICAgICAgY29sICs9IHNpemU7XG5cbiAgICAgIHJldHVybiBuZXdDaGlsZHJlbjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGNoaWxkTm9kZXM6IENoaWxkTm9kZVtdID0gW107XG4gICAgICBlbGVtLmNoaWxkTm9kZXMuZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkTm9kZXMucHVzaChjaGlsZCkpO1xuXG4gICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZE5vZGVzKSB7XG4gICAgICAgIGxldCBuZXdDaGlsZE5vZGVzID0gd2FsayhjaGlsZCk7XG4gICAgICAgIGlmIChuZXdDaGlsZE5vZGVzKSB7XG4gICAgICAgICAgY2hpbGQucmVwbGFjZVdpdGgoLi4ubmV3Q2hpbGROb2Rlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2codG9rZW5zKTtcblxuICB3aGlsZSAobGluZSA8PSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLmxvY2F0aW9uIS5zdGFydC5saW5lKSB7XG4gICAgY29uc29sZS5sb2cobGluZSk7XG4gICAgY29sID0gMTtcbiAgICBydW5Vc2FnZUluZGV4KCk7XG4gICAgbGV0IGxpbmVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI0xDJHt0b2tlbnNbdG9rZW5JbmRleF0ubG9jYXRpb24hLnN0YXJ0LmxpbmV9YCkhO1xuICAgIHdhbGsobGluZUVsZW0pO1xuICAgIGxpbmUrKztcbiAgfVxuXG59XG5cbmNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxuICB7cmVwb05hbWU6IHJlcG9OYW1lLCByZXZpc2lvbjogcmV2aXNpb24sIGZpbGU6IGZpbGV9LFxuICAocmVzcCkgPT4ge1xuICAgIGxldCB1c2FnZXMgPSByZXNwLmRhdGEudXNhZ2VzIGFzIFVzYWdlW107XG4gICAgbGV0IGRlZnMgPSByZXNwLmRhdGEuZGVmaW5pdGlvbnMgYXMgRGVmaW5pdGlvbltdO1xuICAgIGxldCB0b2tlbnM6IFRva2VuW10gPSBbXTtcblxuICAgIHVzYWdlcy5mb3JFYWNoKCh1KSA9PiB0b2tlbnMucHVzaCh1KSk7XG4gICAgZGVmcy5mb3JFYWNoKChkKSA9PiB0b2tlbnMucHVzaChkKSk7XG5cbiAgICBoaWdobGlnaHQodG9rZW5zKTtcbiAgfVxuKTtcblxuIl0sInNvdXJjZVJvb3QiOiIifQ==