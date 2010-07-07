/*!
 * Plugin jQuery Popup v2.0.1
 * http://www.versatile-dev.com/jquery.popup
 *
 * Copyright 2010, Autrusseau Damien
 * Licensed under the MIT license.
 *
 * Date: 
 */
 (function($){  
	
	$.fn.popup = function(o, type, extra) 
    {    	
    	if( o === false ) return $.fn.popup.close(this);
    	if( typeof o == "string" ) {  
    		if( o == "close" ) return $.fn.popup.close(this);
    		else if( o == "cancel" || o == "ok") { var opt = $.fn.popup.retrieve(this); if(opt) opt[o](opt); return false; }
    		else if( type ) { $.fn.popup.types[o] = type; $.fn.popup.extra[o] = extra; return this; }
    	}
    	//if( $.fn.popup.lock ) return this; $.fn.popup.lock = true;			
    	
    	o = $.fn.popup.define({			
			overlay:		{ opacity:0.6, background: '#000' },
			loading:		false,
			scroll:			false,
			template:		'',
			duration:		300,
			overflow: 		'.popup-overflow',
			type: 			'default',
			dataType:		'html',
			position:		false,
			effect:			'fade', //'slide',
			content: 		null,
			marginBottom: 	10,	
			cancelTrigger:	'a.popup-cancel',
			cancel:			function(o) { $.fn.popup.close(this, o); },			
			okTrigger:		'a.popup-ok',
			ok:				function(o) { $.fn.popup.close(this, o); },	
			closeTrigger:	'a.popup-close',
			beforeClose:	function(o) { return true; },
			beforeLoad:		function(o) { return true; },
			afterClose: 	function(o) {},
			beforeOpen: 	function(o) { return true; },
			afterOpen: 		function(o) {},
			clickOut: 		function(o) {},
			url: 			this.attr('href'),
			title: 			this.attr('title')	
		}, o, {			
			self: 			this,
			popup: 			null,			
			minHeight:		$.support.boxModel?"1%":"auto"
		});
		o.popups = $($.fn.popup.metaclass);		
		$.fn.popup.preload(o);     
    	return this;
    };   
    
    $.fn.popup.types = {};
    $.fn.popup.extra = {};
    $.fn.popup.meta = 'ba3bff91d5c461fa22da2e9c83fd3ba9';
    $.fn.popup.metaclass = '.'+$.fn.popup.meta;
    $.fn.popup.define = function(defaults, o, extra) {
    	if(!o) o={};
		var type = o.type  ? o.type : defaults.type;
    	if($.fn.popup.types[type]) {
			if(!o.template) o.template = $.fn.popup.types[type];
			defaults = $.extend(defaults, $.fn.popup.extra[type]);			
		}
    	else if(typeof o.type == 'string' && !o.template) o.template = o.type;
    	
    	return $.extend(defaults, o, extra);
    };    
       
	$.fn.popup.preload = function(o, loading, reoverlay) {
		if(o.beforeOpen(o) || reoverlay) {
			if(!$.fn.popup.ovr ) $.fn.popup.ovr  = $("<div id='popup-overlay'>").css({
		    	position: $.browser.msie?'absolute':'fixed', width: '100%', height: $.ie6?$(window).height():"100%", top:0, left:0
		    }).appendTo("body");
		    if(!o.overlay) $.fn.popup.ovr.hide();	     
		    else {
		    	if(o.overlay == 'transparent') o.overlay = { opacity: 0 };
		    	$.fn.popup.ovr.show().css(o.overlay).css({ zIndex: 60000000 + o.popups.length + 1 }); 
		    }
		    if(!reoverlay) {
				if( o.url && !o.content ) { o.content =''; $.fn.popup.load(o); } 
				else if( o.content ) $.fn.popup.open(o);
				else if (!o.content) {       
					if(o.self.length) {        		
						o.content = $('<div>').append( o.self.eq(0).clone() ).html();
						$.fn.popup.open(o);
					}
					else $.fn.popup.close(null, o);
				}     
			}   
		}   
    };
    
    $.fn.popup.load = function(o) {
    	$.fn.popup.comein(o, $.fn.popup.construct(o, o.loading), function() {  	
			$.ajax({
				url: o.url, type: 'GET', dataType: o.dataType,
				beforeSend: function(xhr) { return o.beforeLoad(o, xhr) !== false; },        		
				success: function(data) { 
					o.data = data;  
					if( o.dataType == 'html' && o.data.charAt(0) == '{' ) {
						o.data = $.parseJSON(data);
						o.dataType = "json";
					}
					else if(o.dataType == 'json' && typeof o.data != 'object') o.dataType = "html";				
					switch( o.dataType ) {        			
		    			case 'json': 
		    				if(o.data.redirect) { $.fn.popup.lock = false; document.location=o.data.redirect; return false; }
		    				if(o.data.overlay) { $.fn.popup.preload(o, false, true); }
		    				o = $.extend({}, o, o.data);  
		    			break;
		    			case 'html' : default : o.content = o.data; break;
					}
					$.fn.popup.open(o);
				},
				error: function(xhr, ajaxOptions, thrownError) {
					o.data = {};
					o.content = xhr.responseText;
		    		$.fn.popup.open(o); 
				}
			});
		});
    }; 
    
	$.fn.popup.comein = function(o, popup, callback) {				
		switch(o.effect) {        	
    		case 'slide':
    			var css = { left: o.p.left, top: -o.p.height-210 };
    			var anime = { left: o.p.left, top: o.p.top };
	        break;
    		case 'fade' : default :
    			var css = { opacity: 0, left: o.p.left, top: o.p.top }
    	        var anime = { opacity : 1 };
    		break;        		
    	}
		popup.css(css).stop(true,  true).animate(anime, o.duration-50, callback);
    }
    
    $.fn.popup.comeout = function(o, popup, callback) {	
    	switch(o.effect) {        	
    		case 'slide': var anime = { top: -o.p.height-210 }; break;
    		case 'fade' : default : var anime = { opacity: 0 }; break;
    	}
		popup.stop(true, true).animate(anime, o.duration-150, callback);
    }	
    
    $.fn.popup.open = function(o, loader, popup) {
    	loader = o.popup;
    	popup = $.fn.popup.construct(o);
    	if(loader) {
    		loader.stop(true, true).animate({ top: o.p.top, left: o.p.left }, o.duration, function() {     			
    			popup.css({ opacity: 0, left: o.p.left, top: o.p.top }).animate({ opacity : 1 }, o.duration-50, function() {     				
    				popup.css({ opacity : '' }); 
    				loader.remove();     				
    				$.fn.popup.opened(o); 
    			}); 
    		});
    		$.fn.popup.overflow(o, loader).stop(true, true).animate({ height: o.p.overflow.height(), width: o.p.overflow.width() }, o.duration);
    	}
    	else $.fn.popup.comein(o, popup, function() { $.fn.popup.opened(o); });
    }    

    $.fn.popup.construct = function(o, loading) {    	
    	var content = o.template; 
    	for(opt in o) content=content.replace('%'+opt, o[opt]);
    	var jcontent = $(content);    	
    	if(jcontent.length) o.popup = jcontent;
    	else o.popup = $('<div>'+content+'</div>');     	
    	o.popup.addClass(loading ? $.fn.popup.meta+'l' : $.fn.popup.meta).css({ height:$.ie6?"1%":"auto",position:'absolute',left:0, top:-99999, zIndex:60000000 + o.popups.length + (loading ? 1 :2) }).appendTo("body")[0].popup = o;
    	o.popup.find(o.closeTrigger).click(function(){ $.fn.popup.close(this, o); return false; });
    	o.popup.find(o.okTrigger).click(function(){ o.ok(o); return false; });
    	o.popup.find(o.cancelTrigger).click(function(){ o.cancel(o); return false; });
    	if(o.selfClose) o.popup.click(function(){ $.fn.popup.close(null, o); return false; })
    	$.fn.popup.ovr.unbind('click').click(function() {
	    	o.clickOut(o);
	    	if(o.outClose) $.fn.popup.close(null, o);         	
	    });
    	o.p = $.fn.popup.position(o, o.popup, loading);    	
    	return o.popup;
    }
    $.fn.popup.correct = function(o, popup) {
    	//if(o.loader && popup) { popup.css({ opacity : '' }); o.loader.remove(); o.loader = null; }
    	if(!o.popupIsClosed) {
	    	o.p = $.fn.popup.position(o, o.popup); 
	    	o.popup.stop(true).animate({ left: o.p.left, top: o.p.top }, 100);
	    	o.timeout = setTimeout(function() { $.fn.popup.correct(o); }, 110);
    	}
    }
    $.fn.popup.opened = function(o) {
    	if(!o.position) o.timeout = setTimeout(function() { $.fn.popup.correct(o, o.popup); }, o.duration+1050);     	
    	if(o.delay)setTimeout(function() { if(!o.popupIsClosed) $.fn.popup.close(null, o); }, o.delay);
    	o.afterOpen(o);
    }
    $.fn.popup.overflow = function(o, popup) {
    	var overflow = popup.find(o.overflow).eq(0);
    	if( !overflow.length ) overflow = popup
    	return overflow.css("overflow-y", "auto");  
    }
    $.fn.popup.position = function(o, popup, loading) {

    	var overflow = $.fn.popup.overflow(o, popup);
    	if(loading) overflow.css(loading);
    	var w_w = $(window).width();
    	var w_h = $(window).height();
    	var w_s = $.browser.msie?document.documentElement.scrollTop:window.pageYOffset;
    	var p_h = popup.height();
    	var p_w = popup.width();
    	var f_h = p_h + overflow.innerHeight() - overflow.height();
    	var dec = p_h - overflow.height();
        
        if(f_h >= w_h - (o.marginBottom*2))
        {
        	p_h = Math.max(10, w_h - (o.marginBottom*2) );
        	f_h = p_h - dec;
        	overflow.css({ height: f_h });        	
        }
        else overflow.css(loading ? {} : { height: 'auto' });  
   	
        p_h = popup.height(); 
        
        if(o.position) {
       	
	        if( typeof o.position == "object" ) {
	        	if(!o.position.target || o.position.target == 'self' ) var target = o.self;
			    else var target = $(o.position.target);
			    if(!target.length) target = o.self;
			    
			    var nl = target.offset().left + o.position.x;
	       		var nt = target.offset().top - (p_h+parseInt(popup.css('paddingTop'))+parseInt(popup.css('paddingBottom'))) + o.position.y;
	        }
	        else {
	        	
	        }
        }
        else {
	        var nl = Math.max( o.marginBottom*2, (w_w-p_w) / 2 );
	        var nt = Math.max( o.marginBottom*2, (w_h-p_h) / 2) + w_s;
        }
        return { left: nl, top: nt, height: p_h-dec, width: popup.width(), overflow: overflow };
    };
    $.fn.popup.retrieve = function(self, o) { 
    	self=$(self);
    	if(!o) {
    		o = self[0].popup;
			if(!o) o = self.parents($.fn.popup.metaclass);
			if(!o) o = self.parents($.fn.popup.metaclass+'l');
			if(!o) o = $($.fn.popup.metaclass);
			if(!o) o = $($.fn.popup.metaclass+'l');
			o = o.length && o[0].popup ? o[0].popup : null;
			if(o && !o.popup) o.popup = $($.fn.popup.metaclass);
    	}
    	return o;
    };
    $.fn.popup.close = function(self, o) {   	
    	o = $.fn.popup.retrieve(self, o); 		
		if(o && o.beforeClose(o)) {
			if(o.loader) o.loader.remove();
			o.popupIsClosed=true;
			o.popups = $($.fn.popup.metaclass);
    		clearTimeout(o.timeout); 
    		$.fn.popup.comeout(o, o.popup, function() {
    			o.popup.remove();
    			if(!(o.popups.length - 1) && o.overlay) $.fn.popup.ovr.stop(true, true).animate({ opacity:0 }, 100, function(){ $.fn.popup.ovr.hide(); });
				else if(o.overlay) $.fn.popup.ovr.show().css({ zIndex: 60000000 + o.popups.length - 1 });
				o.afterClose(o);
    		})
    		$.fn.popup.lock = false;
		}
		return self;    	
    };
    
	$.fn.popup('default', 
	'<div id="%id" class="popup %classname" style="width:%width;">\
		<div class="popup-title"><a class="popup-close">x</a><h2>%title</h2></div>\
	    <div class="popup-content popup-overflow">%content</div>\
	    <div class="popup-bottom"></div>\
	</div>', { 
		width: $.support.boxModel? '535px':'auto',
		loading: { height: 200 }
	});

})(jQuery);
