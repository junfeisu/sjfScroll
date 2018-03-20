<div align="center">
  <img src="http://7xrp7o.com1.z0.glb.clouddn.com/sparrow.png" width="100" height="100" alt="">
</div>

# sjf-scroll
> A simple custom scroll npm package. It is made according to the browser's scroll bar. So it can support most browser's feature.For example, it supports the mousewheel, drag and click event etc.

## Usage 

  1. Install the npm package 

        npm install sjf-scroll

  2. Add the script to initialize sjfScroll after dom onloaded

        import sjfScroll from 'sjf-scroll'
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
      minHeight: 30 // default value
    }

  * The option `delay` is to set the time the mouse is suspended in the sjf-scroll before executing other events
    (鼠标停留在sjf-scroll多久才会执行滚轮事件或者键盘事件)

  * The option `gradient` is to set the change unit of wheel or keydown events
    (滚一下滚动10px或者上翻10px)

  * The option `minHeight` is to set the min height of the sjf-scroll-content(the part is to show the progress of scroll)

  * the user to set the options API is sjfScroll.setOptions(param)
  
    the param is a object which contains one attribute or more of options

  * the user can load some other thing through the sjfScroll.scroll to set the function of callback

And now you can use sjf-scroll in your project easily

