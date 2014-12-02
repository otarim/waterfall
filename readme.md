#瀑布流插件(Waterfall)
---
####属性
===
**colWrap**

	指定瀑布流的父元素,无默认值,必须
	
**colClass**

	瀑布流的类名,无默认值,必须
	
**colPrefix**

	用于辨别瀑布流的唯一标示的前缀,默认值为当前时间戳
	
**imgClass**

	瀑布流中图片的类名,无默认值,必须
	
**colNum**

	瀑布流的列数,默认值为4
	
**columnHeight**

	瀑布流的默认高度，默认值[0,0,0,0],可选
	
**specialColHeight**

	特殊列的初始化高度，无默认值，可选
	
**maxColNum**

	瀑布流的最大列数，无默认值，可选
	
**minColNum**

	瀑布流的最小列数，无默认值，可选
	
**resize**

	是否根据窗体自适应瀑布流，可选，默认 false
	
**colWidth**

	瀑布流的列宽,无默认值,必须
	
**flexWidth**

	瀑布流中图片的宽度,无默认值,必须
	
**distance**

	用于滚动加载的位移值,超过此位移则触发瀑布流加载动作,默认值为0
	
**pageNum**

	每次加载的瀑布数,默认值为15
	
**gutterWidth,gutterHeight**

	瀑布们之间的间距,默认值为20
	
**fetchBtn**

	如果指定了,那么瀑布加载方式为点击加载,默认滚动加载
	
**animate**

	是否开启动画效果，默认关闭
	
**maxPage**

	最大的滚动加载次数,超过次数则滚动或者点击不再加载,无默认值
	
**maxNum**

	最大的瀑布数,超过此数量则不再加载,无默认值
	
**hasLayout**

	接口是否存在 layout 字段，需要配合 customProperty 使用，默认为 false
	
**customProperty**

	自定义的 layout 字段，依赖 hasLayout 属性
	
*sid*

	当前所有瀑布的数量
	
*page*

	当前页数
	
*data*

	fetch方法获取的数据
	
*todo*

	所有瀑布元素的集合
	
*__imgQueue*(debug)

	待处理的队列

*____animateQueue*(debug)

	待处理的动画队列
	
*__lock*(debug)

	当前请求数据请求锁状态	
	
####方法
====

**fetch(callback)**
	
	每次加载瀑布们之前会执行的函数,用于获取瀑布流数据,必须
	如果使用ajax,务必在ajax的onload中触发callback
	callback(data,key): 用于重建瀑布流,必须
			data: 待处理的数据.json
			key: data中对应的图片路径的键值
			
**template(data)**

	返回瀑布的模板文件,需要return瀑布的模板变量,必须
	
**onPrepend(dom)**

	每次插入瀑布执行的函数
	dom: 指向当前插入的瀑布

**onResize(colNum)**

	每次调整窗体的时候触发的回调函数
	colNum: 当前的列数（调整后）
	
	
**onprocess()**

	加载瀑布的时候触发的函数,比如加载的时候现在加载进度条
	
**onDone()**

	每次加载完所有瀑布执行的函数
	
***imgDone(img)***(加载完单个瀑布的时候触发)

	瀑布中图片的onload事件
	img :指向该图片
	img.naturalwidth: 返回该图片的原始宽度
	img.naturalheight: 返回该图片的原始高度
	
***imgError(err)***(如果加载图片发生错误,那么跳过该图片)

	瀑布中图片的onerror事件
	
*switchEvent(boolean)*

	手动开关加载事件
	
*fetchData*

	主动触发瀑布流获取数据的操作
	
###更新日记:

1. 140304修复了动画在ie下面高cpu占用的问题(现在使用动画队列,保证只有一个计数器存在)
2. 140304修复了部分事件的触发时机
3. 140314修复了firefox报下naturalWidth以及naturalHeight无法为setter的错误
4. 140314修复了一个可能引起onDone无法触发的bug
5. 140530修复了ie下滚动触发的问题
6. 140626增加了参数columnHeight
7. 140702增加了参数resize,用于根据窗体宽度自适应瀑布流（需要动画的话，可以在瀑布元素上面加 css 的 transition 属性，低级浏览器放弃过渡动画）
8. 140703增加了特殊列初始化高度参数 specialColHeight 以及最大列数 maxColNum,最小列数 minColNum
9. 140704增加了 onResize 方法
10. 140714增加了 fetchData 方法
11. 140802增加了对于自带图片尺寸接口的支持，如果返回接口存在图片尺寸字段，那么就不调用预获取尺寸的方法，直接布局渲染。
12. 140802修复图片原始尺寸属性无效的问题。

	
###demo:

[waterfall.html](waterfall.html)
	

	

	
