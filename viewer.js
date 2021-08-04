// Author: magellan-bt
// email: tallybobby@gmail.com

class Viewer{
    constructor(list,id,opts){
        var that = this;       
	    this._id = id;
        this._list = list;
        this._nImg = list.length;
        this._preload();
        this._opts = {};
        this._mouseMoveTimeoutID = null;
        this._isMovingImg = false;
        Viewer.deepClone(this._opts,Viewer.defaultOpts);
        Viewer.deepClone(this._opts,opts);
        
		
		var currentIdx = Viewer.getCookie(id+'.idx');
		if (currentIdx){
			this._idx = parseInt(currentIdx,10);
		} else {
			this._idx = this._opts.startAt-1;
		}
		
        document.body.style.margin = '0px'
        document.body.style.padding = '0px'        
        // ------------- GRAPHICS -------------
        this._fullW = window.screen.width;
        this._fullH = window.screen.height;       
        this._frame = document.createElement('div');
        this._frame.className = 'cv-background';
        this._frame.style.width = window.innerWidth + 'px';
        this._frame.style.height = window.innerHeight + 'px';
        this._frame.style.position = 'absolute';
        this._frame.style.cursor = 'none';        
        this._imgframe = document.createElement('div');
        this._imgframe.style.width = '100%';
        this._imgframe.style.height =  '100%';
        this._imgframe.style.position = 'absolute';
        this._imgframe.style.backgroundRepeat =  'no-repeat';
        this._imgframe.style.backgroundPosition = '50% 50%';
        this._navbarLayer = document.createElement('div');
        this._navbarLayer.className = 'cv-navigation-layer';
        this._navbarLayer.style.width = '100%';
        this._navbarLayer.style.bottom = '0px';
        this._navbarLayer.style.position =  'absolute';
        
        this._navbarContainer = document.createElement('div');
        this._navbarContainer.className = 'cv-navigation-bar-container';
        this._navbarContainer.style.visibility = 'hidden';
        this._navbar = document.createElement('div');
        this._navbar.className = 'cv-navigation-bar';
        this._progressBar = document.createElement('div');
        this._progressBar.className = 'cv-progress-bar';
		this._imgCountBox = document.createElement('div');
		this._imgCountBox.className = 'cv-navigation-bar-counter'
		this._imgCountBox.innerHTML = (this._idx + 1) + '/' + this._nImg;
		this._navbar.appendChild(this._imgCountBox);
        this._navbarbutton('previous','cv-navigation-bar-button-previous',function (){
            that.backward();
        });
        this._navbarbutton('next','cv-navigation-bar-button-next',function (){
            that.forward();
        });
        this._navbarbutton('rewind','cv-navigation-bar-button-rewind',function (){
            that.rewind();
        });
        this._navbarbutton('fullscreen','cv-navigation-bar-button-fullscreen',function (){
            that.toggleFullscreen();
        });
        this._navbarbutton('adjust image to screen','cv-navigation-bar-button-magnify',function (){
            that.toggleAdjustToViewport();
        });   
        this._downButton = this._navbarbutton('download','cv-navigation-bar-button-download',function (){
            if (that._opts.downloadFile){
                aDownButton.click();
            } else {
                console.log('this image set cannot be downloaded');
            }
        });
        if (this._opts.downloadFile){
            console.log(this._opts.downloadFile);
            var aDownButton = document.createElement('a');
            aDownButton.href = this._opts.downloadFile;
            aDownButton.download = '';
            aDownButton.style.display = 'none';
            document.body.appendChild(aDownButton);
        }
        
        this._navbarContainer.appendChild(this._progressBar);
        this._navbarContainer.appendChild(this._navbar);
        this._navbarLayer.appendChild(this._navbarContainer);
        this._contextmenu = document.createElement('div');
        this._contextmenu.className = 'cv-context-menu-frame';
        this._contextmenu.style.position =  'fixed';
        this._contextmenu.style.visibility = 'hidden';
        
        this._msgLayer = document.createElement('div');
        this._msgLayer.style.width = '100%';
        this._msgLayer.style.bottom = '50%';
        this._msgLayer.style.position =  'absolute';
        this._msgLayer.style.visibility = 'hidden';       
        this._msgBox = document.createElement('div');
        this._msgBox.className = 'cv-message-box';
        this._msgBox.style.position =  'relative';
        
        this._msgLayer.appendChild(this._msgBox);      
        this._frame.appendChild(this._imgframe);
        this._frame.appendChild(this._navbarLayer);
        this._frame.appendChild(this._contextmenu);
        this._frame.appendChild(this._msgLayer);
        document.body.appendChild(this._frame);
        
        this._adjustViewport = false; 
        // ---------- EVENTS ------------   
        this._contextmenubutton('next','->',function(){
            that.forward();
        });
        this._contextmenubutton('previous','<-',function(){
            that.backward();
        });
        this._contextmenubutton('fullscreen','f',function(){
            that.toggleFullscreen();
        });
        this._contextmenubutton('adjust image to screen','a',function(){
            that.toggleAdjustToViewport();
        });
        
        window.addEventListener('resize', function (){
            that._onresize()
        });
		window.addEventListener('beforeunload', function(e) {
			Viewer.setCookie(id+'.idx', that._idx.toString(),that._opts.cookieDuration);
			//e.preventDefault();
			e.returnValue = null;
			return
		});
		
        
        document.addEventListener('keyup',function (e){
            if (that._isNotLocked()){
                 if (that._contextmenu.style.visibility == 'visible'){
                    that._contextmenu.style.visibility = 'hidden';
                }
                if (that._msgLayer.style.visibility == 'visible'){
                    that._msgLayer.style.visibility = 'hidden';
                }
                that._shortcuts(e.which);
            }
        });
        
        document.addEventListener('wheel',function (e){
            e.preventDefault();
            if (that._isNotLocked()){
                if (that._msgLayer.style.visibility == 'visible'){
                    that._msgLayer.style.visibility = 'hidden';
                }
                
                if (e.deltaY > 0){
                    that.forward();
                }
                
                if (e.deltaY < 0){
                    that.backward();
                }    
            }
        });
                    
        this._imgframe.addEventListener('touchstart',function (e){
             
            //e.preventDefault();
            e.stopPropagation();
            
            var initialX = e.touches[0].clientX;
            var initialY = e.touches[0].clientY;
            var initialTime = Date.now();
            
            console.log('touch start X: ' + initialX);
            
            var timer = window.setTimeout(function(){
                console.log('down for 1sec');
                that.showNav(2000);
                /*
                if (that._isNotLocked()){
                    that._contextmenu.style.left = e.pageX + 'px';
                    that._contextmenu.style.top = e.pageY + 'px';
                    if (that._contextmenu.style.visibility == 'hidden'){
                        that._contextmenu.style.visibility = 'visible';
                    }
                }*/
            },1000);
            
            that._imgframe.addEventListener('touchend',touchend);
            
            that._imgframe.addEventListener('touchmove',touchmove);
            
            function touchend(e){
                window.clearTimeout(timer);
                that._imgframe.removeEventListener('touchend',touchend);
                window.setTimeout(function(){
                    that._imgframe.removeEventListener('touchmove',touchmove);
                },300);
                var currentX = e.changedTouches[0].clientX;
                var currentTime = Date.now();
                //console.log('up: time: %d, distance: %d', currentTime-initialTime, currentX-initialX);
                
                // if (currentTime - initialTime > 100 && currentTime - initialTime < 2000){
                if (currentX - initialX > 80) {
                    console.log('previous');
                    that.backward();
                } else if (currentX - initialX < -80) {
                    console.log('next');
                    that.forward();
                } else {
                    that.showNav(2000);
                    console.log('distance too short');
                }                    
                    
                // } else {
                    // console.log('timing too short or to long');
                // }
                
            }
            
            function touchmove(e){
                e.preventDefault();
                e.stopPropagation();
                that.hideNav();
                window.clearTimeout(timer);
            }
            
        });
        
        this._frame.addEventListener('click',function (e){
            e.preventDefault();
            if (that._contextmenu.style.visibility == 'visible'){
                that._contextmenu.style.visibility = 'hidden';
            }
            if (that._msgLayer.style.visibility == 'visible'){
                that._msgLayer.style.visibility = 'hidden';
            }                
            that.showNav(3000);
            console.log('click. width: %d, height: %d, pixelratio: %f', window.screen.width, window.screen.height, window.devicePixelRatio);
        });
                
        this._frame.addEventListener('mousemove',function (e){
            e.preventDefault();
            
            if (that._isNotLocked()){
               that.showNav(1000);
            }
        });
        
        this._imgframe.addEventListener('mousedown',function (e){
            if (e.which == 2){
                e.stopPropagation();
                if (that._imgframe.style.backgroundSize == 'auto auto'){
                    if (that._imgframe.offsetWidth < that._imgProp[that._idx].width || that._imgframe.offsetHeight < that._imgProp[that._idx].height){
                        that.hideNav();
                        that._imgframe.style.cursor = 'move';
                        that._isMovingImg = true;
                        var initialMouseX = e.pageX;
                        var initialMouseY = e.pageY;
                        if (window.getComputedStyle(that._imgframe).getPropertyValue('background-position') == '50% 50%'){
                            var initialX = (that._imgframe.offsetWidth-that._imgProp[that._idx].width)/2;
                            var initialY = (that._imgframe.offsetHeight-that._imgProp[that._idx].height)/2;
                        } else {
                            var pos = window.getComputedStyle(that._imgframe).getPropertyValue('background-position').replace('px','').replace('px','').split(/\s+/);
                            var initialX = Number(pos[0]);
                            var initialY = Number(pos[1]);
                        }
                        
                        var moveImgMousemove = function (e){
                            var deltaX = e.pageX - initialMouseX;
                            var deltaY = e.pageY - initialMouseY;
                            that._imgframe.style.backgroundPosition = (initialX+deltaX) + 'px ' + (initialY+deltaY) + 'px';
                        };
                        
                        var moveImgMouseup = function (e){
                            that._imgframe.removeEventListener('mouseup',moveImgMouseup);
                            that._imgframe.removeEventListener('mousemove',moveImgMousemove);
                            that._imgframe.removeEventListener('mousemove',moveImgMouseleave);
                            that._imgframe.style.cursor = 'inherit';
                            that._isMovingImg = false;
                        };
                        
                        var moveImgMouseleave = function (e){
                            moveImgMouseup(e);
                        };
                        
                        that._imgframe.addEventListener('mousemove',moveImgMousemove);
                        that._imgframe.addEventListener('mouseleave',moveImgMouseleave);
                        that._imgframe.addEventListener('mouseup',moveImgMouseup);
                    }
                }
           }
        });
        
        this._navbarContainer.addEventListener('mousemove',function (e){
            e.preventDefault();
            e.stopPropagation();
        });
        
        this._navbarContainer.addEventListener('mouseenter',function (e){
            e.preventDefault();
            e.stopPropagation();
            if (that._mouseMoveTimeoutID != null){
                window.clearTimeout(that._mouseMoveTimeoutID);
                that._mouseMoveTimeoutID = null;
            }
            console.log('mouseenter');
        });
        
        if (this._opts.magnify){
            this.toggleAdjustToViewport();
        }       
        // --------- START ---------		
		this._showCurrent();
		
    }
    
    _contextmenubutton(text,shortcut,callback){
        var self = document.createElement('div');
        self.className = 'cv-context-menu-button';
        
        var self_text = document.createElement('div');
        self_text.innerHTML = text;
        self_text.style.display = 'inline-block';
        self_text.style.textAlign = 'left';
        self_text.style.marginLeft = '5%';
        self_text.style.width = '70%';
        
        var self_sc = document.createElement('div');
        self_sc.innerHTML = '(' + shortcut + ')';
        self_sc.style.display = 'inline-block';
        self_sc.style.textAlign = 'right';
        self_sc.style.marginRight = '5%';
        self_sc.style.width = '20%';
        
        self.appendChild(self_text);
        self.appendChild(self_sc);
        
        this._contextmenu.appendChild(self);
        
        var that = this;
        
        self.addEventListener('click',function (e){
            //e.stopPropagation()
            callback.call(that)
        });
    }
    
    _navbarbutton(car,classname,callback){
		console.log('create nav buttton')
        var that = this;
		var timer;
        var self = document.createElement('div');
		var tipBox = document.createElement('div');
		tipBox.className = 'cv-tipbox';
		tipBox.innerHTML = car;
		tipBox.style.visibility = 'hidden';
        self.className = 'cv-navigation-bar-button ' + classname;
        // self.innerHTML = car;
        //self.style.display = 'inline-block';
		self.appendChild(tipBox);
        this._navbar.appendChild(self);
        
        self.addEventListener('click',function (e){
			clearTimeout(timer)
			tipBox.style.visibility = 'hidden';
            callback.call(that)
        });
		self.addEventListener('mouseenter',function(e){
			console.log('enter')
			timer = setTimeout(function(){
				tipBox.style.visibility = 'visible';
			}, 500);
		});
		self.addEventListener('mousemove',function(e){
			console.log('mousemove')
			tipBox.style.left = (e.pageX + 20) + 'px'
			tipBox.style.top = (e.pageY - 20) + 'px'
		});
		self.addEventListener('mouseleave',function(e){
			clearTimeout(timer)
			tipBox.style.visibility = 'hidden';
		});
        return self;
    }
    
    _isNotLocked(){
        return !this._isMovingImg;
    }
    
    _shortcuts(key){
        
        console.log(key);
        switch(key){
            case 33:
                this.moveFrom(-10);
                break;
            case 34:
                this.moveFrom(10);
                break;
            case 35:
                this.last();
                break;
            case 36:
                this.rewind();
                break;
            case 39:
                this.moveFrom(1);
                break;
            case 37:
                this.moveFrom(-1);
                break;
            case 77:
                this.toggleAdjustToViewport();
                break;
            case 70:
                this.toggleFullscreen();
                break;
            default:
                console.log('unbind key');
        }
    }
    
    _onresize(){
        this._frame.style.width = window.innerWidth + 'px';
        this._frame.style.height = window.innerHeight + 'px';
    }
    
    _preload(){
        var that = this;
        var imgLoaded = 0
        var imgs = []
        this._imgProp = new Array(this._list.length);
        
        for (var i=0; i<this._list.length; i++){
            imgs.push(new Image())
            imgs[i].addEventListener('load',function (e){
                //this._imgProp.width = imgs[i].naturalWidth;
                //this._imgProp.height = imgs[i].naturalHeight;
                imgLoaded++;
                that._progressBar.style.width = Math.round(imgLoaded/that._list.length*100) + '%';
                //console.log(Math.round(imgLoaded/that._list.length*100));
            }, true);
            imgs[i].src = this._list[i]
        }
    }
    
    hideNav(){
        if (this._mouseMoveTimeoutID != null){
            window.clearTimeout(this._mouseMoveTimeoutID);
            this._mouseMoveTimeoutID = null;
        }
        
        this._frame.style.cursor = 'none';
        this._navbarContainer.style.visibility = 'hidden';
        this._mouseMoveTimeoutID = null;
    }
    
    showNav(time){
        var that = this;
        if (this._mouseMoveTimeoutID != null){
            window.clearTimeout(that._mouseMoveTimeoutID);
            this._mouseMoveTimeoutID = null;
        }
        
        if (typeof time == 'number'){
            that._mouseMoveTimeoutID = window.setTimeout(function (){
                that.hideNav();
            },time);
        }
        
        that._frame.style.cursor = 'default';
        if (that._navbarContainer.style.visibility == 'hidden'){
            that._navbarContainer.style.visibility = 'visible';
        }
    }
    	
	
    message(text){
		var that = this;
		
        if (typeof text == 'undefined'){
            this._msgLayer.style.visibility = 'hidden';
        } else {
            this._msgBox.innerHTML = text;
            this._msgLayer.style.visibility = 'visible';
        }
    }
    
    moveFrom(num){
        
        if (this._idx == 0 && num < 0){
            this.message('this is the first image');
            return 0;
        }
        
        if (this._idx == this._nImg-1 && num > 0){
            this.message('this is the last image');
            return 0;
        }
        
        if (this._idx + num < 0){
            this._idx = 0;
        } else if (this._idx + num >= this._nImg){
            this._idx = this._nImg-1;
        } else {
            this._idx += num;
        }
        this.moveTo(this._idx);
    }
    
    forward(){
        if (this._idx+1 < this._nImg){
            this._idx++;
            this.moveTo(this._idx);
        } else {
            this.message('this is the last image');
        }
    }
    
    backward(){
        if (this._idx-1 >=0){
            this._idx--;
            this.moveTo(this._idx);
        } else {
            this.message('this is the first image');
        }
    }
    
    last(){
        this.moveTo(this._nImg-1);
    }
    
    moveTo(idx){
        if (idx < this._nImg & idx >= 0){
            this._idx = idx;
            this._showCurrent();
        }
    }
    
    _showCurrent(){
		
		if (this._idx >= this.nImg){
			this._idx = 0;
		}
        var that = this;
        var img = new Image();
        var timerLoading = window.setTimeout(function (){
           that.message('loading...');
        },500);
        var timerTimeout = window.setTimeout(function (){
           that.message('error: cannot find image');
        },10000);
        img.addEventListener('load',function (e){
            window.clearTimeout(timerLoading);
            window.clearTimeout(timerTimeout);
            that.message();
            that._imgProp[that._idx] = {
                width: img.naturalWidth,
                height: img.naturalHeight
            };
            //console.log('img[%d]: %s: %dx%dpx',that._idx,that._list[that._idx],that._imgProp[that._idx].width,that._imgProp[that._idx].height);
            that._imgframe.style.backgroundPosition = '50% 50%';
            that._imgframe.style.backgroundImage = "url(" + "'" + that._list[that._idx] + "')";
        });
        img.src = this._list[this._idx];
		this._imgCountBox.innerHTML = (this._idx + 1) + '/' + this._nImg;
    }
    
    rewind(){
        this.moveTo(0);
    }
    
    toggleAdjustToViewport(){
        this._imgframe.style.backgroundPosition = '50% 50%';
        if (this._adjustViewport){
            this._imgframe.style.backgroundSize = 'auto';
        } else {
            this._imgframe.style.backgroundSize = 'contain';
        }
        
        this._adjustViewport = !this._adjustViewport;
        
    }
    
    adjustToNatural(){
        this._imgframe.style.backgroundSize = 'auto'
    }
    
    toggleFullscreen(){
        if (this._frame.webkitRequestFullscreen){
            if (!document.webkitFullscreenElement) {
                this._frame.webkitRequestFullscreen();
                
            } else {
                if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen(); 
                }
            }
        }
        
        if (this._frame.mozRequestFullScreen){
            if (!document.mozFullScreenElement) {
                this._frame.mozRequestFullScreen();
            } else {
                console.log('in3')
                if (document.mozCancelFullScreen) {
                    console.log('in4')
                    document.mozCancelFullScreen(); 
                }
            }
        }
    }
}

Viewer.setCookie = function(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

Viewer.getCookie = function(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return false;
}

Viewer.deepClone = function (out,obj){
    for (var key in obj){
        type = typeof obj[key];
        if (type == 'number' || type == 'string' || type == 'boolean'){
            out[key] = obj[key];
        } else if (obj[key] instanceof Array){
            out[key] = [];
            Viewer.deepClone(out[key],obj[key])
        } else {
            out[key] = {};
            Viewer.deepClone(out[key],obj[key])
        }
    }
}

Viewer.defaultOpts = {
    magnify: false,
    loop: true,
    startAt: 1,
    downloadFile: null,
	
	cookieDuration: 14,
    keymap: {
        fullscreen: 70,
        magnify: 77,
        next: 39,
        previous: 37,
        rewind: 36,
        last: 35,
        fastForward: 34,
        fastBackward: 33
    }
}

Viewer.getImageListFromServer = function (phpScriptPath,imgPath,ext,callback) {
    if (typeof ext == 'undefined'){
        ext = ['png','jpg','jpeg'];
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load',function (e){
        callback(oReq);
    });
    url = phpScriptPath + '?dir_name=' + imgPath + '&ext=' + JSON.stringify(ext);
    oReq.open( "GET", url);
    oReq.send();
}


function test(){
	var url = new URL(window.location.href);
	var dir_name = url.searchParams.get("dir_name");
	console.log(dir_name);
    Viewer.getImageListFromServer('./getImages.php',dir_name+'/',['jpg','png','gif'], function (ajaxRequest){
        var myList = JSON.parse(ajaxRequest.responseText);
        var my = new Viewer(myList, dir_name,{
            magnify: false,
            startAt: 1,
            downloadFile: dir_name + '/' + 'bobbytally-' + dir_name + '.zip'
        });
    });
}

