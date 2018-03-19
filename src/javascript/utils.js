import options from './options'

const utils = {
	isObject (obj) {
	  let result = true
	  Object.prototype.toString.call(obj) === '[object Object]' ? '' : result = false
	  return result
	},
	debounce (action) {
    var last;
    return function () {
      var ctx = this, args = arguments
      clearTimeout(last)
      last = setTimeout(function () {
        action.apply(ctx, args)
      }, options.delay)
    }
  },
  observe (obj) {
    Object.keys(obj).forEach(function (key, index) {
      var val = obj[key]
      Object.defineProperty(obj, key, {
        get: function () {
          return val
        },
        set: (function (newValue) {
          obj.key = newValue
        }).bind(this)
      }) 
      // For depth monitoring on object properties
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        observe(obj[key])
      }
    }, this)
  }
}

export default utils
