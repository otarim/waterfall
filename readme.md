#瀑布流插件(Waterfall)
---

####栗子

        function randomNum(begin,end){
			return begin + Math.floor((end - begin) * Math.random())
		}
		//colClass,imgClass,colWidth,flexWidth这四个属性必须跟html以及css中的定义对应上
		var wt = new Waterfall({
			colWrap: document.getElementById('water'),
			colClass: 'sp',
			colPrefix: 'balabala',
			imgClass: 'sp-m',
			colNum: 4,
			columnHeight: [200,10,30,50],
			resize: true,
			colWidth: 222,
			flexWidth: 200,
			duration: 50,
			pageNum: 15,
			gutterWidth: 23,
			gutterHeight: 23,
			fetchBtn: document.getElementById('fetch'),//不定义的话就是滚动加载了
			animate: true,
			maxPage: 2,//不定义的话就没有数量限制
			maxNum: 500,//不定义的话就没有数量限制
			fetch: function(callback){
				var data = [];
				for(var i = 0;i<this.pageNum;i++){
					data.push({
						src: 'http://placekitten.com/' + randomNum(640,891) + '/' + randomNum(640,891),
						author: 'otarim',
						time: new Date().toTimeString(),
						sumary: Date()
					})
				}
				// 如果这里是ajax的话,必须把callback调用放到xhr.onload中或者jq的ajax.onsuccess中执行
				callback(data,'src');
			},
			template: function(){
				// 模板中的占位符对应json格式中对象的各个属性
				var tpl = '<img src="{{src}}" alt="" class="sp-m">'+
				'<div class="sp-cm">'+
					'<img src="http://placekitten.com/28/28" alt="" class="sp-cm-avt">'+
					'<p><strong>{{author}}</strong>下午{{time}}:</p>'+
					'<p>{{sumary}}</p>'+
				'</div>';
				// 记得return模板变量~
				return tpl;
			},
			onPrepend: function(dom){
				// $(dom).fadeOut();
			},
			onprocess: function(){
				// 这里如果要做加载滚动的效果可以在这里定义
				try{
					document.getElementById('r-ga').classList.toggle('r-ga');
				}catch(e){
				}
			},
			onDone: function(){
				try{
					document.getElementById('r-ga').classList.toggle('r-ga');
				}catch(e){
				}
			},
			imgDone: function(img){
			},
			imgError: function(err){
				try {
					console.log(err)
				} catch (e) {

				}
			}
		})
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
	
**resize**

	是否根据窗体自适应瀑布流，可选，默认 false
	
**colWidth**

	瀑布流的列宽,无默认值,必须
	
**flexWidth**

	瀑布流中图片的宽度,无默认值,必须
	
**duration**

	用于滚动加载的位移值,超过此位移则触发瀑布流加载动作,默认值为20
	
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
			
**template**

	返回瀑布的模板文件,需要return瀑布的模板变量,必须
	
**onPrepend(dom)**

	每次插入瀑布执行的函数
	dom: 指向当前插入的瀑布
	
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
	
###更新日记:

1. 140304修复了动画在ie下面高cpu占用的问题(现在使用动画队列,保证只有一个计数器存在)
2. 140304修复了部分事件的触发时机
3. 140314修复了firefox报下naturalWidth以及naturalHeight无法为setter的错误
4. 140314修复了一个可能引起onDone无法触发的bug
5. 140530修复了ie下滚动触发的问题
6. 140626增加了参数columnHeight
7. 140702增加了参数resize,用于根据窗体宽度自适应瀑布流（需要动画的话，可以在瀑布元素上面加 css 的 transition 属性，低级浏览器放弃过渡动画）

	
###demo:

[waterfall.html](waterfall.html)
	

	

	
