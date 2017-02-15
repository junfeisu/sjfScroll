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
   * @param delay is the time to deal the mouse events on the scroll-wrapper
   * @param gradient is the The unit of progress for wheel or keydown events
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
  var currentPosition = {}

  // Determine whether as an object
  function isObject (obj) {
    var result = true
    Object.prototype.toString.call(obj) === '[object Object]' ? '' : result = false
    return result
  }

  // To get the dom for The corresponding event
  function getRelativeEle (obj) {
    return {
      body: obj.querySelector('.sjf-scroll-body'),
      bg: obj.querySelector('.sjf-scroll-bg'),
      content: obj.querySelector('.sjf-scroll-content'),
      self: obj
    }
  }

  // to get the height of the Specific dom
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
    Object.keys(obj).forEach(function(key, index) {
      var val = obj[key]
      Object.defineProperty(obj, key, {
        get: function () {
          return val
        },
        set: (function (newValue) {
          dealOptions(newValue)
        }).bind(this)
      }) 
      // For depth monitoring on object properties
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
    for (var prop in option) {
      options.hasOwnProperty(prop) ? options[prop] = option[prop] : 
        console.warn('sjf-scroll:[warn] sjf-scroll do not support the configuration item of ' + prop)
    }
  }

  // get the living example entrance of sjf-scroll
  function getMaxHeight () {
    var scrolls = document.querySelectorAll('[sjf-scroll]')
    if (scrolls.length !== 0) {
      Array.prototype.forEach.call(scrolls, function(value) {
        var maxHeight = value.getAttribute('max-height')
        maxHeight !== null ? +maxHeight < 150 ? 
            console.warn('sjf-scroll:[warn] the value of max-height best is >= 150') : 
            '' :
          maxHeight = 150
        rewriteDom(value, maxHeight)
      })
    } else {
      console.error('At least need a .sjf-scroll in your dom for example:' + 
        '<div class="sjf-scroll"></div>')
    }
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

    var isFirst = true
    wrapper.onmouseover = function (event) {
      if (isFirst) {
        var position = this.getAttribute('position')
        position !== null ? currentPosition = JSON.parse(this.getAttribute('position')) :
          currentPosition = {cTop: 0, oTop: 0, oldClientY: 0}
        isFirst = false
      }
      var newEvent = event || window.event
      debounce(function () {
        operate.wheel(obj, newEvent)
        operate.keydown(obj, newEvent)
      })()
      this.onmouseleave = function () {
        this.setAttribute('position', JSON.stringify(currentPosition))
        isFirst = true
      }
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
    var newEvent = event || window.event
    var heightList = getRelativeHeight(relative.self)
    var len = newEvent.clientY - currentPosition.oldClientY

    len = moveBoundary(len, heightList)

    currentPosition.cTop += len
    currentPosition.oTop -= len * (heightList.bodyHeight / heightList.selfHeight)
    relative.content.style.top = currentPosition.cTop + 'px'
    relative.body.style.top = currentPosition.oTop + 'px'

    currentPosition.oldClientY = newEvent.clientY
  }

  // check is to reach the boundary of drag event
  function moveBoundary (len, list) {
    if (len <= -currentPosition.cTop) {
      len = -currentPosition.cTop
    } else if (len >= list.bgHeight - list.contentHeight - currentPosition.cTop) {
      len = list.bgHeight - list.contentHeight - currentPosition.cTop
    }
    return len
  }

  // direct change to the designated spot
  function scrollTo (param) {
    typeof param === 'undefined' ? 
      console.error('the sjfScroll.scrollTo needs a param {spot: , relativeDom}') : 
      !param.hasOwnProperty('spot') || !param.hasOwnProperty('relativeDom') ? 
        console.error('param has a attribtue[spot] to set the designated spot' +
         'param has a attribte[relativeDom] to set the relative dom element') :
        (function () {
          var distance = param.spot - param.relativeDom.self.offsetTop
          var heightList = getRelativeHeight(param.relativeDom.self)
          clickBoundary(distance, heightList)
          param.relativeDom.body.style.top = currentPosition.oTop + 'px'
          param.relativeDom.content.style.top = currentPosition.cTop + 'px'
        })()
  }

  // check is to reach the boundary of click event
  function clickBoundary (distance, list) {
    var maxCTop = list.bgHeight - list.contentHeight
    var maxOTop = list.bodyHeight - list.selfHeight
    var upperBoundary = list.bgHeight - list.contentHeight / 2
    if (distance >= list.contentHeight / 2 && distance <= upperBoundary) {
      currentPosition.cTop = distance - list.contentHeight / 2
      currentPosition.oTop = -(distance - list.contentHeight / 2) * 
        (list.bodyHeight / list.selfHeight)
    } else if (distance < list.contentHeight / 2) {
      currentPosition.cTop = 0
      currentPosition.oTop = 0
    } else if (distance > upperBoundary) {
      currentPosition.cTop = maxCTop
      currentPosition.oTop = -maxOTop
    }
  }

  /*
   * This is to deal the wheel event
   * @param relative is the relative dom element
   * @condition is to judge the direction
   */
  function changeLocation (relative, event, condition) {
    var newEvent = event || window.event
    newEvent.stopPropagation ? newEvent.stopPropagation() : newEvent.cancelBubble = true
    newEvent.preventDefault ? newEvent.preventDefault() : newEvent.returnValue = false

    var heightList = getRelativeHeight(relative.self)

    // to judge the direction 
    // and made special treatment to wheel events of firefox direction
    var direction = 'down'
    if (typeof condition === 'boolean') {
      // this is the wheel event
      var judge = condition ? -newEvent.detail : newEvent.wheelDelta
      direction = judge <= 0 ? 'down' : 'up'
    } else {
      // this is the keydown event
      direction = condition === 38 ? 'up' : 'down'
    }

    var distance = heightList.bgHeight - heightList.contentHeight - options.gradient
    var unit = options.gradient * (heightList.bodyHeight / heightList.selfHeight)

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
    }

    // check is to reach the boundary of wheel event and keydown event
    if (!checkBoundary(direction, directionValue)) {
      currentPosition.oTop += directionValue[direction].oGradient
      currentPosition.cTop += directionValue[direction].cGradient
    }

    relative.body.style.top = currentPosition.oTop + 'px'
    relative.content.style.top = currentPosition.cTop + 'px'
  }

  function checkBoundary (direction, value) {
    var result = false
    if (direction === 'down') {
      if (currentPosition.cTop >= value['down'].boundaryCondition) {
        currentPosition.cTop = value['down'].cBoundary
        currentPosition.oTop = value['down'].oBoundary
        result = true
      }
    } else {
      if (currentPosition.cTop <= value['up'].boundaryCondition) {
        currentPosition.cTop = value['up'].cBoundary
        currentPosition.oTop = value['up'].oBoundary
        result = true
      }
    }
    return result
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
      currentPosition.oldClientY = disY
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
        var relative = getRelativeEle(obj)
        if (newEvent.keyCode === 38 || newEvent.keyCode === 40) {
          changeLocation(relative, newEvent, newEvent.keyCode)
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

  // init the sjf-scroll
  function initScroll () {
    watchOptions(options)
    getMaxHeight()
  }

  return {
    initScroll: initScroll,
    setOptions: setOptions,
    scrollTo: scrollTo
  }
})
