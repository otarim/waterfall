// waterfall.js by otarim
;(function(w,d,undefined){
	// Polyfill
	var proto = Array.prototype,
		getElementsByClassName = function(){};
	if(![].forEach){
        proto.forEach = function(callback,thisArg){
            var ret = [];
            for(var i = 0,l = this.length;i < l;i++){
                callback.apply(thisArg || null,[this[i],i,this]);
            }
            return this;
        };
    }
	if(![].map){
        proto.map = function(callback,thisArg){
            var ret = [];
            for(var i = 0,l = this.length;i < l;i++){
                ret.push(callback.apply(thisArg || null,[this[i],i,this]));
            }
            return ret;
        };
    }
    if(![].indexOf){
    	proto.indexOf = function(who){
    		for(var i = 0,l = this.length,ret;i<l;i++){
    			if(this[i] == who) {
    				ret = i;
    				break;
    			}
    		}
    		return ret;
    	}
    }
    if(![].some){
        proto.some = function(callback,thisArg){
            var ret = false;
            for(var i = 0,l = this.length;i < l;i++){
                if(callback.apply(thisArg || null,[this[i],i,this]) === true){
                    ret = true;
                    return ret;
                }
            }
            return ret;
        };
    }
    if(d.getElementsByClassName){
    	getElementsByClassName = function(dom,className){
    		return dom.getElementsByClassName(className)
    	}
    }else{
    	getElementsByClassName = function(dom,className){
    		var ret = [],nodelists = dom.getElementsByTagName('*');
    		for(var i = 0,l = nodelists.length,node;i<l;i++){
    			node = nodelists[i];
    			if(node.className === className){
    				ret.push(node)
    			}
    		}
    		nodelists = undefined;
    		return ret;
    	}
    }
    // from MDN
	if (typeof Object.create != 'function') {
	    (function () {
	        var F = function () {};
	        Object.create = function (o) {
	            if (arguments.length > 1) { throw Error('Second argument not supported');}
	            if (o === null) { throw Error('Cannot set a null [[Prototype]]');}
	            if (typeof o != 'object') { throw TypeError('Argument must be an object');}
	            F.prototype = o;
	            return new F;
	        };
	    })();
	}
	var Waterfall_conflict = w.Waterfall;
	var Waterfall = function(config){
		this.colPrefix = config.colPrefix || +new Date() + 'seed';
		this.colWrap = config.colWrap;
		this.colwrapStyle = this.colWrap.style;
		this.colClass = config.colClass;
		this.imgClass = config.imgClass;
		this.colWidth = config.colWidth;
		this.flexWidth = config.flexWidth;
		this.gutterWidth = config.gutterWidth || 20;
		this.gutterHeight = config.gutterHeight || 20;
		this.colNum = config.colNum || 4;
		this.columnHeight = new Array(this.colNum+1).join(0).split('').map(function(){return 0}) || new Array(5).join(0).split('').map(function(){return 0});
		this.pageNum = config.pageNum || 15;
		this.fetch = config.fetch;
		this.fetchBtn = config.fetchBtn;
		this.resize = config.resize;
		this.fadeOut = config.fadeOut;
		this.__lock = this.sid = this.page = 0;
		this.__lockCount = this.pageNum;
		this.data = [];
		this.duration = config.duration || 20;
		this.tpl = config.template();
		this.maxPage = config.maxPage;
		this.maxNum = config.maxNum;
		this.onPrepend = config.onPrepend;
		this.onDone = config.onDone;
		this.onprocess = config.onprocess;
		this.imgDone = config.imgDone;
		this.imgError = config.imgError;
		this.eventStatus = true;
		this.__imgQueue = [];
		this.__animateQueue = [];
		this.initialize();
	}
	// Waterfall方法
	Waterfall.prototype = Object.create({
		initialize: function(){
			if(this.fetchBtn){
				this.fetchBtn._display = this.fetchBtn.style.display;
				this.bindFetchEvent();
			}else{
				this.bindDefaultFetchEvent();
			}
			if(this.resize){
				this.bindResizeEvent()
			}
			this.__lock = 1;
			this.mainProcess();
		},
		mainProcess: function(){
			var self = this;
			if(!this.maxPage && !this.maxNum ||
				this.maxPage && this.page < this.maxPage ||
				this.maxNum && this.sid < this.maxNum){
				if(this.fetchBtn){
					this.fetchBtn.style.display = 'none'
				}
				// 执行onprocess函数
				this.onprocess && this.onprocess();
				this.fetch(function(data,key){
					self.data = data;
					if(data.length){
						// 重置lockcount
						self.__lockCount = data.length;
						var imgs = data.map(function(obj){
							return obj[key];
						})
						self.makeImgQueue(imgs);
					}else{
						// 重置lockcount
						self.__lockCount = self.pageNum;
						// 空数据的情况,重置参数
						if(self.fetchBtn){self.fetchBtn.style.display = self.fetchBtn._display}
						self.__lock = 0;
						self.onDone && self.onDone();
					}
				})
			}else{
				this.switchEvent(false);
			}
		},
		bindFetchEvent: function(){
			var self = this;
			this.fetchBtn.onclick = function(){
				if(!self.__lock){
					self.__lock = 1;
					self.mainProcess()
				}
			}
		},
		bindDefaultFetchEvent: function(){
			var self = this,
				duration = this.duration,
				timmer;
				// scroll事件绑定
			this.fnHandler = function(){
				clearTimeout(timmer);
				timmer = setTimeout(function(){
					var sTop = d.body.scrollTop + d.documentElement.scrollTop,
						viewHeight = d.documentElement.clientHeight || w.offsetHeight;
					if(sTop + viewHeight > Waterfall.__max(self.columnHeight).value + duration){
						if(!self.__lock){
							self.__lock = 1;
							self.mainProcess()
						}
					}
				},200)
			}
			Waterfall.__addEvent(w,'scroll',this.fnHandler);
		},
		bindResizeEvent: function(){
		},
		makeImgQueue: function(data){
			var self = this;
			data.forEach(function(d,index){
				var img = new Image;
				img.onload = function(){
					self.__lockCount--;
					if(self.imgDone){
						self.imgDone.call(self,img)
					}
					// 检查当前批次的所有的任务,如果所有任务都完成,触发onDone
					if(self.__lock && !self.__lockCount){
						if(self.fetchBtn){self.fetchBtn.style.display = self.fetchBtn._display}
						self.__lock = 0;
						self.page++;
						self.onDone && self.onDone();
					}
				}
				// 处理图片加载失败的情况,加载失败后,直接从队列中删除
				// 防止setInterval继续检测队列中的错误图片
				img.onerror = function(err){
					self.__lockCount--;
					self.__imgQueue.splice(self.__imgQueue.indexOf(img),1)
					if(self.imgError){
						self.imgError.call(self,err)
					}
					// 检查当前批次的所有的任务,如果所有任务都完成,触发onDone
					if(self.__lock && !self.__lockCount){
						if(self.fetchBtn){self.fetchBtn.style.display = self.fetchBtn._display}
						self.__lock = 0;
						self.page++;
						self.onDone && self.onDone();
					}
				}
				img.src = d;
				img.sid = index;
				self.__imgQueue.push(img);
			})
			Waterfall.__calcImgSize(this,this.procssConfig)
		},
		procssConfig: function(img){
			var top,left,height;
			// 缓存图片原始宽高
			img.naturalwidth = img.naturalWidth ? img.naturalWidth : img.width;
			img.naturalheight = img.naturalHeight ? img.naturalHeight : img.height;
			height = this.flexWidth * img.height / img.width;
			// 如果第一批的话,直接append无需判断
			if(this.sid < this.colNum){
				top = 0;
				left = this.sid * (this.colWidth + this.gutterWidth)
			}else{
				top = Waterfall.__min(this.columnHeight).value;
				left = Waterfall.__min(this.columnHeight).index * (this.colWidth + this.gutterWidth)
			}
			this.replaceTpl({
				top: top,
				left: left,
				height: height,
				sid: this.sid,
				sidIndex: img.sid
			})
			this.sid++;
		},
		replaceTpl: function(config){
			// 根据sid匹配data的数据在进行replace操作
			var data = this.data[config.sidIndex],
				tmpDom = d.createElement('div'),
				renderResult = '',img;
			renderResult = this.tpl.replace(/{{([^}]*)}}/g,function(a,b){
				return data[b];
			})
			tmpDom.innerHTML = renderResult;
			tmpDom.className = this.colClass;
			try{
				tmpDom.dataset.id = this.colPrefix + config.sid;
			}catch(e){
				tmpDom['data-id'] = this.colPrefix + config.sid;
			}
			tmpDom.style.cssText += 'top: ' + config.top + 'px;' + 'left: ' + config.left + 'px;';
			img = getElementsByClassName(tmpDom,this.imgClass)[0];
			img.width = this.flexWidth;
			img.height = config.height;
			// 动画的处理,将动画推入队列,然后所有元素都append之后再执行队列中的淡出操作,默认的,元素透明度为0
			// 因为插入队列的时候已经做了一次透明度处理
			this.fadeOut && this.animation(tmpDom);
			this.colWrap.appendChild(tmpDom);
			this.onPrepend && this.onPrepend.call(this,tmpDom);
			// 更新当前高度
			this.columnHeight[Waterfall.__min(this.columnHeight).index] += tmpDom.offsetHeight + this.gutterHeight;
			this.colwrapStyle.cssText += 'height: ' + Waterfall.__max(this.columnHeight).value + 'px';
		},
		animation: function(dom){
			if(Waterfall.__supportCSS3){
				dom.classList.add('fade')
			}else{
				// 推入animate队列进行处理,轮询队列做透明度处理,处理结束的从队列中删除
				this.__animateQueue.push(dom);
				Waterfall.__handleOpacity(this);
			}
		},
		// 开关滚动事件
		switchEvent: function(value){
			if(value === true && !this.eventStatus){
				if(this.fetchBtn){
					this.bindFetchEvent();
				}else{
					Waterfall.__addEvent(w,'scroll',this.fnHandler);
				}
				this.eventStatus = true;
			}else if(value === false){
				if(this.fetchBtn){
					this.fetchBtn.onclick = undefined;
				}else{
					Waterfall.__detachEvent(w,'scroll',this.fnHandler);
				}
				this.eventStatus = false;
			}
		}
	})
	// Waterfall私有属性
	Waterfall.__version = '2.0';
	Waterfall.__calcImgSize = function(model,callback){
		// 必须让宽高检查不阻塞其他图片的宽高检查
		// 所以宽高检查的应该是同时的
		// 建立一个队列
		// 循环队列所有的图片
		var	interval = Waterfall.__isMobile ? 200 : 20;
		var timmer = setInterval(function(){
			var queue = model.__imgQueue,
				queueLen = queue.length;
			// 循环检查队列
			if(queueLen){
				for(var i = 0;i<queueLen;i++){
					var img = queue[i];
					if(img.end){
						// 重置i为当前索引,并且裁剪当前的len缓存
						queue.splice(i--,1);
						queueLen--;
					}else{
						if(img.width || img.height){
							img.end = true;
							// model.__animateQueueLength++;
							callback.call(model,img)
						}
					}
				}
			}else{
				clearInterval(timmer)
			}
		},interval)
	}
	Waterfall.__handleOpacity = function(model) {
		// 队列为空的时候,那么清除计数器,动画结束
		// 注意....异常抛出时....this指向全局...
		clearTimeout(model.qtimmer);
		var q = model.__animateQueue;
			// qlen = q.length;
		(function(){
			if(q.length){
			for(var i = 0;i<q.length;i++){
				var dom = q[i];
				// if(typeof dom === 'undefined') {return;}
				var domstyle = dom.style;
				if(dom.end){
					q.splice(i--,1);
				}else{
					domstyle.filter = "alpha(opacity=" + Math.floor((dom.__opacity?dom.__opacity:(dom.__opacity = 0,0)) * 100) + ")";
					if (dom.__opacity === 1) {
						if (dom.removeAttribute) dom.removeAttribute('filter');
						dom.end = true;
					} else {
						dom.__opacity += 1/16;				
					}
				}
			}
			model.qtimmer = setTimeout(arguments.callee, 16)
			}else{
				clearTimeout(model.qtimmer)
			}
		})()
	}
	Waterfall.__isMobile = (function(){
		return 'ontouchstart' in d;
	})()
	Waterfall.__addEvent = function(el,type,callback){
		if(typeof addEventListener === 'function'){
			return el.addEventListener(type,callback,false)
		}else{
			return el.attachEvent('on' + type,callback)
		}
	}
	Waterfall.__detachEvent = function(el,type,callback){
		if(typeof removeEventListener === 'function'){
			return el.removeEventListener(type,callback,false)
		}else{
			return el.detachEvent('on' + type,callback)
		}
	}
	Waterfall.__supportCSS3 = (function(){
		var prefix = ['','-webkit-','-o-','-moz-','-ms-'],
			div = d.createElement('div'),
			divStyle = div.style;
		return prefix.some(function(pre){
			return pre + 'transition' in divStyle;
		})
	})()
	Waterfall.__max = function(arr){
		var value = Math.max.apply(Math,arr);
		return {
			value: value,
			index: arr.indexOf(value)
		}
	}
	Waterfall.__min = function(arr){
		var value = Math.min.apply(Math,arr);
		return {
			value: value,
			index: arr.indexOf(value)
		}
	}
	Waterfall.noConflict = function(){
		w.Waterfall = Waterfall_conflict;
		return Waterfall_conflict;
	}
	w.Waterfall = Waterfall;
})(window,document)
