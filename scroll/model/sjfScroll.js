(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? 
    module.exports = factory() :
    typeof define === 'function' && define.amd ? 
      define(factory) :
      (global.sjfScroll = factory())
})(typeof window != 'undefined' ? window : this, function () {
  'use strict'
  /*
   * This is the options for sjf-scroll
   * @param isShow is for showing the sjf-scroll
   * @param delay is the time to deal the mouse events on the scroll-container
   */
  var options = {
    delay: 1000,
    gradient: 10
  }

  var position = {
    cTop: 0,
    oTop: 0
  }

  // Determine whether as an object
  function isObject (obj) {
    var result = true
    Object.prototype.toString.call(obj) === '[object Object]' ? '' : result = false
    return result
  }

  function getRelativeEle (obj) {
    return {
      body: obj.querySelector('.sjf-scroll-body'),
      bg: obj.querySelector('.sjf-scroll-bg'),
      content: obj.querySelector('.sjf-scroll-content'),
      self: obj
    }
  }

  /*
   * 去抖函数
   */
  function debounce(action){
    var last;
    return function(){
      var ctx = this, args = arguments;
      clearTimeout(last)
      last = setTimeout(function(){
          action.apply(ctx, args)
      }, options.delay)
    }
  }

  // get the living example entrance of sjf-scroll
  function getMaxHeight () {
    var scrolls = document.querySelectorAll('.sjf-scroll')
    Array.prototype.forEach.call(scrolls, value => {
      var maxHeight = value.getAttribute('max-height')
      if (maxHeight === null) {
        console.error('sjf-scroll: [error]' + 
          'please add a attribute["max-height": (value)&int] on ".sjf-scroll"' + 
          '&& max-height >= 100')
      } else {
        +maxHeight < 100 ? 
          console.warn('sjf-scroll: [warn] the value of max-height should be above or equal 100') : 
          rewriteDom(value, maxHeight)
      }
    })
  }

  /*
   * rewrite the DOM structure of sjf-scroll
   */
  function rewriteDom (obj, maxHeight) {
    var initHtml = obj.innerHTML
    initHtml = '<div class="sjf-scroll-wrapper"><div class="sjf-scroll-body">' + initHtml + 
      '</div><div class="sjf-scroll-bg"><span class="sjf-scroll-content"></span></div>'
    obj.innerHTML = initHtml
    
    var wrapper = obj.querySelector('.sjf-scroll-wrapper')
    var bg = obj.querySelector('.sjf-scroll-bg')
    var content = obj.querySelector('.sjf-scroll-content')
    var body = obj.querySelector('.sjf-scroll-body')
    var offsetHeight = body.offsetHeight || body.clientHeight

    offsetHeight > maxHeight ? bg.style.display = 'block' : bg.style.display = 'none'
    wrapper.style.height = maxHeight + 'px'
    bg.style.height = maxHeight + 'px'
    content.style.height = (maxHeight * maxHeight) / offsetHeight + 'px'
    wrapper.onmouseover = function (event) {
      operate.over(wrapper, event)
    }

    content.onmousedown = function (event) {
      operate.down(wrapper, event)
    }
  }

  /*
   * watch the object
   * @param obj is the object to be watched
   */
  function watchOptions (obj) {
    if (!isObject(obj)) {
      console.warn('sjf-scroll:[warn] the param is not a object')
    } else {
      observe (obj)
    }
  }
  
  function observe (obj) {
    Object.keys(obj).forEach((key, index) => {
      let val = obj[key]
      Object.defineProperty(obj, key, {
        get: function () {
          return val
        },
        set: (function (newValue) {
          dealOptions(newValue)
        }).bind(this)
      })
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        observe(obj[key])
      }
    }, this)
  }

  /*
   * deal the options for sjf-scroll
   */
  function dealOptions (val) {
    console.log('the new val is ' + val)
  }

  // The interface for users to set options
  function setOptions (option) {
    if (!isObject(option)) {
      console.error('sjf-scroll:[error] options must be a object but ' + 
        JSON.stringify(option) + ' is not a object')
      return
    }
    for (let prop in option) {
      if (options.hasOwnProperty(prop)) {
        options[prop] = option[prop]
      } else {
        console.warn('sjf-scroll:[warn] sjf-scroll has not support the configuration item of ' + prop)
      }
    }
  }

  /*
   * This is to deal the scroll move 
   * @param relative is a object of the assembly of element which is relatived to the scroll event
   * @param disY is the distance of the vertical direction between mouse and .sjf-scroll-bg'scrollTop
   */
  function scroll (relative, event, disY) {
    var newEvent = event || window.event
    var len = newEvent.clientY - disY
    if (len < 0) {
      len = 0;
    } else if (len > relative.bg.offsetHeight - relative.content.offsetHeight) {
      len = relative.bg.offsetHeight - relative.content.offsetHeight
    }
    relative.content.style.top = position.cTop + len + 'px'
    relative.body.style.top = position.oTop - len * (relative.body.offsetHeight / relative.self.offsetHeight) + 'px'
    position.cTop = len
    position.oTop = -len * (relative.body.offsetHeight / relative.self.offsetHeight)
  }

  /*
   * This is to deal the wheel event
   */
  function changeLocation (relative, event) {
    var newEvent = event || window.event
    newEvent.stopPropagation ? newEvent.stopPropagation() : newEvent.cancelBubble = true
    newEvent.preventDefault ? newEvent.preventDefault() : newEvent.returnValue = false

    var direction = newEvent.detail || newEvent.wheelDelta
    var bgHeight = relative.bg.offsetHeight
    var bodyHeight = relative.body.offsetHeight
    var contentHeight = relative.content.offsetHeight
    var selfHeight = relative.self.offsetHeight
    var distance = bgHeight - contentHeight - options.gradient
    if (direction <= 0) {
      if (position.cTop >= distance) {
        position.cTop = bgHeight - contentHeight
        position.oTop = -(bodyHeight - selfHeight)
      } else {
        position.oTop -= options.gradient * (bodyHeight / selfHeight)
        position.cTop += options.gradient
      }
    } else {
      if (position.cTop <= options.gradient) {
        position.cTop = 0
        position.oTop = 0
      } else {
        position.oTop += options.gradient * (bodyHeight / selfHeight)
        position.cTop -= options.gradient
      }
    }
    relative.body.style.top = position.oTop + 'px'
    relative.content.style.top = position.cTop + 'px'
  }

  /*
   * the series of mouse events on scroll object 
   */
  var operate = {
    down: function (obj, event) {
      var event = event || window.event
      var relative = getRelativeEle(obj)
      var disY = event.clientY - relative.bg.scrollTop
      document.onmousemove = function (ev) {
        operate.move(ev, relative, disY)
      }
      document.onmouseup = function () {
        operate.up()
      }
    },
    move: function (event, relative, disY) {
      scroll(relative, event, disY)
    },
    over: function (obj, event) {
      var newEvent = event || window.event
      debounce(function () {
        operate.wheel(obj, newEvent)
      })()
    },
    up: function () {
      document.onmousemove = null
      document.onmouseup = null
    },
    wheel: function (obj, event) {
      var newEvent = event || window.event
      var relative = getRelativeEle(obj)
      var disY = newEvent.clientY - relative.bg.scrollTop
      var navigator = navigator || window.navigator
      if (navigator.userAgent.toLowerCase().indexOf('firefox') < 0) {
        relative.self.onmousewheel = function (ev) {
          changeLocation(relative, ev)
        }
      } else {
        obj.addEventListener('DOMMouseScroll', function (ev) {
          changeLocation(relative, ev)
        })
      }
    }
  }

  // init the sjf-scroll
  function initScroll () {
    watchOptions(options)
    getMaxHeight()
  }

  return {
    initScroll: initScroll,
    setOptions: setOptions
  }
})
