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
	// Waterfall����
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
				// ִ��onprocess����
				this.onprocess && this.onprocess();
				this.fetch(function(data,key){
					self.data = data;
					if(data.length){
						// ����lockcount
						self.__lockCount = data.length;
						var imgs = data.map(function(obj){
							return obj[key];
						})
						self.makeImgQueue(imgs);
					}else{
						// ����lockcount
						self.__lockCount = self.pageNum;
						// �����ݵ����,���ò���
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
				// scroll�¼���
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
					// ��鵱ǰ���ε����е�����,��������������,����onDone
					if(self.__lock && !self.__lockCount){
						if(self.fetchBtn){self.fetchBtn.style.display = self.fetchBtn._display}
						self.__lock = 0;
						self.page++;
						self.onDone && self.onDone();
					}
				}
				// ����ͼƬ����ʧ�ܵ����,����ʧ�ܺ�,ֱ�ӴӶ�����ɾ��
				// ��ֹsetInterval�����������еĴ���ͼƬ
				img.onerror = function(err){
					self.__lockCount--;
					self.__imgQueue.splice(self.__imgQueue.indexOf(img),1)
					if(self.imgError){
						self.imgError.call(self,err)
					}
					// ��鵱ǰ���ε����е�����,��������������,����onDone
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
			// ����ͼƬԭʼ���
			img.naturalwidth = img.naturalWidth ? img.naturalWidth : img.width;
			img.naturalheight = img.naturalHeight ? img.naturalHeight : img.height;
			height = this.flexWidth * img.height / img.width;
			// �����һ���Ļ�,ֱ��append�����ж�
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
			// ����sidƥ��data�������ڽ���replace����
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
			// �����Ĵ���,�������������,Ȼ������Ԫ�ض�append֮����ִ�ж����еĵ�������,Ĭ�ϵ�,Ԫ��͸����Ϊ0
			// ��Ϊ������е�ʱ���Ѿ�����һ��͸���ȴ���
			this.fadeOut && this.animation(tmpDom);
			this.colWrap.appendChild(tmpDom);
			this.onPrepend && this.onPrepend.call(this,tmpDom);
			// ���µ�ǰ�߶�
			this.columnHeight[Waterfall.__min(this.columnHeight).index] += tmpDom.offsetHeight + this.gutterHeight;
			this.colwrapStyle.cssText += 'height: ' + Waterfall.__max(this.columnHeight).value + 'px';
		},
		animation: function(dom){
			if(Waterfall.__supportCSS3){
				dom.classList.add('fade')
			}else{
				// ����animate���н��д���,��ѯ������͸���ȴ���,��������ĴӶ�����ɾ��
				this.__animateQueue.push(dom);
				Waterfall.__handleOpacity(this);
			}
		},
		// ���ع����¼�
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
	// Waterfall˽������
	Waterfall.__version = '2.0';
	Waterfall.__calcImgSize = function(model,callback){
		// �����ÿ�߼�鲻��������ͼƬ�Ŀ�߼��
		// ���Կ�߼���Ӧ����ͬʱ��
		// ����һ������
		// ѭ���������е�ͼƬ
		var	interval = Waterfall.__isMobile ? 200 : 20;
		var timmer = setInterval(function(){
			var queue = model.__imgQueue,
				queueLen = queue.length;
			// ѭ��������
			if(queueLen){
				for(var i = 0;i<queueLen;i++){
					var img = queue[i];
					if(img.end){
						// ����iΪ��ǰ����,���Ҳü���ǰ��len����
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
		// ����Ϊ�յ�ʱ��,��ô���������,��������
		// ע��....�쳣�׳�ʱ....thisָ��ȫ��...
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
