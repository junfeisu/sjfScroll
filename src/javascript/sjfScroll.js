import utils from './utils'

/*
 * This is the options for sjf-scroll
 * @param delay is the time to deal the mouse events on the scroll-wrapper
 * @param gradient is the The unit of progress for wheel or keydown events
 * @param minHeight is min height of .sjf-scroll-content
 */
const options = {
  delay: 500,
  gradient: 10,
  minHeight: 30
}

let scrollCallBack = null

/*
 * This is the param for sjf-scroll postion 
 * @param cTop is the top of sjf-scroll-content
 * @param oTop is the top of sjf-scroll-body
 * @param oldClientY is the old position of sjf-scroll move event
 */
let currentPosition = {}

/*
 * Load the style file
 */
const loadStyle = () => {
  let head = document.querySelector('head')
  let style = document.createElement('link')
  style.href = 'http://7xrp7o.com1.z0.glb.clouddn.com/sjf-scroll.css' 
  style.rel = 'stylesheet'
  style.type = 'text/css'
  head.appendChild(style)
}

/*
 * To get the dom for The corresponding event
 */
const getRelativeElement = (obj) => {
  return {
    body: obj.querySelector('.sjf-scroll-body'),
    bg: obj.querySelector('.sjf-scroll-bg'),
    content: obj.querySelector('.sjf-scroll-content'),
    self: obj
  }
}

/*
 * to get the height of the Specific dom
 */
const getRelativeHeight = (obj) => {
  return {
    bodyHeight: obj.querySelector('.sjf-scroll-body').offsetHeight,
    bgHeight: obj.querySelector('.sjf-scroll-bg').offsetHeight,
    contentHeight: obj.querySelector('.sjf-scroll-content').offsetHeight,
    selfHeight: obj.offsetHeight
  }
}

/*
 * watch the object
 * @param obj is the object to be watched
 */
const watchOptions = (obj) => {
  if (!utils.isObject(obj)) {
    console.warn('sjf-scroll:[warn] the param is not a object')
  } else {
    utils.observe(obj)
  }
}

/*
 * deal the options for sjf-scroll
 */
function dealOptions (val) {
  console.log('the new val is ' + val)
}

/* 
 * The interface for users to set options
 */
const setOptions = (option) => {
  if (!utils.isObject(option)) {
    console.error('sjf-scroll:[error] options must be a object but ' + 
      JSON.stringify(option) + ' is not a object')
    return
  }
  for (var prop in option) {
    options.hasOwnProperty(prop) ? options[prop] = option[prop] : 
      console.warn('sjf-scroll:[warn] sjf-scroll do not support the configuration item of ' + prop)
  }
}

/*
 * get the living example entrance of sjf-scroll
 */
const getMaxHeight = () => {
  let scrolls = document.querySelectorAll('[sjf-scroll]')
  if (scrolls.length !== 0) {
    Array.prototype.forEach.call(scrolls, (value) => {
      let maxHeight = value.getAttribute('max-height')
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
const rewriteDom = (obj, maxHeight) => {
  let initHtml = obj.innerHTML
  let clonedObj = obj.cloneNode(true)
  obj.parentElement.insertBefore(clonedObj, obj)
  obj.classList.add('hide-old')
  initHtml = '<div class="sjf-scroll-wrapper"><div class="sjf-scroll-body">' + initHtml + 
    '</div><div class="sjf-scroll-bg"><span class="sjf-scroll-content"></span></div></div>'
  clonedObj.innerHTML = initHtml
  setHeight(clonedObj, maxHeight)
  addMutationObserver(obj, maxHeight)
}

/*
 * to set the height of scroll
 */ 
const setHeight = (obj, maxHeight) => {
  var wrapper = obj.querySelector('.sjf-scroll-wrapper')
  var bg = obj.querySelector('.sjf-scroll-bg')
  var content = obj.querySelector('.sjf-scroll-content')
  var body = obj.querySelector('.sjf-scroll-body')
  var offsetHeight = body.offsetHeight || body.clientHeight

  if (offsetHeight > maxHeight) {
    bg.style.display = 'block'
    bindEvent(obj)
  } else {
    bg.style.display = 'none'
    cancelBindEvent(obj)
  }
  wrapper.style.height = maxHeight + 'px'
  bg.style.height = maxHeight + 'px'
  var prevHeight = (maxHeight * maxHeight) /offsetHeight
  prevHeight = prevHeight > options.minHeight ? prevHeight : options.minHeight
  content.style.height = prevHeight + 'px'
}

/*
 * to watch the change of dom structure of hide-old
 * @oldObj is the dom which is to be watched
 */ 
const addMutationObserver = (oldObj, maxHeight) => {
  var MutationObserver = window.MutationObserver || window.WebkitMutationObserver
    || window.MozMutationObserver

  var mutationObserverConfig = {
    childList: true,
    subtree: true
  }

  var observer = new MutationObserver((mutationRecord) => {
    keepAway(oldObj, maxHeight)
  })

  observer.observe(oldObj, mutationObserverConfig)
}

/*
 * to bind the relative event on the sjf-scroll
 */
const bindEvent = (obj) => {
  var wrapper = obj.querySelector('.sjf-scroll-wrapper')
  var bg = obj.querySelector('.sjf-scroll-bg')
  var content = obj.querySelector('.sjf-scroll-content')
  var isFirst = true

  wrapper.onmouseover = function (event) {
    if (isFirst) {
      var position = this.getAttribute('position')
      position !== null ? currentPosition = JSON.parse(this.getAttribute('position')) :
        currentPosition = {cTop: 0, oTop: 0, oldClientY: 0}
      isFirst = false
    }
    var newEvent = event || window.event
    utils.debounce(() => {
      operate.wheel(obj, newEvent)
      operate.keydown(obj, newEvent)
    })()
    this.onmouseleave = () => {
      this.setAttribute('position', JSON.stringify(currentPosition))
      isFirst = true
    }
  }

  bg.onclick = (event) => {
    operate.click(obj, event)
  }

  content.onclick = (event) => {
    var newEvent = event || window.event
    newEvent.stopPropagation ? newEvent.stopPropagation() : window.cancelBubble = false
    return false
  }

  content.onmousedown = (event) => {
    operate.down(obj, event)
  }
}

/*
 * cancel the event bind on the sjf-scroll
 */
const cancelBindEvent = (obj) => {
  var wrapper = obj.querySelector('.sjf-scroll-wrapper')
  var bg = obj.querySelector('.sjf-scroll-bg')
  var content = obj.querySelector('.sjf-scroll-content')

  wrapper.onmouseover = null
  bg.onclick = null
  content.onclick = null
  content.onmousedown = null
  obj.onmousewheel = null
  obj.removeEventListener('DOMMouseScroll', (ev) => {
    changeLocation(relative, ev, true)
  }, false)
}

/*
 * keep the html structure of old away with the html strcture of new 
 */
const keepAway = (obj, maxHeight) => {
  var newObj = obj.previousElementSibling
  var sjfScrollBody = newObj.querySelector('.sjf-scroll-body')
  sjfScrollBody.innerHTML = obj.innerHTML
  setHeight(newObj, maxHeight)
}

/*
 * This is to deal the scroll move 
 * @param relative is a object of the assembly of element which is relatived to the scroll event
 */
const scroll = (relative, event) => {
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

/*
 * check is to reach the boundary of drag event
 */
const moveBoundary = (len, list) => {
  if (len <= -currentPosition.cTop) {
    len = -currentPosition.cTop
  } else if (len >= list.bgHeight - list.contentHeight - currentPosition.cTop) {
    len = list.bgHeight - list.contentHeight - currentPosition.cTop
  }
  return len
}

/*
 * change the position of sjf-scroll-content to the designated spot directly
 */ 
const scrollTo = (param) => {
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
const clickBoundary = (distance, list) => {
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
const changeLocation = (relative, event, condition) => {
  var newEvent = event || window.event
  newEvent.stopPropagation ? newEvent.stopPropagation() : newEvent.cancelBubble = true
  newEvent.preventDefault ? newEvent.preventDefault() : newEvent.returnValue = false

  var heightList = getRelativeHeight(relative.self)

  /*
   * to judge the direction 
   * and made special treatment to wheel events of firefox direction
   */ 
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

const checkBoundary = (direction, value) => {
  var result = false
  if (direction === 'down') {
    if (currentPosition.cTop >= value['down'].boundaryCondition) {
      currentPosition.cTop = value['down'].cBoundary
      currentPosition.oTop = value['down'].oBoundary
      result = true
      if(scrollCallBack && typeof onScroll === 'function') {
        scrollCallBack()
      }
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
  click (obj, event) {
    var newEvent = event || window.event
    var relative = getRelativeElement(obj)
    var disY = newEvent.clientY + document.body.scrollTop
    scrollTo({spot: disY, relativeDom: relative})
  },
  down (obj, event) {
    var event = event || window.event
    var relative = getRelativeElement(obj)
    var disY = event.clientY - relative.bg.scrollTop
    currentPosition.oldClientY = disY
    document.onmousemove = (ev) => {
      operate.move(relative, ev)
    }
    document.onmouseup = () => {
      operate.up()
    }
  },
  move (obj, event) {
    scroll(obj, event)
  },
  keydown (obj) {
    document.onkeydown = (event) => {
      var newEvent = window.event || event
      var relative = getRelativeElement(obj)
      if (newEvent.keyCode === 38 || newEvent.keyCode === 40) {
        changeLocation(relative, newEvent, newEvent.keyCode)
      }
    }
  },
  up () {
    document.onmousemove = null
    document.onmouseup = null
  },
  wheel (obj, event) {
    var newEvent = event || window.event
    var relative = getRelativeElement(obj)
    if (navigator.userAgent.toLowerCase().indexOf('firefox') < 0) {
      obj.onmousewheel = (ev) => {
        changeLocation(relative, ev, false)
      }
    } else {
      obj.addEventListener('DOMMouseScroll', (ev) => {
        changeLocation(relative, ev, true)
      })
    }
  }
}

const initScroll = () => {
  watchOptions(options)
  loadStyle()
  getMaxHeight()
}

const onScroll = (callback) => {
  if (!callback) {
    console.warn('sjf-scroll:[warn] the sjfScroll.scroll need a argument to'
     + ' as callback function but find none')
  } else {
    scrollCallBack = callback
  }
}

module.exports = {
  initScroll: initScroll,
  setOptions: setOptions,
  scrollTo: scrollTo,
  scroll: onScroll
}