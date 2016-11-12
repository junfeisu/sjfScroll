# sjf-scroll

> A simple custom scroll framework. it is according to the browser's scroll bar to make. So it is support most browser's feature.For example, it support the mousewheel and drag and click etc events.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080 and you can through it to look the sjf-scroll example
npm run dev

```
## Usage 

  1. import the sjf-scroll.css and sjfScroll.js into your project 

        <link rel="stylesheet" href="http://7xrp7o.com1.z0.glb.clouddn.com/sjf-scroll.css">
        <script src="http://7xrp7o.com1.z0.glb.clouddn.com/sjfScroll.js"></script>

  2. add the script to init sjfScroll after dom onloaded

        window.onload = function () {
          sjfScroll.initScroll()
        }

      if you use es6, you can do it like this:

        import sjfScroll from 'http://7xrp7o.com1.z0.glb.clouddn.com/sjfScroll.js'
        sjfScroll.initScroll()

  3. add the entrance for sjf-scroll.

        <div sjf-scroll max-height="150"></div>
  
    * The sjfScroll.js is to search the element with the attribute of 'sjf-scroll' and rewrite the dom to realize the feature

    * The attribute `max-height` is to set beyond sjf-scroll range shows that the minimum value of the scroll bar.

    * And the default value is 150 and the value you set best to greater than or equal to 150

## options
The sjf-scroll support a options for user to set
    
    {
      delay: 1000, // default value
      gradient: 10 // default value
    }

  * the option `delay` is to set the time suspended on the sjf-scroll before execution
    (鼠标停留在sjf-scroll多久才会执行滚轮事件或者键盘事件)

  * the option `gradient` is to set the unit of progress for wheel or keydown events
    (滚一下滚动10px或者上翻10px)

and now you can use sjf-scroll in your project easliy

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
