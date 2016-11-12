<img style="display: flex" src="http://7xrp7o.com1.z0.glb.clouddn.com/sparrow.png" width="100" height="100" alt="">
# sjf-scroll
> A simple custom scroll framework. It is made according to the browser's scroll bar. So it can support most browser's feature.For example, it supports the mousewheel, drag and click event etc.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080 and you can through it to look the example of sjf-scroll
npm run dev

```
## Usage 

  1. Import the sjf-scroll.css and sjfScroll.js into your project 

        <link rel="stylesheet" href="http://7xrp7o.com1.z0.glb.clouddn.com/sjf-scroll.css">
        <script src="http://7xrp7o.com1.z0.glb.clouddn.com/sjfScroll.js"></script>

  2. Add the script to initialize sjfScroll after dom onloaded

        window.onload = function () {
          sjfScroll.initScroll()
        }

      if you use es6, you can do it like this:

        import sjfScroll from 'http://7xrp7o.com1.z0.glb.clouddn.com/sjfScroll.js'
        sjfScroll.initScroll()

  3. Add the entrance of the sjf-scroll.

        <div sjf-scroll max-height="150"></div>
  
    * The sjfScroll.js is to search the element with the attribute of 'sjf-scroll'. And rewriting the dom structure to realize the function

    * The attribute `max-height` is set to show the scroll bar when sjf-scroll content's height beyond it.

    * The default value of attribute `max-height` is 150 and the value you set best to greater than or equal to 150

## options
The sjf-scroll supports options for users to set
    
    {
      delay: 1000, // default value
      gradient: 10 // default value
    }

  * The option `delay` is to set the time the mouse is suspended in the sjf-scroll before executing other events
    (鼠标停留在sjf-scroll多久才会执行滚轮事件或者键盘事件)

  * The option `gradient` is to set the change unit of wheel or keydown events
    (滚一下滚动10px或者上翻10px)

  * the user to set the options API is sjfScroll.setOptions(param)
  
    the param is a object which contains one attribute or more of options

And now you can use sjf-scroll in your project easily

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
