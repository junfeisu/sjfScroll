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

  /*
   * change the DOM structure of sjf-scroll
   */
  function getMinHeight () {
    var scrolls = document.querySelectorAll('.sjf-scroll')
    scrolls.forEach(value => {
      var minHeight = value.getAttribute('min-height')
      console.log(minHeight)
      minHeight === null ? options.isShow = false : isOver(value, minHeight)
    })
  }

  function isOver (obj, minHeight) {
    var offsetHeight = obj.offsetHeight || obj.clientHeight
    if (offsetHeight > minHeight) {
      var scroll = document.createElement('div')
      scroll.setAttribute('class', 'sjf-scroll-bg')
      var scrollContent = document.createElement('span')
      scrollContent.setAttribute('class', 'sjf-scroll-content')
      scroll.appendChild(scrollContent)
      obj.appendChild(scroll)
      console.log(document.querySelector('.sjf-scroll-bg'))
    }
  }

  /*
   * watch the object
   * @param obj is the object to be watched
   * @param callback is the method to deal with the object's change 
   */
  function observe (obj) {
    Object.keys(obj).forEach((key, index, keyArray) => {
      let val = obj[key]
      Object.defineProperty(obj, key, {
        get: function () {
          return val
        },
        set: (function (newValue) {
          console.log('the key is' + key)
          dealOptions(newValue)
        }).bind(this)
      })
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        observe(obj[key])
      }
    }, this)
  }

  function watchOptions (obj) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
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

  return {
    setScroll: getMinHeight,
    options: options,
    watch: watchOptions
  }
})
