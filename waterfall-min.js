!function(a,b,c){var f,d=Array.prototype,e=function(){};if([].forEach||(d.forEach=function(a,b){for(var d=0,e=this.length;e>d;d++)a.apply(b||null,[this[d],d,this]);return this}),[].map||(d.map=function(a,b){var d,e,c=[];for(d=0,e=this.length;e>d;d++)c.push(a.apply(b||null,[this[d],d,this]));return c}),[].indexOf||(d.indexOf=function(a){for(var d,b=0,c=this.length;c>b;b++)if(this[b]==a){d=b;break}return d}),[].some||(d.some=function(a,b){var d,e,c=!1;for(d=0,e=this.length;e>d;d++)if(a.apply(b||null,[this[d],d,this])===!0)return c=!0;return c}),e=b.getElementsByClassName?function(a,b){return a.getElementsByClassName(b)}:function(a,b){var h,f,g,d=[],e=a.getElementsByTagName("*");for(f=0,g=e.length;g>f;f++)h=e[f],h.className===b&&d.push(h);return e=c,d},"function"!=typeof Object.create&&function(){var a=function(){};Object.create=function(b){if(arguments.length>1)throw Error("Second argument not supported");if(null===b)throw Error("Cannot set a null [[Prototype]]");if("object"!=typeof b)throw TypeError("Argument must be an object");return a.prototype=b,new a}}(),f=function(a){this.colPrefix=a.colPrefix||+new Date+"seed",this.colWrap=a.colWrap,this.colwrapStyle=this.colWrap.style,this.colClass=a.colClass,this.imgClass=a.imgClass,this.colWidth=a.colWidth,this.flexWidth=a.flexWidth,this.gutterWidth=a.gutterWidth||20,this.gutterHeight=a.gutterHeight||20,this.colNum=a.colNum||4,this.columnHeight=new Array(this.colNum+1).join(0).split("").map(function(){return 0})||new Array(5).join(0).split("").map(function(){return 0}),this.pageNum=a.pageNum||15,this.fetch=a.fetch,this.fetchBtn=a.fetchBtn,this.resize=a.resize,this.fadeOut=a.fadeOut,this.__lock=this.sid=this.page=0,this.__lockCount=this.pageNum,this.data=[],this.duration=a.duration||20,this.tpl=a.template(),this.maxPage=a.maxPage,this.maxNum=a.maxNum,this.onPrepend=a.onPrepend,this.onDone=a.onDone,this.onprocess=a.onprocess,this.imgDone=a.imgDone,this.imgError=a.imgError,this.eventStatus=!0,this.__imgQueue=[],this.__animateQueue=[],this.initialize()},f.prototype=Object.create({initialize:function(){this.fetchBtn?(this.fetchBtn._display=this.fetchBtn.style.display,this.bindFetchEvent()):this.bindDefaultFetchEvent(),this.resize&&this.bindResizeEvent(),this.__lock=1,this.mainProcess()},mainProcess:function(){var a=this;!this.maxPage&&!this.maxNum||this.maxPage&&this.page<this.maxPage||this.maxNum&&this.sid<this.maxNum?(this.__lockCount=a.pageNum,this.fetchBtn&&(this.fetchBtn.style.display="none"),this.onprocess&&this.onprocess(),this.fetch(function(b,c){a.data=b;var d=b.map(function(a){return a[c]});a.makeImgQueue(d)})):this.switchEvent(!1)},bindFetchEvent:function(){var a=this;this.fetchBtn.onclick=function(){a.__lock||(a.__lock=1,a.mainProcess())}},bindDefaultFetchEvent:function(){var e,c=this,d=this.duration;this.fnHandler=function(){clearTimeout(e),e=setTimeout(function(){var e=b.body.scrollTop+b.documentElement.scrollTop,g=b.documentElement.clientHeight||a.offsetHeight;e+g>f.__max(c.columnHeight).value+d&&(c.__lock||(c.__lock=1,c.mainProcess()))},200)},f.__addEvent(a,"scroll",this.fnHandler)},bindResizeEvent:function(){},makeImgQueue:function(a){var b=this;a.forEach(function(a,c){var d=new Image;d.onload=function(){b.__lockCount--,b.imgDone&&b.imgDone.call(b,d),b.__lock&&!b.__lockCount&&(b.fetchBtn&&(b.fetchBtn.style.display=b.fetchBtn._display),b.__lock=0,b.page++)},d.onerror=function(a){b.__lockCount--,b.__imgQueue.splice(b.__imgQueue.indexOf(d),1),b.imgError&&b.imgError.call(b,a),b.__lock&&!b.__lockCount&&(b.fetchBtn&&(b.fetchBtn.style.display=b.fetchBtn._display),b.__lock=0,b.page++)},d.src=a,d.sid=c,b.__imgQueue.push(d)}),f.__calcImgSize(this,this.procssConfig)},procssConfig:function(a){var b,c,d;a.naturalwidth=a.naturalWidth?a.naturalWidth:a.width,a.naturalheight=a.naturalHeight?a.naturalHeight:a.height,d=this.flexWidth*a.height/a.width,this.sid<this.colNum?(b=0,c=this.sid*(this.colWidth+this.gutterWidth)):(b=f.__min(this.columnHeight).value,c=f.__min(this.columnHeight).index*(this.colWidth+this.gutterWidth)),this.replaceTpl({top:b,left:c,height:d,sid:this.sid,sidIndex:a.sid}),this.sid++},replaceTpl:function(a){var h,c=this.data[a.sidIndex],d=b.createElement("div"),g="";g=this.tpl.replace(/{{([^}]*)}}/g,function(a,b){return c[b]}),d.innerHTML=g,d.className=this.colClass;try{d.dataset.id=this.colPrefix+a.sid}catch(i){d["data-id"]=this.colPrefix+a.sid}d.style.cssText+="top: "+a.top+"px;"+"left: "+a.left+"px;",h=e(d,this.imgClass)[0],h.width=this.flexWidth,h.height=a.height,this.onPrepend&&this.onPrepend.call(this,d),this.fadeOut&&this.animation(d),this.colWrap.appendChild(d),this.columnHeight[f.__min(this.columnHeight).index]+=d.offsetHeight+this.gutterHeight,this.colwrapStyle.cssText+="height: "+f.__max(this.columnHeight).value+"px"},animation:function(a){f.__supportCSS3?a.classList.add("fade"):(this.__animateQueue.push(a),f.__handleOpacity(this))},switchEvent:function(b){b!==!0||this.eventStatus?b===!1&&(this.fetchBtn?this.fetchBtn.onclick=c:f.__detachEvent(a,"scroll",this.fnHandler),this.eventStatus=!1):(this.fetchBtn?this.bindFetchEvent():f.__addEvent(a,"scroll",this.fnHandler),this.eventStatus=!0)}}),f.__version="1.0",f.__calcImgSize=function(a,b){var c=f.__isMobile?200:20,d=setInterval(function(){var f,g,c=a.__imgQueue,e=c.length;if(e)for(f=0;e>f;f++)g=c[f],g.end?(c.splice(f--,1),e--):(g.width||g.height)&&(g.end=!0,a.__animateQueueLength++,b.call(a,g));else clearInterval(d)},c)},f.__handleOpacity=function(a){clearTimeout(a.qtimmer);var b=a.__animateQueue,c=b.length;!function(){var d,e,f;if(c){for(d=0;c>d;d++)e=b[d],f=e.style,e.end?(b.splice(d--,1),c--):(f.filter="alpha(opacity="+Math.floor(100*(e.__opacity?e.__opacity:(e.__opacity=0,0)))+")",1===e.__opacity?(e.removeAttribute&&e.removeAttribute("filter"),e.end=!0):e.__opacity+=1/16);a.qtimmer=setTimeout(arguments.callee,16)}else clearTimeout(a.qtimmer)}()},f.__isMobile=function(){return"ontouchstart"in b}(),f.__addEvent=function(a,b,c){return"function"==typeof addEventListener?a.addEventListener(b,c,!1):a.attachEvent("on"+b,c)},f.__detachEvent=function(a,b,c){return"function"==typeof removeEventListener?a.removeEventListener(b,c,!1):a.detachEvent("on"+b,c)},f.__supportCSS3=function(){var a=["","-webkit-","-o-","-moz-","-ms-"],c=b.createElement("div"),d=c.style;return a.some(function(a){return a+"transition"in d})}(),f.__max=function(a){var b=Math.max.apply(Math,a);return{value:b,index:a.indexOf(b)}},f.__min=function(a){var b=Math.min.apply(Math,a);return{value:b,index:a.indexOf(b)}},a.Waterfall)throw new Error("namespace conflict #waterfall#");a.Waterfall=f}(window,document);