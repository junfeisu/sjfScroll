(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SjfScroll = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.sjfScroll = factory();
})(typeof window != 'undefined' ? window : undefined, function () {
  'use strict';
  /*
   * This is the options for sjf-scroll
   * @param delay is the time to deal the mouse events on the scroll-wrapper
   * @param gradient is the The unit of progress for wheel or keydown events
   * @param minHeight is min height of .sjf-scroll-content
   */

  var options = {
    delay: 500,
    gradient: 10,
    minHeight: 30
  };

  var scrollCallBack = null;

  /*
   * This is the param for sjf-scroll postion 
   * @param cTop is the top of sjf-scroll-content
   * @param oTop is the top of sjf-scroll-body
   * @param oldClientY is the old position of sjf-scroll move event
   */
  var currentPosition = {};

  /*
   * Determine obj is an object or not
   */
  function isObject(obj) {
    var result = true;
    Object.prototype.toString.call(obj) === '[object Object]' ? '' : result = false;
    return result;
  }

  /*
   * To get the dom for The corresponding event
   */
  function getRelativeEle(obj) {
    return {
      body: obj.querySelector('.sjf-scroll-body'),
      bg: obj.querySelector('.sjf-scroll-bg'),
      content: obj.querySelector('.sjf-scroll-content'),
      self: obj
    };
  }
  /*
   * to get the height of the Specific dom
   */
  function getRelativeHeight(obj) {
    return {
      bodyHeight: obj.querySelector('.sjf-scroll-body').offsetHeight,
      bgHeight: obj.querySelector('.sjf-scroll-bg').offsetHeight,
      contentHeight: obj.querySelector('.sjf-scroll-content').offsetHeight,
      selfHeight: obj.offsetHeight
    };
  }

  /*
   * 去抖函数
   */
  function debounce(action) {
    var last;
    return function () {
      var ctx = this,
          args = arguments;
      clearTimeout(last);
      last = setTimeout(function () {
        action.apply(ctx, args);
      }, options.delay);
    };
  }

  /*
   * watch the object
   * @param obj is the object to be watched
   */
  function watchOptions(obj) {
    if (!isObject(obj)) {
      console.warn('sjf-scroll:[warn] the param is not a object');
    } else {
      observe(obj);
    }
  }

  function observe(obj) {
    Object.keys(obj).forEach(function (key, index) {
      var val = obj[key];
      Object.defineProperty(obj, key, {
        get: function get() {
          return val;
        },
        set: function (newValue) {
          obj.key = newValue;
        }.bind(this)
      });
      // For depth monitoring on object properties
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        observe(obj[key]);
      }
    }, this);
  }

  /*
   * deal the options for sjf-scroll
   */
  function dealOptions(val) {
    console.log('the new val is ' + val);
  }

  /* 
   * The interface for users to set options
   */
  function setOptions(option) {
    if (!isObject(option)) {
      console.error('sjf-scroll:[error] options must be a object but ' + JSON.stringify(option) + ' is not a object');
      return;
    }
    for (var prop in option) {
      options.hasOwnProperty(prop) ? options[prop] = option[prop] : console.warn('sjf-scroll:[warn] sjf-scroll do not support the configuration item of ' + prop);
    }
  }

  /*
   * get the living example entrance of sjf-scroll
   */
  function getMaxHeight() {
    var scrolls = document.querySelectorAll('[sjf-scroll]');
    if (scrolls.length !== 0) {
      Array.prototype.forEach.call(scrolls, function (value) {
        var maxHeight = value.getAttribute('max-height');
        maxHeight !== null ? +maxHeight < 150 ? console.warn('sjf-scroll:[warn] the value of max-height best is >= 150') : '' : maxHeight = 150;
        rewriteDom(value, maxHeight);
      });
    } else {
      console.error('At least need a .sjf-scroll in your dom for example:' + '<div class="sjf-scroll"></div>');
    }
  }

  /*
   * rewrite the DOM structure of sjf-scroll
   */
  function rewriteDom(obj, maxHeight) {
    var initHtml = obj.innerHTML;
    var clonedObj = obj.cloneNode(true);
    obj.parentElement.insertBefore(clonedObj, obj);
    obj.classList.add('hide-old');
    initHtml = '<div class="sjf-scroll-wrapper"><div class="sjf-scroll-body">' + initHtml + '</div><div class="sjf-scroll-bg"><span class="sjf-scroll-content"></span></div></div>';
    clonedObj.innerHTML = initHtml;
    setHeight(clonedObj, maxHeight);
    addMutationObserver(obj, maxHeight);
  }

  /*
   * to set the height of scroll
   */
  function setHeight(obj, maxHeight) {
    var wrapper = obj.querySelector('.sjf-scroll-wrapper');
    var bg = obj.querySelector('.sjf-scroll-bg');
    var content = obj.querySelector('.sjf-scroll-content');
    var body = obj.querySelector('.sjf-scroll-body');
    var offsetHeight = body.offsetHeight || body.clientHeight;

    if (offsetHeight > maxHeight) {
      bg.style.display = 'block';
      bindEvent(obj);
    } else {
      bg.style.display = 'none';
      cancelBindEvent(obj);
    }
    wrapper.style.height = maxHeight + 'px';
    bg.style.height = maxHeight + 'px';
    var prevHeight = maxHeight * maxHeight / offsetHeight;
    prevHeight = prevHeight > options.minHeight ? prevHeight : options.minHeight;
    content.style.height = prevHeight + 'px';
  }

  /*
   * to watch the change of dom structure of hide-old
   * @oldObj is the dom which is to be watched
   */
  function addMutationObserver(oldObj, maxHeight) {
    var MutationObserver = window.MutationObserver || window.WebkitMutationObserver || window.MozMutationObserver;

    var mutationObserverConfig = {
      childList: true,
      subtree: true
    };

    var observer = new MutationObserver(function (mutationRecord) {
      keepAway(oldObj, maxHeight);
    });

    observer.observe(oldObj, mutationObserverConfig);
  }

  /*
   * to bind the relative event on the sjf-scroll
   */
  function bindEvent(obj) {
    var wrapper = obj.querySelector('.sjf-scroll-wrapper');
    var bg = obj.querySelector('.sjf-scroll-bg');
    var content = obj.querySelector('.sjf-scroll-content');
    var isFirst = true;

    wrapper.onmouseover = function (event) {
      if (isFirst) {
        var position = this.getAttribute('position');
        position !== null ? currentPosition = JSON.parse(this.getAttribute('position')) : currentPosition = { cTop: 0, oTop: 0, oldClientY: 0 };
        isFirst = false;
      }
      var newEvent = event || window.event;
      debounce(function () {
        operate.wheel(obj, newEvent);
        operate.keydown(obj, newEvent);
      })();
      this.onmouseleave = function () {
        this.setAttribute('position', JSON.stringify(currentPosition));
        isFirst = true;
      };
    };

    bg.onclick = function (event) {
      operate.click(obj, event);
    };

    content.onclick = function (event) {
      var newEvent = event || window.event;
      newEvent.stopPropagation ? newEvent.stopPropagation() : window.cancelBubble = false;
      return false;
    };

    content.onmousedown = function (event) {
      operate.down(obj, event);
    };
  }

  /*
   * cancel the event bind on the sjf-scroll
   */
  function cancelBindEvent(obj) {
    var wrapper = obj.querySelector('.sjf-scroll-wrapper');
    var bg = obj.querySelector('.sjf-scroll-bg');
    var content = obj.querySelector('.sjf-scroll-content');

    wrapper.onmouseover = null;
    bg.onclick = null;
    content.onclick = null;
    content.onmousedown = null;
    obj.onmousewheel = null;
    obj.removeEventListener('DOMMouseScroll', function (ev) {
      changeLocation(relative, ev, true);
    }, false);
  }

  /*
   * keep the html structure of old away with the html strcture of new 
   */
  function keepAway(obj, maxHeight) {
    var newObj = obj.previousElementSibling;
    var sjfScrollBody = newObj.querySelector('.sjf-scroll-body');
    sjfScrollBody.innerHTML = obj.innerHTML;
    setHeight(newObj, maxHeight);
  }

  /*
   * This is to deal the scroll move 
   * @param relative is a object of the assembly of element which is relatived to the scroll event
   */
  function scroll(relative, event) {
    var newEvent = event || window.event;
    var heightList = getRelativeHeight(relative.self);
    var len = newEvent.clientY - currentPosition.oldClientY;

    len = moveBoundary(len, heightList);

    currentPosition.cTop += len;
    currentPosition.oTop -= len * (heightList.bodyHeight / heightList.selfHeight);
    relative.content.style.top = currentPosition.cTop + 'px';
    relative.body.style.top = currentPosition.oTop + 'px';

    currentPosition.oldClientY = newEvent.clientY;
  }

  /*
   * check is to reach the boundary of drag event
   */
  function moveBoundary(len, list) {
    if (len <= -currentPosition.cTop) {
      len = -currentPosition.cTop;
    } else if (len >= list.bgHeight - list.contentHeight - currentPosition.cTop) {
      len = list.bgHeight - list.contentHeight - currentPosition.cTop;
    }
    return len;
  }

  /*
   * change the position of sjf-scroll-content to the designated spot directly
   */
  function scrollTo(param) {
    typeof param === 'undefined' ? console.error('the sjfScroll.scrollTo needs a param {spot: , relativeDom}') : !param.hasOwnProperty('spot') || !param.hasOwnProperty('relativeDom') ? console.error('param has a attribtue[spot] to set the designated spot' + 'param has a attribte[relativeDom] to set the relative dom element') : function () {
      var distance = param.spot - param.relativeDom.self.offsetTop;
      var heightList = getRelativeHeight(param.relativeDom.self);
      clickBoundary(distance, heightList);
      param.relativeDom.body.style.top = currentPosition.oTop + 'px';
      param.relativeDom.content.style.top = currentPosition.cTop + 'px';
    }();
  }

  // check is to reach the boundary of click event
  function clickBoundary(distance, list) {
    var maxCTop = list.bgHeight - list.contentHeight;
    var maxOTop = list.bodyHeight - list.selfHeight;
    var upperBoundary = list.bgHeight - list.contentHeight / 2;
    if (distance >= list.contentHeight / 2 && distance <= upperBoundary) {
      currentPosition.cTop = distance - list.contentHeight / 2;
      currentPosition.oTop = -(distance - list.contentHeight / 2) * (list.bodyHeight / list.selfHeight);
    } else if (distance < list.contentHeight / 2) {
      currentPosition.cTop = 0;
      currentPosition.oTop = 0;
    } else if (distance > upperBoundary) {
      currentPosition.cTop = maxCTop;
      currentPosition.oTop = -maxOTop;
    }
  }

  /*
   * This is to deal the wheel event
   * @param relative is the relative dom element
   * @condition is to judge the direction
   */
  function changeLocation(relative, event, condition) {
    var newEvent = event || window.event;
    newEvent.stopPropagation ? newEvent.stopPropagation() : newEvent.cancelBubble = true;
    newEvent.preventDefault ? newEvent.preventDefault() : newEvent.returnValue = false;

    var heightList = getRelativeHeight(relative.self);

    /*
     * to judge the direction 
     * and made special treatment to wheel events of firefox direction
     */
    var direction = 'down';
    if (typeof condition === 'boolean') {
      // this is the wheel event
      var judge = condition ? -newEvent.detail : newEvent.wheelDelta;
      direction = judge <= 0 ? 'down' : 'up';
    } else {
      // this is the keydown event
      direction = condition === 38 ? 'up' : 'down';
    }

    var distance = heightList.bgHeight - heightList.contentHeight - options.gradient;
    var unit = options.gradient * (heightList.bodyHeight / heightList.selfHeight);

    var directionValue = {
      down: {
        cGradient: options.gradient,
        oGradient: -unit,
        boundaryCondition: distance,
        cBoundary: heightList.bgHeight - heightList.contentHeight,
        oBoundary: -(heightList.bodyHeight - heightList.selfHeight)
      },
      up: {
        cGradient: -options.gradient,
        oGradient: unit,
        boundaryCondition: options.gradient,
        cBoundary: 0,
        oBoundary: 0
      }

      // check is to reach the boundary of wheel event and keydown event
    };if (!checkBoundary(direction, directionValue)) {
      currentPosition.oTop += directionValue[direction].oGradient;
      currentPosition.cTop += directionValue[direction].cGradient;
    }

    relative.body.style.top = currentPosition.oTop + 'px';
    relative.content.style.top = currentPosition.cTop + 'px';
  }

  function checkBoundary(direction, value) {
    var result = false;
    if (direction === 'down') {
      if (currentPosition.cTop >= value['down'].boundaryCondition) {
        currentPosition.cTop = value['down'].cBoundary;
        currentPosition.oTop = value['down'].oBoundary;
        result = true;
        if (scrollCallBack && typeof onScroll === 'function') {
          scrollCallBack();
        }
      }
    } else {
      if (currentPosition.cTop <= value['up'].boundaryCondition) {
        currentPosition.cTop = value['up'].cBoundary;
        currentPosition.oTop = value['up'].oBoundary;
        result = true;
      }
    }
    return result;
  }

  /*
   * the series of mouse events on scroll object 
   */
  var operate = {
    click: function click(obj, event) {
      var newEvent = event || window.event;
      var relative = getRelativeEle(obj);
      var disY = newEvent.clientY + document.body.scrollTop;
      scrollTo({ spot: disY, relativeDom: relative });
    },
    down: function down(obj, event) {
      var event = event || window.event;
      var relative = getRelativeEle(obj);
      var disY = event.clientY - relative.bg.scrollTop;
      currentPosition.oldClientY = disY;
      document.onmousemove = function (ev) {
        operate.move(relative, ev);
      };
      document.onmouseup = function () {
        operate.up();
      };
    },
    move: function move(obj, event) {
      scroll(obj, event);
    },
    keydown: function keydown(obj) {
      document.onkeydown = function (event) {
        var newEvent = window.event || event;
        var relative = getRelativeEle(obj);
        if (newEvent.keyCode === 38 || newEvent.keyCode === 40) {
          changeLocation(relative, newEvent, newEvent.keyCode);
        }
      };
    },
    up: function up() {
      document.onmousemove = null;
      document.onmouseup = null;
    },
    wheel: function wheel(obj, event) {
      var newEvent = event || window.event;
      var relative = getRelativeEle(obj);
      if (navigator.userAgent.toLowerCase().indexOf('firefox') < 0) {
        obj.onmousewheel = function (ev) {
          changeLocation(relative, ev, false);
        };
      } else {
        obj.addEventListener('DOMMouseScroll', function (ev) {
          changeLocation(relative, ev, true);
        });
      }
    }
  };

  function initScroll() {
    watchOptions(options);
    getMaxHeight();
  }

  function onScroll(callback) {
    if (!callback) {
      console.warn('sjf-scroll:[warn] the sjfScroll.scroll need a argument to' + ' as callback function but find none');
    } else {
      scrollCallBack = callback;
    }
  }

  return {
    initScroll: initScroll,
    setOptions: setOptions,
    scrollTo: scrollTo,
    scroll: onScroll
  };
});

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9zamZTY3JvbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUEsQ0FBQyxVQUFVLE1BQVYsRUFBa0IsT0FBbEIsRUFBMkI7QUFDMUIsVUFBTyxPQUFQLHlDQUFPLE9BQVAsT0FBbUIsUUFBbkIsSUFBK0IsT0FBTyxNQUFQLEtBQWtCLFdBQWpELEdBQ0UsT0FBTyxPQUFQLEdBQWlCLFNBRG5CLEdBRUUsT0FBTyxNQUFQLEtBQWtCLFVBQWxCLElBQWdDLE9BQU8sR0FBdkMsR0FDRSxPQUFPLE9BQVAsQ0FERixHQUVHLE9BQU8sU0FBUCxHQUFtQixTQUp4QjtBQUtELENBTkQsRUFNRyxPQUFPLE1BQVAsSUFBaUIsV0FBakIsR0FBK0IsTUFBL0IsWUFOSCxFQU1pRCxZQUFZO0FBQzNEO0FBQ0E7Ozs7Ozs7QUFNQSxNQUFJLFVBQVU7QUFDWixXQUFPLEdBREs7QUFFWixjQUFVLEVBRkU7QUFHWixlQUFXO0FBSEMsR0FBZDs7QUFNQSxNQUFJLGlCQUFpQixJQUFyQjs7QUFFQTs7Ozs7O0FBTUEsTUFBSSxrQkFBa0IsRUFBdEI7O0FBRUE7OztBQUdBLFdBQVMsUUFBVCxDQUFtQixHQUFuQixFQUF3QjtBQUN0QixRQUFJLFNBQVMsSUFBYjtBQUNBLFdBQU8sU0FBUCxDQUFpQixRQUFqQixDQUEwQixJQUExQixDQUErQixHQUEvQixNQUF3QyxpQkFBeEMsR0FBNEQsRUFBNUQsR0FBaUUsU0FBUyxLQUExRTtBQUNBLFdBQU8sTUFBUDtBQUNEOztBQUVEOzs7QUFHQSxXQUFTLGNBQVQsQ0FBeUIsR0FBekIsRUFBOEI7QUFDNUIsV0FBTztBQUNMLFlBQU0sSUFBSSxhQUFKLENBQWtCLGtCQUFsQixDQUREO0FBRUwsVUFBSSxJQUFJLGFBQUosQ0FBa0IsZ0JBQWxCLENBRkM7QUFHTCxlQUFTLElBQUksYUFBSixDQUFrQixxQkFBbEIsQ0FISjtBQUlM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Q0QsU0FGRDtBQUdEO0FBQ0Y7QUEvQ1csR0FBZDs7QUFrREEsV0FBUyxVQUFULEdBQXVCO0FBQ3JCLGlCQUFhLE9BQWI7QUFDQTtBQUNEOztBQUVELFdBQVMsUUFBVCxDQUFtQixRQUFuQixFQUE2QjtBQUMzQixRQUFJLENBQUMsUUFBTCxFQUFlO0FBQ2IsY0FBUSxJQUFSLENBQWEsOERBQ1YscUNBREg7QUFFRCxLQUhELE1BR087QUFDTCx1QkFBaUIsUUFBakI7QUFDRDtBQUNGOztBQUVELFNBQU87QUFDTCxnQkFBWSxVQURQO0FBRUwsZ0JBQVksVUFGUDtBQUdMLGNBQVUsUUFITDtBQUlMLFlBQVE7QUFKSCxHQUFQO0FBTUQsQ0E5ZUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IFxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBcbiAgICAgIGRlZmluZShmYWN0b3J5KSA6XG4gICAgICAoZ2xvYmFsLnNqZlNjcm9sbCA9IGZhY3RvcnkoKSlcbn0pKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0J1xuICAvKlxuICAgKiBUaGlzIGlzIHRoZSBvcHRpb25zIGZvciBzamYtc2Nyb2xsXG4gICAqIEBwYXJhbSBkZWxheSBpcyB0aGUgdGltZSB0byBkZWFsIHRoZSBtb3VzZSBldmVudHMgb24gdGhlIHNjcm9sbC13cmFwcGVyXG4gICAqIEBwYXJhbSBncmFkaWVudCBpcyB0aGUgVGhlIHVuaXQgb2YgcHJvZ3Jlc3MgZm9yIHdoZWVsIG9yIGtleWRvd24gZXZlbnRzXG4gICAqIEBwYXJhbSBtaW5IZWlnaHQgaXMgbWluIGhlaWdodCBvZiAuc2pmLXNjcm9sbC1jb250ZW50XG4gICAqL1xuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBkZWxheTogNTAwLFxuICAgIGdyYWRpZW50OiAxMCxcbiAgICBtaW5IZWlnaHQ6IDMwXG4gIH1cblxuICB2YXIgc2Nyb2xsQ2FsbEJhY2sgPSBudWxsXG5cbiAgLypcbiAgICogVGhpcyBpcyB0aGUgcGFyYW0gZm9yIHNqZi1zY3JvbGwgcG9zdGlvbiBcbiAgICogQHBhcmFtIGNUb3AgaXMgdGhlIHRvcCBvZiBzamYtc2Nyb2xsLWNvbnRlbnRcbiAgICogQHBhcmFtIG9Ub3AgaXMgdGhlIHRvcCBvZiBzamYtc2Nyb2xsLWJvZHlcbiAgICogQHBhcmFtIG9sZENsaWVudFkgaXMgdGhlIG9sZCBwb3NpdGlvbiBvZiBzamYtc2Nyb2xsIG1vdmUgZXZlbnRcbiAgICovXG4gIHZhciBjdXJyZW50UG9zaXRpb24gPSB7fVxuXG4gIC8qXG4gICAqIERldGVybWluZSBvYmogaXMgYW4gb2JqZWN0IG9yIG5vdFxuICAgKi9cbiAgZnVuY3Rpb24gaXNPYmplY3QgKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB0cnVlXG4gICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nID8gJycgOiByZXN1bHQgPSBmYWxzZVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qXG4gICAqIFRvIGdldCB0aGUgZG9tIGZvciBUaGUgY29ycmVzcG9uZGluZyBldmVudFxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UmVsYXRpdmVFbGUgKG9iaikge1xuICAgIHJldHVybiB7XG4gICAgICBib2R5OiBvYmoucXVlcnlTZWxlY3RvcignLnNqZi1zY3JvbGwtYm9keScpLFxuICAgICAgYmc6IG9iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC1iZycpLFxuICAgICAgY29udGVudDogb2JqLnF1ZXJ5U2VsZWN0b3IoJy5zamYtc2Nyb2xsLWNvbnRlbnQnKSxcbiAgICAgIHNlbGY6IG9ialxuICAgIH1cbiAgfVxuICAvKlxuICAgKiB0byBnZXQgdGhlIGhlaWdodCBvZiB0aGUgU3BlY2lmaWMgZG9tXG4gICAqL1xuICBmdW5jdGlvbiBnZXRSZWxhdGl2ZUhlaWdodCAob2JqKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJvZHlIZWlnaHQ6IG9iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC1ib2R5Jykub2Zmc2V0SGVpZ2h0LFxuICAgICAgYmdIZWlnaHQ6IG9iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC1iZycpLm9mZnNldEhlaWdodCxcbiAgICAgIGNvbnRlbnRIZWlnaHQ6IG9iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC1jb250ZW50Jykub2Zmc2V0SGVpZ2h0LFxuICAgICAgc2VsZkhlaWdodDogb2JqLm9mZnNldEhlaWdodFxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIOWOu+aKluWHveaVsFxuICAgKi9cbiAgZnVuY3Rpb24gZGVib3VuY2UoYWN0aW9uKXtcbiAgICB2YXIgbGFzdDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBjdHggPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgY2xlYXJUaW1lb3V0KGxhc3QpXG4gICAgICBsYXN0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBhY3Rpb24uYXBwbHkoY3R4LCBhcmdzKVxuICAgICAgfSwgb3B0aW9ucy5kZWxheSlcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiB3YXRjaCB0aGUgb2JqZWN0XG4gICAqIEBwYXJhbSBvYmogaXMgdGhlIG9iamVjdCB0byBiZSB3YXRjaGVkXG4gICAqL1xuICBmdW5jdGlvbiB3YXRjaE9wdGlvbnMgKG9iaikge1xuICAgIGlmICghaXNPYmplY3Qob2JqKSkge1xuICAgICAgY29uc29sZS53YXJuKCdzamYtc2Nyb2xsOlt3YXJuXSB0aGUgcGFyYW0gaXMgbm90IGEgb2JqZWN0JylcbiAgICB9IGVsc2Uge1xuICAgICAgb2JzZXJ2ZShvYmopXG4gICAgfVxuICB9XG4gIFxuICBmdW5jdGlvbiBvYnNlcnZlIChvYmopIHtcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oa2V5LCBpbmRleCkge1xuICAgICAgdmFyIHZhbCA9IG9ialtrZXldXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgICB9LFxuICAgICAgICBzZXQ6IChmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICBvYmoua2V5ID0gbmV3VmFsdWVcbiAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgfSkgXG4gICAgICAvLyBGb3IgZGVwdGggbW9uaXRvcmluZyBvbiBvYmplY3QgcHJvcGVydGllc1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmpba2V5XSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgIG9ic2VydmUob2JqW2tleV0pXG4gICAgICB9XG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIC8qXG4gICAqIGRlYWwgdGhlIG9wdGlvbnMgZm9yIHNqZi1zY3JvbGxcbiAgICovXG4gIGZ1bmN0aW9uIGRlYWxPcHRpb25zICh2YWwpIHtcbiAgICBjb25zb2xlLmxvZygndGhlIG5ldyB2YWwgaXMgJyArIHZhbClcbiAgfVxuXG4gIC8qIFxuICAgKiBUaGUgaW50ZXJmYWNlIGZvciB1c2VycyB0byBzZXQgb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gc2V0T3B0aW9ucyAob3B0aW9uKSB7XG4gICAgaWYgKCFpc09iamVjdChvcHRpb24pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdzamYtc2Nyb2xsOltlcnJvcl0gb3B0aW9ucyBtdXN0IGJlIGEgb2JqZWN0IGJ1dCAnICsgXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KG9wdGlvbikgKyAnIGlzIG5vdCBhIG9iamVjdCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZm9yICh2YXIgcHJvcCBpbiBvcHRpb24pIHtcbiAgICAgIG9wdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkgPyBvcHRpb25zW3Byb3BdID0gb3B0aW9uW3Byb3BdIDogXG4gICAgICAgIGNvbnNvbGUud2Fybignc2pmLXNjcm9sbDpbd2Fybl0gc2pmLXNjcm9sbCBkbyBub3Qgc3VwcG9ydCB0aGUgY29uZmlndXJhdGlvbiBpdGVtIG9mICcgKyBwcm9wKVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIGdldCB0aGUgbGl2aW5nIGV4YW1wbGUgZW50cmFuY2Ugb2Ygc2pmLXNjcm9sbFxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0TWF4SGVpZ2h0ICgpIHtcbiAgICB2YXIgc2Nyb2xscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzamYtc2Nyb2xsXScpXG4gICAgaWYgKHNjcm9sbHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHNjcm9sbHMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBtYXhIZWlnaHQgPSB2YWx1ZS5nZXRBdHRyaWJ1dGUoJ21heC1oZWlnaHQnKVxuICAgICAgICBtYXhIZWlnaHQgIT09IG51bGwgPyArbWF4SGVpZ2h0IDwgMTUwID8gXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ3NqZi1zY3JvbGw6W3dhcm5dIHRoZSB2YWx1ZSBvZiBtYXgtaGVpZ2h0IGJlc3QgaXMgPj0gMTUwJykgOiBcbiAgICAgICAgICAgICcnIDpcbiAgICAgICAgICBtYXhIZWlnaHQgPSAxNTBcbiAgICAgICAgcmV3cml0ZURvbSh2YWx1ZSwgbWF4SGVpZ2h0KVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignQXQgbGVhc3QgbmVlZCBhIC5zamYtc2Nyb2xsIGluIHlvdXIgZG9tIGZvciBleGFtcGxlOicgKyBcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJzamYtc2Nyb2xsXCI+PC9kaXY+JylcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiByZXdyaXRlIHRoZSBET00gc3RydWN0dXJlIG9mIHNqZi1zY3JvbGxcbiAgICovXG4gIGZ1bmN0aW9uIHJld3JpdGVEb20gKG9iaiwgbWF4SGVpZ2h0KSB7XG4gICAgdmFyIGluaXRIdG1sID0gb2JqLmlubmVySFRNTFxuICAgIHZhciBjbG9uZWRPYmogPSBvYmouY2xvbmVOb2RlKHRydWUpXG4gICAgb2JqLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNsb25lZE9iaiwgb2JqKVxuICAgIG9iai5jbGFzc0xpc3QuYWRkKCdoaWRlLW9sZCcpXG4gICAgaW5pdEh0bWwgPSAnPGRpdiBjbGFzcz1cInNqZi1zY3JvbGwtd3JhcHBlclwiPjxkaXYgY2xhc3M9XCJzamYtc2Nyb2xsLWJvZHlcIj4nICsgaW5pdEh0bWwgKyBcbiAgICAgICc8L2Rpdj48ZGl2IGNsYXNzPVwic2pmLXNjcm9sbC1iZ1wiPjxzcGFuIGNsYXNzPVwic2pmLXNjcm9sbC1jb250ZW50XCI+PC9zcGFuPjwvZGl2PjwvZGl2PidcbiAgICBjbG9uZWRPYmouaW5uZXJIVE1MID0gaW5pdEh0bWxcbiAgICBzZXRIZWlnaHQoY2xvbmVkT2JqLCBtYXhIZWlnaHQpXG4gICAgYWRkTXV0YXRpb25PYnNlcnZlcihvYmosIG1heEhlaWdodClcbiAgfVxuXG4gIC8qXG4gICAqIHRvIHNldCB0aGUgaGVpZ2h0IG9mIHNjcm9sbFxuICAgKi8gXG4gIGZ1bmN0aW9uIHNldEhlaWdodCAob2JqLCBtYXhIZWlnaHQpIHtcbiAgICB2YXIgd3JhcHBlciA9IG9iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC13cmFwcGVyJylcbiAgICB2YXIgYmcgPSBvYmoucXVlcnlTZWxlY3RvcignLnNqZi1zY3JvbGwtYmcnKVxuICAgIHZhciBjb250ZW50ID0gb2JqLnF1ZXJ5U2VsZWN0b3IoJy5zamYtc2Nyb2xsLWNvbnRlbnQnKVxuICAgIHZhciBib2R5ID0gb2JqLnF1ZXJ5U2VsZWN0b3IoJy5zamYtc2Nyb2xsLWJvZHknKVxuICAgIHZhciBvZmZzZXRIZWlnaHQgPSBib2R5Lm9mZnNldEhlaWdodCB8fCBib2R5LmNsaWVudEhlaWdodFxuXG4gICAgaWYgKG9mZnNldEhlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgYmcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICAgIGJpbmRFdmVudChvYmopXG4gICAgfSBlbHNlIHtcbiAgICAgIGJnLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgIGNhbmNlbEJpbmRFdmVudChvYmopXG4gICAgfVxuICAgIHdyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgIGJnLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICB2YXIgcHJldkhlaWdodCA9IChtYXhIZWlnaHQgKiBtYXhIZWlnaHQpIC9vZmZzZXRIZWlnaHRcbiAgICBwcmV2SGVpZ2h0ID0gcHJldkhlaWdodCA+IG9wdGlvbnMubWluSGVpZ2h0ID8gcHJldkhlaWdodCA6IG9wdGlvbnMubWluSGVpZ2h0XG4gICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSBwcmV2SGVpZ2h0ICsgJ3B4J1xuICB9XG5cbiAgLypcbiAgICogdG8gd2F0Y2ggdGhlIGNoYW5nZSBvZiBkb20gc3RydWN0dXJlIG9mIGhpZGUtb2xkXG4gICAqIEBvbGRPYmogaXMgdGhlIGRvbSB3aGljaCBpcyB0byBiZSB3YXRjaGVkXG4gICAqLyBcbiAgZnVuY3Rpb24gYWRkTXV0YXRpb25PYnNlcnZlciAob2xkT2JqLCBtYXhIZWlnaHQpIHtcbiAgICB2YXIgTXV0YXRpb25PYnNlcnZlciA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5XZWJraXRNdXRhdGlvbk9ic2VydmVyXG4gICAgICB8fCB3aW5kb3cuTW96TXV0YXRpb25PYnNlcnZlclxuXG4gICAgdmFyIG11dGF0aW9uT2JzZXJ2ZXJDb25maWcgPSB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlXG4gICAgfVxuXG4gICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9uUmVjb3JkKSB7XG4gICAgICBrZWVwQXdheShvbGRPYmosIG1heEhlaWdodClcbiAgICB9KVxuXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShvbGRPYmosIG11dGF0aW9uT2JzZXJ2ZXJDb25maWcpXG4gIH1cblxuICAvKlxuICAgKiB0byBiaW5kIHRoZSByZWxhdGl2ZSBldmVudCBvbiB0aGUgc2pmLXNjcm9sbFxuICAgKi9cbiAgZnVuY3Rpb24gYmluZEV2ZW50IChvYmopIHtcbiAgICB2YXIgd3JhcHBlciA9IG9iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC13cmFwcGVyJylcbiAgICB2YXIgYmcgPSBvYmoucXVlcnlTZWxlY3RvcignLnNqZi1zY3JvbGwtYmcnKVxuICAgIHZhciBjb250ZW50ID0gb2JqLnF1ZXJ5U2VsZWN0b3IoJy5zamYtc2Nyb2xsLWNvbnRlbnQnKVxuICAgIHZhciBpc0ZpcnN0ID0gdHJ1ZVxuXG4gICAgd3JhcHBlci5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJylcbiAgICAgICAgcG9zaXRpb24gIT09IG51bGwgPyBjdXJyZW50UG9zaXRpb24gPSBKU09OLnBhcnNlKHRoaXMuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpKSA6XG4gICAgICAgICAgY3VycmVudFBvc2l0aW9uID0ge2NUb3A6IDAsIG9Ub3A6IDAsIG9sZENsaWVudFk6IDB9XG4gICAgICAgIGlzRmlyc3QgPSBmYWxzZVxuICAgICAgfVxuICAgICAgdmFyIG5ld0V2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50XG4gICAgICBkZWJvdW5jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIG9wZXJhdGUud2hlZWwob2JqLCBuZXdFdmVudClcbiAgICAgICAgb3BlcmF0ZS5rZXlkb3duKG9iaiwgbmV3RXZlbnQpXG4gICAgICB9KSgpXG4gICAgICB0aGlzLm9ubW91c2VsZWF2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKSlcbiAgICAgICAgaXNGaXJzdCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBiZy5vbmNsaWNrID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBvcGVyYXRlLmNsaWNrKG9iaiwgZXZlbnQpXG4gICAgfVxuXG4gICAgY29udGVudC5vbmNsaWNrID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmV3RXZlbnQgPSBldmVudCB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIG5ld0V2ZW50LnN0b3BQcm9wYWdhdGlvbiA/IG5ld0V2ZW50LnN0b3BQcm9wYWdhdGlvbigpIDogd2luZG93LmNhbmNlbEJ1YmJsZSA9IGZhbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb250ZW50Lm9ubW91c2Vkb3duID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBvcGVyYXRlLmRvd24ob2JqLCBldmVudClcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBjYW5jZWwgdGhlIGV2ZW50IGJpbmQgb24gdGhlIHNqZi1zY3JvbGxcbiAgICovXG4gIGZ1bmN0aW9uIGNhbmNlbEJpbmRFdmVudCAob2JqKSB7XG4gICAgdmFyIHdyYXBwZXIgPSBvYmoucXVlcnlTZWxlY3RvcignLnNqZi1zY3JvbGwtd3JhcHBlcicpXG4gICAgdmFyIGJnID0gb2JqLnF1ZXJ5U2VsZWN0b3IoJy5zamYtc2Nyb2xsLWJnJylcbiAgICB2YXIgY29udGVudCA9IG9iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC1jb250ZW50JylcblxuICAgIHdyYXBwZXIub25tb3VzZW92ZXIgPSBudWxsXG4gICAgYmcub25jbGljayA9IG51bGxcbiAgICBjb250ZW50Lm9uY2xpY2sgPSBudWxsXG4gICAgY29udGVudC5vbm1vdXNlZG93biA9IG51bGxcbiAgICBvYmoub25tb3VzZXdoZWVsID0gbnVsbFxuICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Nb3VzZVNjcm9sbCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgY2hhbmdlTG9jYXRpb24ocmVsYXRpdmUsIGV2LCB0cnVlKVxuICAgIH0sIGZhbHNlKVxuICB9XG5cbiAgLypcbiAgICoga2VlcCB0aGUgaHRtbCBzdHJ1Y3R1cmUgb2Ygb2xkIGF3YXkgd2l0aCB0aGUgaHRtbCBzdHJjdHVyZSBvZiBuZXcgXG4gICAqL1xuICBmdW5jdGlvbiBrZWVwQXdheSAob2JqLCBtYXhIZWlnaHQpIHtcbiAgICB2YXIgbmV3T2JqID0gb2JqLnByZXZpb3VzRWxlbWVudFNpYmxpbmdcbiAgICB2YXIgc2pmU2Nyb2xsQm9keSA9IG5ld09iai5xdWVyeVNlbGVjdG9yKCcuc2pmLXNjcm9sbC1ib2R5JylcbiAgICBzamZTY3JvbGxCb2R5LmlubmVySFRNTCA9IG9iai5pbm5lckhUTUxcbiAgICBzZXRIZWlnaHQobmV3T2JqLCBtYXhIZWlnaHQpXG4gIH1cblxuICAvKlxuICAgKiBUaGlzIGlzIHRvIGRlYWwgdGhlIHNjcm9sbCBtb3ZlIFxuICAgKiBAcGFyYW0gcmVsYXRpdmUgaXMgYSBvYmplY3Qgb2YgdGhlIGFzc2VtYmx5IG9mIGVsZW1lbnQgd2hpY2ggaXMgcmVsYXRpdmVkIHRvIHRoZSBzY3JvbGwgZXZlbnRcbiAgICovXG4gIGZ1bmN0aW9uIHNjcm9sbCAocmVsYXRpdmUsIGV2ZW50KSB7XG4gICAgdmFyIG5ld0V2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50XG4gICAgdmFyIGhlaWdodExpc3QgPSBnZXRSZWxhdGl2ZUhlaWdodChyZWxhdGl2ZS5zZWxmKVxuICAgIHZhciBsZW4gPSBuZXdFdmVudC5jbGllbnRZIC0gY3VycmVudFBvc2l0aW9uLm9sZENsaWVudFlcblxuICAgIGxlbiA9IG1vdmVCb3VuZGFyeShsZW4sIGhlaWdodExpc3QpXG5cbiAgICBjdXJyZW50UG9zaXRpb24uY1RvcCArPSBsZW5cbiAgICBjdXJyZW50UG9zaXRpb24ub1RvcCAtPSBsZW4gKiAoaGVpZ2h0TGlzdC5ib2R5SGVpZ2h0IC8gaGVpZ2h0TGlzdC5zZWxmSGVpZ2h0KVxuICAgIHJlbGF0aXZlLmNvbnRlbnQuc3R5bGUudG9wID0gY3VycmVudFBvc2l0aW9uLmNUb3AgKyAncHgnXG4gICAgcmVsYXRpdmUuYm9keS5zdHlsZS50b3AgPSBjdXJyZW50UG9zaXRpb24ub1RvcCArICdweCdcblxuICAgIGN1cnJlbnRQb3NpdGlvbi5vbGRDbGllbnRZID0gbmV3RXZlbnQuY2xpZW50WVxuICB9XG5cbiAgLypcbiAgICogY2hlY2sgaXMgdG8gcmVhY2ggdGhlIGJvdW5kYXJ5IG9mIGRyYWcgZXZlbnRcbiAgICovXG4gIGZ1bmN0aW9uIG1vdmVCb3VuZGFyeSAobGVuLCBsaXN0KSB7XG4gICAgaWYgKGxlbiA8PSAtY3VycmVudFBvc2l0aW9uLmNUb3ApIHtcbiAgICAgIGxlbiA9IC1jdXJyZW50UG9zaXRpb24uY1RvcFxuICAgIH0gZWxzZSBpZiAobGVuID49IGxpc3QuYmdIZWlnaHQgLSBsaXN0LmNvbnRlbnRIZWlnaHQgLSBjdXJyZW50UG9zaXRpb24uY1RvcCkge1xuICAgICAgbGVuID0gbGlzdC5iZ0hlaWdodCAtIGxpc3QuY29udGVudEhlaWdodCAtIGN1cnJlbnRQb3NpdGlvbi5jVG9wXG4gICAgfVxuICAgIHJldHVybiBsZW5cbiAgfVxuXG4gIC8qXG4gICAqIGNoYW5nZSB0aGUgcG9zaXRpb24gb2Ygc2pmLXNjcm9sbC1jb250ZW50IHRvIHRoZSBkZXNpZ25hdGVkIHNwb3QgZGlyZWN0bHlcbiAgICovIFxuICBmdW5jdGlvbiBzY3JvbGxUbyAocGFyYW0pIHtcbiAgICB0eXBlb2YgcGFyYW0gPT09ICd1bmRlZmluZWQnID8gXG4gICAgICBjb25zb2xlLmVycm9yKCd0aGUgc2pmU2Nyb2xsLnNjcm9sbFRvIG5lZWRzIGEgcGFyYW0ge3Nwb3Q6ICwgcmVsYXRpdmVEb219JykgOiBcbiAgICAgICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgnc3BvdCcpIHx8ICFwYXJhbS5oYXNPd25Qcm9wZXJ0eSgncmVsYXRpdmVEb20nKSA/IFxuICAgICAgICBjb25zb2xlLmVycm9yKCdwYXJhbSBoYXMgYSBhdHRyaWJ0dWVbc3BvdF0gdG8gc2V0IHRoZSBkZXNpZ25hdGVkIHNwb3QnICtcbiAgICAgICAgICdwYXJhbSBoYXMgYSBhdHRyaWJ0ZVtyZWxhdGl2ZURvbV0gdG8gc2V0IHRoZSByZWxhdGl2ZSBkb20gZWxlbWVudCcpIDpcbiAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBwYXJhbS5zcG90IC0gcGFyYW0ucmVsYXRpdmVEb20uc2VsZi5vZmZzZXRUb3BcbiAgICAgICAgICB2YXIgaGVpZ2h0TGlzdCA9IGdldFJlbGF0aXZlSGVpZ2h0KHBhcmFtLnJlbGF0aXZlRG9tLnNlbGYpXG4gICAgICAgICAgY2xpY2tCb3VuZGFyeShkaXN0YW5jZSwgaGVpZ2h0TGlzdClcbiAgICAgICAgICBwYXJhbS5yZWxhdGl2ZURvbS5ib2R5LnN0eWxlLnRvcCA9IGN1cnJlbnRQb3NpdGlvbi5vVG9wICsgJ3B4J1xuICAgICAgICAgIHBhcmFtLnJlbGF0aXZlRG9tLmNvbnRlbnQuc3R5bGUudG9wID0gY3VycmVudFBvc2l0aW9uLmNUb3AgKyAncHgnXG4gICAgICAgIH0pKClcbiAgfVxuXG4gIC8vIGNoZWNrIGlzIHRvIHJlYWNoIHRoZSBib3VuZGFyeSBvZiBjbGljayBldmVudFxuICBmdW5jdGlvbiBjbGlja0JvdW5kYXJ5IChkaXN0YW5jZSwgbGlzdCkge1xuICAgIHZhciBtYXhDVG9wID0gbGlzdC5iZ0hlaWdodCAtIGxpc3QuY29udGVudEhlaWdodFxuICAgIHZhciBtYXhPVG9wID0gbGlzdC5ib2R5SGVpZ2h0IC0gbGlzdC5zZWxmSGVpZ2h0XG4gICAgdmFyIHVwcGVyQm91bmRhcnkgPSBsaXN0LmJnSGVpZ2h0IC0gbGlzdC5jb250ZW50SGVpZ2h0IC8gMlxuICAgIGlmIChkaXN0YW5jZSA+PSBsaXN0LmNvbnRlbnRIZWlnaHQgLyAyICYmIGRpc3RhbmNlIDw9IHVwcGVyQm91bmRhcnkpIHtcbiAgICAgIGN1cnJlbnRQb3NpdGlvbi5jVG9wID0gZGlzdGFuY2UgLSBsaXN0LmNvbnRlbnRIZWlnaHQgLyAyXG4gICAgICBjdXJyZW50UG9zaXRpb24ub1RvcCA9IC0oZGlzdGFuY2UgLSBsaXN0LmNvbnRlbnRIZWlnaHQgLyAyKSAqIFxuICAgICAgICAobGlzdC5ib2R5SGVpZ2h0IC8gbGlzdC5zZWxmSGVpZ2h0KVxuICAgIH0gZWxzZSBpZiAoZGlzdGFuY2UgPCBsaXN0LmNvbnRlbnRIZWlnaHQgLyAyKSB7XG4gICAgICBjdXJyZW50UG9zaXRpb24uY1RvcCA9IDBcbiAgICAgIGN1cnJlbnRQb3NpdGlvbi5vVG9wID0gMFxuICAgIH0gZWxzZSBpZiAoZGlzdGFuY2UgPiB1cHBlckJvdW5kYXJ5KSB7XG4gICAgICBjdXJyZW50UG9zaXRpb24uY1RvcCA9IG1heENUb3BcbiAgICAgIGN1cnJlbnRQb3NpdGlvbi5vVG9wID0gLW1heE9Ub3BcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBUaGlzIGlzIHRvIGRlYWwgdGhlIHdoZWVsIGV2ZW50XG4gICAqIEBwYXJhbSByZWxhdGl2ZSBpcyB0aGUgcmVsYXRpdmUgZG9tIGVsZW1lbnRcbiAgICogQGNvbmRpdGlvbiBpcyB0byBqdWRnZSB0aGUgZGlyZWN0aW9uXG4gICAqL1xuICBmdW5jdGlvbiBjaGFuZ2VMb2NhdGlvbiAocmVsYXRpdmUsIGV2ZW50LCBjb25kaXRpb24pIHtcbiAgICB2YXIgbmV3RXZlbnQgPSBldmVudCB8fCB3aW5kb3cuZXZlbnRcbiAgICBuZXdFdmVudC5zdG9wUHJvcGFnYXRpb24gPyBuZXdFdmVudC5zdG9wUHJvcGFnYXRpb24oKSA6IG5ld0V2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWVcbiAgICBuZXdFdmVudC5wcmV2ZW50RGVmYXVsdCA/IG5ld0V2ZW50LnByZXZlbnREZWZhdWx0KCkgOiBuZXdFdmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlXG5cbiAgICB2YXIgaGVpZ2h0TGlzdCA9IGdldFJlbGF0aXZlSGVpZ2h0KHJlbGF0aXZlLnNlbGYpXG5cbiAgICAvKlxuICAgICAqIHRvIGp1ZGdlIHRoZSBkaXJlY3Rpb24gXG4gICAgICogYW5kIG1hZGUgc3BlY2lhbCB0cmVhdG1lbnQgdG8gd2hlZWwgZXZlbnRzIG9mIGZpcmVmb3ggZGlyZWN0aW9uXG4gICAgICovIFxuICAgIHZhciBkaXJlY3Rpb24gPSAnZG93bidcbiAgICBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAvLyB0aGlzIGlzIHRoZSB3aGVlbCBldmVudFxuICAgICAgdmFyIGp1ZGdlID0gY29uZGl0aW9uID8gLW5ld0V2ZW50LmRldGFpbCA6IG5ld0V2ZW50LndoZWVsRGVsdGFcbiAgICAgIGRpcmVjdGlvbiA9IGp1ZGdlIDw9IDAgPyAnZG93bicgOiAndXAnXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRoaXMgaXMgdGhlIGtleWRvd24gZXZlbnRcbiAgICAgIGRpcmVjdGlvbiA9IGNvbmRpdGlvbiA9PT0gMzggPyAndXAnIDogJ2Rvd24nXG4gICAgfVxuXG4gICAgdmFyIGRpc3RhbmNlID0gaGVpZ2h0TGlzdC5iZ0hlaWdodCAtIGhlaWdodExpc3QuY29udGVudEhlaWdodCAtIG9wdGlvbnMuZ3JhZGllbnRcbiAgICB2YXIgdW5pdCA9IG9wdGlvbnMuZ3JhZGllbnQgKiAoaGVpZ2h0TGlzdC5ib2R5SGVpZ2h0IC8gaGVpZ2h0TGlzdC5zZWxmSGVpZ2h0KVxuXG4gICAgdmFyIGRpcmVjdGlvblZhbHVlID0ge1xuICAgICAgZG93bjoge1xuICAgICAgICBjR3JhZGllbnQ6IG9wdGlvbnMuZ3JhZGllbnQsXG4gICAgICAgIG9HcmFkaWVudDogLXVuaXQsXG4gICAgICAgIGJvdW5kYXJ5Q29uZGl0aW9uOiBkaXN0YW5jZSxcbiAgICAgICAgY0JvdW5kYXJ5OiBoZWlnaHRMaXN0LmJnSGVpZ2h0IC0gaGVpZ2h0TGlzdC5jb250ZW50SGVpZ2h0LFxuICAgICAgICBvQm91bmRhcnk6IC0oaGVpZ2h0TGlzdC5ib2R5SGVpZ2h0IC0gaGVpZ2h0TGlzdC5zZWxmSGVpZ2h0KVxuICAgICAgfSxcbiAgICAgIHVwOiB7XG4gICAgICAgIGNHcmFkaWVudDogLW9wdGlvbnMuZ3JhZGllbnQsXG4gICAgICAgIG9HcmFkaWVudDogdW5pdCxcbiAgICAgICAgYm91bmRhcnlDb25kaXRpb246IG9wdGlvbnMuZ3JhZGllbnQsXG4gICAgICAgIGNCb3VuZGFyeTogMCxcbiAgICAgICAgb0JvdW5kYXJ5OiAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaXMgdG8gcmVhY2ggdGhlIGJvdW5kYXJ5IG9mIHdoZWVsIGV2ZW50IGFuZCBrZXlkb3duIGV2ZW50XG4gICAgaWYgKCFjaGVja0JvdW5kYXJ5KGRpcmVjdGlvbiwgZGlyZWN0aW9uVmFsdWUpKSB7XG4gICAgICBjdXJyZW50UG9zaXRpb24ub1RvcCArPSBkaXJlY3Rpb25WYWx1ZVtkaXJlY3Rpb25dLm9HcmFkaWVudFxuICAgICAgY3VycmVudFBvc2l0aW9uLmNUb3AgKz0gZGlyZWN0aW9uVmFsdWVbZGlyZWN0aW9uXS5jR3JhZGllbnRcbiAgICB9XG5cbiAgICByZWxhdGl2ZS5ib2R5LnN0eWxlLnRvcCA9IGN1cnJlbnRQb3NpdGlvbi5vVG9wICsgJ3B4J1xuICAgIHJlbGF0aXZlLmNvbnRlbnQuc3R5bGUudG9wID0gY3VycmVudFBvc2l0aW9uLmNUb3AgKyAncHgnXG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0JvdW5kYXJ5IChkaXJlY3Rpb24sIHZhbHVlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICBpZiAoY3VycmVudFBvc2l0aW9uLmNUb3AgPj0gdmFsdWVbJ2Rvd24nXS5ib3VuZGFyeUNvbmRpdGlvbikge1xuICAgICAgICBjdXJyZW50UG9zaXRpb24uY1RvcCA9IHZhbHVlWydkb3duJ10uY0JvdW5kYXJ5XG4gICAgICAgIGN1cnJlbnRQb3NpdGlvbi5vVG9wID0gdmFsdWVbJ2Rvd24nXS5vQm91bmRhcnlcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZVxuICAgICAgICBpZihzY3JvbGxDYWxsQmFjayAmJiB0eXBlb2Ygb25TY3JvbGwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBzY3JvbGxDYWxsQmFjaygpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJlbnRQb3NpdGlvbi5jVG9wIDw9IHZhbHVlWyd1cCddLmJvdW5kYXJ5Q29uZGl0aW9uKSB7XG4gICAgICAgIGN1cnJlbnRQb3NpdGlvbi5jVG9wID0gdmFsdWVbJ3VwJ10uY0JvdW5kYXJ5XG4gICAgICAgIGN1cnJlbnRQb3NpdGlvbi5vVG9wID0gdmFsdWVbJ3VwJ10ub0JvdW5kYXJ5XG4gICAgICAgIHJlc3VsdCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgLypcbiAgICogdGhlIHNlcmllcyBvZiBtb3VzZSBldmVudHMgb24gc2Nyb2xsIG9iamVjdCBcbiAgICovXG4gIHZhciBvcGVyYXRlID0ge1xuICAgIGNsaWNrOiBmdW5jdGlvbiAob2JqLCBldmVudCkge1xuICAgICAgdmFyIG5ld0V2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50XG4gICAgICB2YXIgcmVsYXRpdmUgPSBnZXRSZWxhdGl2ZUVsZShvYmopXG4gICAgICB2YXIgZGlzWSA9IG5ld0V2ZW50LmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgc2Nyb2xsVG8oe3Nwb3Q6IGRpc1ksIHJlbGF0aXZlRG9tOiByZWxhdGl2ZX0pXG4gICAgfSxcbiAgICBkb3duOiBmdW5jdGlvbiAob2JqLCBldmVudCkge1xuICAgICAgdmFyIGV2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50XG4gICAgICB2YXIgcmVsYXRpdmUgPSBnZXRSZWxhdGl2ZUVsZShvYmopXG4gICAgICB2YXIgZGlzWSA9IGV2ZW50LmNsaWVudFkgLSByZWxhdGl2ZS5iZy5zY3JvbGxUb3BcbiAgICAgIGN1cnJlbnRQb3NpdGlvbi5vbGRDbGllbnRZID0gZGlzWVxuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgb3BlcmF0ZS5tb3ZlKHJlbGF0aXZlLCBldilcbiAgICAgIH1cbiAgICAgIGRvY3VtZW50Lm9ubW91c2V1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3BlcmF0ZS51cCgpXG4gICAgICB9XG4gICAgfSxcbiAgICBtb3ZlOiBmdW5jdGlvbiAob2JqLCBldmVudCkge1xuICAgICAgc2Nyb2xsKG9iaiwgZXZlbnQpXG4gICAgfSxcbiAgICBrZXlkb3duOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICBkb2N1bWVudC5vbmtleWRvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG5ld0V2ZW50ID0gd2luZG93LmV2ZW50IHx8IGV2ZW50XG4gICAgICAgIHZhciByZWxhdGl2ZSA9IGdldFJlbGF0aXZlRWxlKG9iailcbiAgICAgICAgaWYgKG5ld0V2ZW50LmtleUNvZGUgPT09IDM4IHx8IG5ld0V2ZW50LmtleUNvZGUgPT09IDQwKSB7XG4gICAgICAgICAgY2hhbmdlTG9jYXRpb24ocmVsYXRpdmUsIG5ld0V2ZW50LCBuZXdFdmVudC5rZXlDb2RlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB1cDogZnVuY3Rpb24gKCkge1xuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBudWxsXG4gICAgICBkb2N1bWVudC5vbm1vdXNldXAgPSBudWxsXG4gICAgfSxcbiAgICB3aGVlbDogZnVuY3Rpb24gKG9iaiwgZXZlbnQpIHtcbiAgICAgIHZhciBuZXdFdmVudCA9IGV2ZW50IHx8IHdpbmRvdy5ldmVudFxuICAgICAgdmFyIHJlbGF0aXZlID0gZ2V0UmVsYXRpdmVFbGUob2JqKVxuICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgPCAwKSB7XG4gICAgICAgIG9iai5vbm1vdXNld2hlZWwgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICBjaGFuZ2VMb2NhdGlvbihyZWxhdGl2ZSwgZXYsIGZhbHNlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICBjaGFuZ2VMb2NhdGlvbihyZWxhdGl2ZSwgZXYsIHRydWUpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFNjcm9sbCAoKSB7XG4gICAgd2F0Y2hPcHRpb25zKG9wdGlvbnMpXG4gICAgZ2V0TWF4SGVpZ2h0KClcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU2Nyb2xsIChjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNvbnNvbGUud2Fybignc2pmLXNjcm9sbDpbd2Fybl0gdGhlIHNqZlNjcm9sbC5zY3JvbGwgbmVlZCBhIGFyZ3VtZW50IHRvJ1xuICAgICAgICsgJyBhcyBjYWxsYmFjayBmdW5jdGlvbiBidXQgZmluZCBub25lJylcbiAgICB9IGVsc2Uge1xuICAgICAgc2Nyb2xsQ2FsbEJhY2sgPSBjYWxsYmFja1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdFNjcm9sbDogaW5pdFNjcm9sbCxcbiAgICBzZXRPcHRpb25zOiBzZXRPcHRpb25zLFxuICAgIHNjcm9sbFRvOiBzY3JvbGxUbyxcbiAgICBzY3JvbGw6IG9uU2Nyb2xsXG4gIH1cbn0pXG4iXX0=
