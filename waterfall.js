// waterfall.js by otarim
// todo: ����1���Ĺ�������
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
    if(![].fill){
    	proto.fill = function(num){
    		var ret = [];
    		for(var i = 0;i < this.length;i++){
    			ret.push(num);
    		}
    		return ret;
    	}
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
		this.maxColNum = config.maxColNum;
		this.specialCol = config.columnHeight && config.columnHeight.slice();
		this.specialColHeight = config.specialColHeight || 0;
		this.columnHeight = config.columnHeight || new Array(this.colNum || 4).fill(0);
		this.resize = config.resize;
		this.pageNum = config.pageNum || 15;
		this.fetch = config.fetch;
		this.fetchBtn = config.fetchBtn;
		this.animate = config.animate;
		this.__lock = this.sid = this.page = 0;
		this.__lockCount = this.pageNum;
		this.data = [];
		this.duration = config.duration || 0;
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
		this.todo = [];//�Ѿ����ڵ� dom
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
				this.prepareResize(false);
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
						self.onDone && self.onDone.call(self);
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
						viewHeight = w.innerHeight || d.documentElement.clientHeight,
						scrollHeight = d.documentElement.scrollHeight || d.body.scrollHeight;
					if(sTop + viewHeight >= scrollHeight - duration){
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
			var self = this,timmer;
			var resizeFn = function(){
				clearTimeout(timmer);
				timmer = setTimeout(function(){
					self.prepareResize(true);
				},200)
			}
			Waterfall.__addEvent(w,'resize',resizeFn);
		},
		prepareResize: function(Manual){
			var pinWidth = this.colWidth + this.gutterWidth;
			var clientWidth = w.innerWidth || d.documentElement.clientWidth;
			var colNum = parseInt(clientWidth / pinWidth,10);
			if(colNum === this.colNum) return;
			// �����������������Ϊ�������
			if(this.maxColNum && colNum > this.maxColNum) {colNum = this.maxColNum}
			var wrapWidth = pinWidth * colNum;
			this.colWrap.style.cssText += ';width: ' + wrapWidth + 'px;';
			var self = this;
			if(this.specialCol){
				if(colNum < this.specialCol.length){
					this.columnHeight = this.specialCol.slice().splice(0,colNum);
				}else{
					this.columnHeight = this.specialCol.slice().concat(new Array(colNum - this.specialCol.length).fill(this.specialColHeight));
				}
			}else{
				this.columnHeight = new Array(colNum).fill(0);
			}
			Manual && this.doResize();
			this.colNum = colNum;
		},
		doResize: function(){
			var self = this;
			var appendResize = function(dom){
				var minHeight = Waterfall.__min(self.columnHeight);
				var top = minHeight.value;
				var left = minHeight.index * (self.colWidth + self.gutterWidth);
				dom.el.style.cssText += ';top: '+ top + 'px;left: ' + left + 'px;';
				// ���� columnHeight
				self.columnHeight[Waterfall.__min(self.columnHeight).index] += dom.layout;
				self.colwrapStyle.cssText += ';height: ' + Waterfall.__max(self.columnHeight).value + 'px';
			}
			this.todo.forEach(function(dom){
				appendResize(dom);
			})
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
						self.onDone && self.onDone.call(self);
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
						self.onDone && self.onDone.call(self);
					}
				}
				img.src = d;
				img.sid = index;
				self.__imgQueue.push(img);
			})
			Waterfall.__calcImgSize(this,this.procssConfig);
		},
		procssConfig: function(img){
			var top,left,height,minHeight;
			// ����ͼƬԭʼ���
			img.naturalwidth = img.naturalWidth ? img.naturalWidth : img.width;
			img.naturalheight = img.naturalHeight ? img.naturalHeight : img.height;
			height = this.flexWidth * img.height / img.width;
			minHeight = Waterfall.__min(this.columnHeight);
			top = minHeight.value;
			left = minHeight.index * (this.colWidth + this.gutterWidth);
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
			tmpDom.style.cssText += ';top: ' + config.top + 'px;' + 'left: ' + config.left + 'px;';
			img = getElementsByClassName(tmpDom,this.imgClass)[0];
			img.width = this.flexWidth;
			img.height = config.height;
			this.animate && this.resize && Waterfall.__supportCSS3 && (tmpDom.style.cssText += ';-webkit-transition: all linear .5s;-moz-transition: all linear .5s;-ms-transition: all linear .5s;-o-transition: all linear .5s;transition: all linear .5s;')
			// todo: .cssText = 'filter...' ie��ȡoffsetHeight��һ�����ʷ���0
			this.animate && (img.style.filter = 'alpha(opacity=0)',img.style.cssText += ';opacity: 0;-webkit-transition: opacity linear .5s;-moz-transition: opacity linear .5s;-ms-transition: opacity linear .5s;-o-transition: opacity linear .5s;transition: opacity linear .5s;')
			this.onPrepend && this.onPrepend.call(this,tmpDom);
			this.colWrap.appendChild(tmpDom);
			// ���µ�ǰ�߶�
			var layout = tmpDom.offsetHeight + this.gutterHeight;
			this.columnHeight[Waterfall.__min(this.columnHeight).index] += layout;
			this.todo.push({
				el: tmpDom,
				layout: layout
			})
			this.colwrapStyle.cssText += ';height: ' + Waterfall.__max(this.columnHeight).value + 'px';
			this.animate && this.animation(img);
		},
		animation: function(dom){
			if(Waterfall.__supportCSS3){
				dom.style.cssText += 'opacity: 1';
			}else{
				// ����animate���н��д���,��ѯ������͸���ȴ���,��������ĴӶ�����ɾ��
				this.__animateQueue.push(dom);
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
	Waterfall.__version = '3.0';
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
				// ȫ��������ɣ�ִ��animate
				Waterfall.__handleOpacity(model);
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
