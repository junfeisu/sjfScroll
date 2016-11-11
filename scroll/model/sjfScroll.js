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

  /*
   * This is the param for sjf-scroll postion 
   * @param cTop is the top of sjf-scroll-content
   * @param oTop is the top of sjf-scroll-body
   * @param oldClientY is the old position of sjf-scroll move event
   */
  var position = {
    cTop: 0,
    oTop: 0,
    oldClientY: 0
  }

  // init the sjf-scroll
  function initScroll () {
    watchOptions(options)
    getMaxHeight()
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

  function getRelativeHeight (obj) {
    return {
      bodyHeight: obj.querySelector('.sjf-scroll-body').offsetHeight,
      bgHeight: obj.querySelector('.sjf-scroll-bg').offsetHeight,
      contentHeight: obj.querySelector('.sjf-scroll-content').offsetHeight,
      selfHeight: obj.offsetHeight
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

  // get the living example entrance of sjf-scroll
  function getMaxHeight () {
    var scrolls = document.querySelectorAll('.sjf-scroll')
    Array.prototype.forEach.call(scrolls, value => {
      var maxHeight = value.getAttribute('max-height')
      if (maxHeight === null) {
        console.error('sjf-scroll: [error]' + 
          'please add a attribute["max-height": value&int] on ".sjf-scroll"' + 
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
      var newEvent = event || window.event
      debounce(function () {
        operate.wheel(obj, newEvent)
        operate.keydown(obj, newEvent)
      })()
    }

    bg.onclick = function (event) {
      operate.click(obj, event)
    }

    content.onclick = function (event) {
      var newEvent = event || window.event
      newEvent.stopPropagation ? newEvent.stopPropagation() : window.cancelBubble = false
      return false
    }

    content.onmousedown = function (event) {
      operate.down(obj, event)
    }
  }

  /*
   * This is to deal the scroll move 
   * @param relative is a object of the assembly of element which is relatived to the scroll event
   */
  function scroll (relative, event) {
    var len
    var newEvent = event || window.event
    var initTop = relative.self.offsetTop

    var heightList = getRelativeHeight(relative.self)

    len = newEvent.clientY - position.oldClientY
    len = moveBoundary(len, relative)

    position.cTop += len
    position.oTop -= len * (heightList.bodyHeight / heightList.selfHeight)
    relative.content.style.top = position.cTop + 'px'
    relative.body.style.top = position.oTop + 'px'

    position.oldClientY = newEvent.clientY
  }

  // check is to reach the boundary
  function moveBoundary (len, relative) {
    var heightList = getRelativeHeight(relative.self)
    if (len <= -position.cTop) {
      len = -position.cTop
    } else if (len >= heightList.bgHeight - heightList.contentHeight - position.cTop) {
      len = heightList.bgHeight - heightList.contentHeight - position.cTop
    }
    return len
  }

  // direct change to the designated spot
  function scrollTo (param) {
    typeof param === 'undefined' ? 
      console.error('the sjfScroll.scrollTo needs a param {spot: , relativeDom}') : 
      !param.hasOwnProperty('spot') || !param.hasOwnProperty('relativeDom') ? 
        console.error('param has a attribtue[spot] to set the designated spot' +
         'param has a attribte[relativeDom]  to set the relative dom element') :
        (function () {
          var distance = param.spot - param.relativeDom.self.offsetTop
          var heightList = getRelativeHeight(param.relativeDom.self)
          clickBoundary(distance, heightList)
          param.relativeDom.body.style.top = position.oTop + 'px'
          param.relativeDom.content.style.top = position.cTop + 'px'
        })()
  }

  function clickBoundary (distance, list) {
    var maxCTop = list.bgHeight - list.contentHeight
    var maxOTop = list.bodyHeight - list.selfHeight
    var upperBoundary = list.bgHeight - list.contentHeight / 2
    if (distance >= list.contentHeight / 2 && distance <= upperBoundary) {
      position.cTop = distance - list.contentHeight / 2
      position.oTop = -(list.contentHeight / 2 + distance) * 
        (list.bodyHeight / list.selfHeight)
    } else if (distance < list.contentHeight / 2) {
      position.cTop = 0
      position.oTop = 0
    } else if (distance > upperBoundary) {
      position.cTop = maxCTop
      position.oTop = -maxOTop
    }
  }

  /*
   * This is to deal the wheel event
   * @param relative is the relative dom element
   * @isFirefox is to judge is the browser is firefox
   */
  function changeLocation (relative, event, isFirefox) {
    var newEvent = event || window.event
    newEvent.stopPropagation ? newEvent.stopPropagation() : newEvent.cancelBubble = true
    newEvent.preventDefault ? newEvent.preventDefault() : newEvent.returnValue = false

    var heightList = getRelativeHeight(relative.self)
    
    var direction = isFirefox ? -newEvent.detail : newEvent.wheelDelta
    var distance = heightList.bgHeight - heightList.contentHeight - options.gradient

    if (direction <= 0) {
      if (position.cTop >= distance) {
        position.cTop = heightList.bgHeight - heightList.contentHeight
        position.oTop = -(heightList.bodyHeight - heightList.selfHeight)
      } else {
        position.oTop -= options.gradient * (heightList.bodyHeight / heightList.selfHeight)
        position.cTop += options.gradient
      }
    } else {
      if (position.cTop <= options.gradient) {
        position.cTop = 0
        position.oTop = 0
      } else {
        position.oTop += options.gradient * (heightList.bodyHeight / heightList.selfHeight)
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
    click: function (obj, event) {
      var newEvent = event || window.event
      var relative = getRelativeEle(obj)
      var disY = newEvent.clientY + document.body.scrollTop
      scrollTo({spot: disY, relativeDom: relative})
    },
    down: function (obj, event) {
      var event = event || window.event
      var relative = getRelativeEle(obj)
      var disY = event.clientY - relative.bg.scrollTop
      position.oldClientY = disY
      document.onmousemove = function (ev) {
        operate.move(relative, ev)
      }
      document.onmouseup = function () {
        operate.up()
      }
    },
    move: function (obj, event) {
      scroll(obj, event)
    },
    keydown: function (obj) {
      document.onkeydown = function (event) {
        var newEvent = window.event || event
        if (newEvent.keyCode === 38) {
          console.log('up')
        } else if (newEvent.keyCode === 40) {
          console.log('down')
        }
      }
    },
    up: function () {
      document.onmousemove = null
      document.onmouseup = null
    },
    wheel: function (obj, event) {
      var newEvent = event || window.event
      var relative = getRelativeEle(obj)
      if (navigator.userAgent.toLowerCase().indexOf('firefox') < 0) {
        obj.onmousewheel = function (ev) {
          changeLocation(relative, ev, false)
        }
      } else {
        obj.addEventListener('DOMMouseScroll', function (ev) {
          changeLocation(relative, ev, true)
        })
      }
    }
  }

  return {
    initScroll: initScroll,
    setOptions: setOptions,
    scrollTo: scrollTo
  }
})
