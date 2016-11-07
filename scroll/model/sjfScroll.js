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
    isShow: false,
    delay: 1000
  }

  // Determine whether as an object
  function isObject (obj) {
    var result = true
    Object.prototype.toString.call(obj) === '[object Object]' ? '' : result = false
    return result
  }

  /*
   * change the DOM structure of sjf-scroll
   */
  function getMaxHeight () {
    var scrolls = document.querySelectorAll('.sjf-scroll')
    scrolls.forEach(value => {
      var maxHeight = value.getAttribute('max-height')
      maxHeight === null ? options.isShow = false : isOver(value, maxHeight)
    })
  }

  function isOver (obj, maxHeight) {
    var parent = obj.parentNode
    var offsetHeight = obj.offsetHeight || obj.clientHeight
    var initHtml = obj.innerHTML

    offsetHeight > maxHeight ? options.isShow = true : options.isShow = false
    initHtml = '<div class="sjf-scroll-wrapper"><div class="sjf-scroll">' + initHtml + '</div><div class="sjf-scroll-bg"><span class="sjf-scroll-content"></span></div>'
    parent.innerHTML = initHtml
    console.log(initHtml)
    console.log(document.querySelector('.hello'))
    debugger

  }

  /*
   * watch the object
   * @param obj is the object to be watched
   */
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

  function watchOptions (obj) {
    if (!isObject(obj)) {
      console.log('the param is not a object')
    } else {
      observe (obj)
    }
  }
  
  /*
   * deal the options for sjf-scroll
   */
  function dealOptions (val) {
    console.log('the new val is ' + val)
  }

  // set the options of sjf-scroll
  function setOptions (option) {
    if (!isObject(option)) {
      console.log('sjf-scroll:[error]' + JSON.stringify(option) + ' is not a object')
      return
    }
    for (let prop in option) {
      if (options.hasOwnProperty(prop)) {
        options[prop] = option[prop]
      } else {
        console.log('sjf-scroll:[warn] sjf-scroll has not support the configuration item of ' + prop)
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
