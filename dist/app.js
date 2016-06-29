/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	let buttons = { //bottons object
	    num_r: 0, //number of red buttons
	    num_b: 0, //number of blue buttons
	    now: 0, // index of button that will be killed
	    entity: [], //buttons array
	    checkNum(num) {
	        //check number whether has already show on button
	        for (let i = 0; i < this.entity.length; i++) {
	            if (num == this.entity[i].num) return true;
	        }
	    },
	    initiate(num) {
	        //初始化 array with num大小
	        for (let i = 0; i < num / 2; i++) {
	            this.entity.push({ num: 0, key: '', color: 'r' }); //一半紅色
	        }
	        for (let i = num / 2; i < num; i++) {
	            this.entity.push({ num: 0, key: '', color: 'b' }); //一半藍色
	        }
	    }

	};
	buttons.initiate(6); //initial 6個 紅三 藍三
	let questions = []; //題目
	let results = []; //結果
	function generate(color, times) {
	    //產生按鍵的ASCII CODE
	    let randomNum;
	    if (color == 1) {
	        //red
	        for (let i = 0; i < times; i++) {
	            do {
	                randomNum = Math.floor(Math.random() * 26 + 1);
	            } while (buttons.checkNum(randomNum)); //確認是否重複
	            buttons.entity[i].num = randomNum; //將button num&key 丟到buttons.entity裡
	            buttons.entity[i].key = String.fromCharCode(buttons.entity[i].num + 96);
	            questions.push(buttons.entity[i].key); //將產生的button push進 questions
	        }
	        buttons.num_r = buttons.num_r + times;
	    } else {
	        for (let i = 0; i < times; i++) {
	            do {
	                randomNum = Math.floor(Math.random() * 26 + 1);
	            } while (buttons.checkNum(randomNum));
	            buttons.entity[buttons.entity.length / 2 + i].num = randomNum;
	            buttons.entity[buttons.entity.length / 2 + i].key = String.fromCharCode(buttons.entity[buttons.entity.length / 2 + i].num + 96);
	            questions.push(buttons.entity[buttons.entity.length / 2 + i].key);
	        }
	        buttons.num_b = buttons.num_b + times;
	    }
	    console.log(questions);
	}
	$(document).ready(function () {
	    let showKey = color => {
	        //將被選到的buttons 加上style
	        if (color == 1) {
	            for (let i = 0; i < buttons.entity.length / 2; i++) $("#" + buttons.entity[i].key).removeClass("original").addClass("choose_r").text(i + 1);
	        } else {
	            for (let i = 0; i < buttons.entity.length / 2; i++) $('#' + buttons.entity[buttons.entity.length / 2 + i].key).removeClass("original").addClass("choose_b").text(i + 1);
	        }
	    };
	    let tap_handler = event => {
	        //tap callback
	        $('#' + buttons.entity[buttons.now].key).removeClass("choose_" + buttons.entity[buttons.now].color).addClass("original").text(""); //移除再buttons.entity[now]的style
	        if (buttons.entity[buttons.now].color == 'r') {
	            buttons.num_r = buttons.num_r - 1;
	            if (buttons.num_r == 1) {
	                //如果該顏色剩下一個 增加三個
	                generate(0, buttons.entity.length / 2);
	                showKey(0);
	            }
	        } else {
	            buttons.num_b = buttons.num_b - 1;
	            if (buttons.num_b == 1) {
	                generate(1, buttons.entity.length / 2);
	                showKey(1);
	            }
	        }
	        buttons.now++;
	        if (buttons.now == buttons.entity.length) //判斷 now 是否超過array大小  有的話設回0
	            buttons.now = 0;
	        let temp = {};
	        temp.key = $(event.target).attr('id'); //將tap的key值 跟 X Y 座標 存到temp object 並 push 到 results
	        temp.X = event.pageX;
	        temp.Y = event.pageY;
	        results.push(temp);
	        //console.log(event);
	        //console.log(results);
	    };
	    $('.original').on("tap", tap_handler); //將所有按鍵綁上 tap event
	    generate(1, buttons.entity.length / 2); //產生紅色按鈕
	    showKey(1);
	});

	// vi:et:sw=2:ts=2

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./node_modules/css-loader/index.js!./index.css", function() {
				var newContent = require("!!./node_modules/css-loader/index.js!./index.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, "body{\n    border:1px red solid;\n    margin:0;\n    height: 100vh;\n    width: 100vw;\n}\n\n#keyboard{\n    background-image: url(" + __webpack_require__(4) + ");\n    width:100vw;\n    height:60.79295vw;\n    position: absolute;\n    top:116.985vw;    \n}\n.original{\n    background-image: url(" + __webpack_require__(5) + ");\n}\n.choose_r{\n    background-color: #880000;\n}\n.choose_b{\n    background-color: #003377;\n}\n.btn {\n    width:8.5169vw;\n    height:13.9501vw;\n    position: absolute;\n\ttext-align:center;\n\tcolor:white;\n\tfont-size:7vw;\n\tline-height:13.9051vw;\n}\n\n.f-row{\n    top:0.99859vw;   \n}\n\n#q{\n    left:1.3482vw;\n}\n#w{\n    left:11.2133vw;\n}\n#e{\n    left:21.0784vw;\n}\n#r{\n    left:30.9435vw;\n}\n#t{\n    left:40.8086vw;\n}\n#y{\n    left:50.6737vw;\n}\n#u{\n    left:60.5388vw;\n}\n#i{\n    left:70.4039vw;\n}\n#o{\n    left:80.269vw;\n}\n#p{\n    left:90.1341vw;\n}\n\n.s-row{\n    top:15.94718vw;\n}\n#a{\n    left:6.28115vw;\n}\n#s{\n    left:16.14625vw;\n}\n#d{\n    left:26.01135vw;\n}\n#f{\n    left:35.87645vw;\n}\n#g{\n    left:45.74155vw;\n}\n#h{\n    left:55.60665vw;\n}\n#j{\n    left:65.47175vw;\n}\n#k{\n    left:75.33685vw;\n}\n#l{\n    left:85.20195vw;\n}\n\n\n.t-row{\n    top:30.89577vw;\n}\n\n#z{\n    left:16.14625vw;\n}\n#x{\n    left:26.01135vw;\n}\n#c{\n    left:35.87645vw;\n}\n#v{\n    left:45.74155vw;\n}\n#b{\n    left:55.60665vw;\n}\n#n{\n    left:65.47175vw;\n}\n#m{\n    left:75.33685vw;\n}\n\n#space{\n    top:45.84472vw;\n    left:35.87645vw;\n    width:38.1122vw;\n}\n\n/*vi:et:sw=2:ts=2*/\n", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqkAAAGeCAIAAAA40w8YAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABWJJREFUeNrs1UERACAIAEF1kP4xsYV/KrAb4T6369UCAMY4EgCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwB4vwQA4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8AeD8A4P0AgPcDAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8A3i8BAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAN4PAHg/AOD9AID3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDgPdLAADeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AID3A4D3AwDeDwB4PwDg/QCA9wMA3g8AeD8A4P0AgPcDAN4PAHg/AOD9AEATeVMFAJjjCzAAQmYGCBc8Cr4AAAAASUVORK5CYII="

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAABfCAIAAAA24EOWAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAIVJREFUeNrs14EJACAIAEGL9l+hNrUhisA4J5DjA2tzragzPUpNsXVHZlpXDHTp0qVLl+5vukFXu57aE11/Ne3SpUuXrgOSrgNSDHTp0qXra6lduu5dMdClS5cuXbp06TogxeCp0aVL90i31LrapUuXrhjo0qXra6ldunTp0hUD3VuzBRgAJzGNdkwaEFsAAAAASUVORK5CYII="

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ]);