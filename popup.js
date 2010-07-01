(function($){  
	
	$.fn.popup = function(o, type) 
    {    	
    	if( o === false ) return $.fn.popup.close(this);
    	if( typeof o == "string" ) {  
    		if( o == "close" ) return $.fn.popup.close(this);
    		else if( o == "cancel" || o == "ok") { var opt = $.fn.popup.retrieve(this); if(opt) opt[o](opt); return false; }
    		else if( type ) { $.fn.popup.types[o] = type; return this; }
    	}
    	if( $.fn.popup.lock ) return this; $.fn.popup.lock = true;   	
    	
    	o = $.fn.popup.define({			
			overlay:		{ opacity:0.6, background: '#000' },
			loading:		{ height: 100, background: 'url(/images/css/base/31.gif) no-repeat center center white' },
			scroll:			false,
			template:		'',
			overflow: 		'.popup-overflow',
			type: 			'default',
			dataType:		'html',
			width:			$.support.boxModel?'542px':'auto',
			position:		false,
			effect:			'fade', //'slide',
			content: 		null,
			marginBottom: 	10,	
			cancelTrigger:	'a.cancel',
			cancel:			function(o) { $.fn.popup.close(this, o); },			
			okTrigger:		'a.ok',
			ok:				function(o) { $.fn.popup.close(this, o); },	
			closeTrigger:	'a.close',
			beforeClose:	function(o) { return true; },
			afterClose: 	function(o) {},
			beforeOpen: 	function(o) { return true; },
			afterOpen: 		function(o) {},
			url: 			this.attr('href'),
			title: 			this.attr('title')		
		}, o, {			
			self: 			this,
			popup: 			null,			
			minHeight:		$.support.boxModel?"1%":"auto"
		});
		o.popups = $($.fn.popup.metaclass);
        if( o.url && !o.content ) {	        	
        	$.ajax({
        		url: o.url, type: 'GET', dataType: o.dataType,
        		beforeSend: function(xhr) { 
        			if(o.beforeOpen(o, xhr)) {
        				$.fn.popup.preload(o, o.loading);
        				return true;
        			}
        			else { $.fn.popup.lock = false; return false };
        		},        		
        		success: function(data) { 
        			o.data = data;    			
        			if( o.dataType == 'html' && o.data.charAt(0) == '{' ) {
        				o.data = $.parseJSON(data);
        				o.dataType = "json";
        			}
        			else if(o.dataType == 'json' && typeof o.data != 'object') {
        				o.dataType = "html";
        			}
        			
        			switch( o.dataType ) {        			
	        			case 'json': 
	        				if(o.data.redirect) { $.fn.popup.lock = false; document.location=o.data.redirect; return false; }
	        				o = $.extend({}, o, o.data);  
	        			break;
	        			case 'html' : default : o.content = o.data; break;
        			}
        			$.fn.popup.load(o);
        		},
        		error: function(xhr, ajaxOptions, thrownError) {
        			o.data = {};
        			o.content = xhr.responseText;
	        		$.fn.popup.load(o); 
        		}
        	});
        }   
        else if(o.content && o.beforeOpen(o)) { $.fn.popup.preload(o); }
        else if (!o.content) {
        	if(o.self.length) {
        		o.content = $('<div>').append( o.self.eq(0).clone() ).html();
        	}
        	else $.fn.popup.close(null, o);
        }
        
    	return this;
    };
    $.fn.popup.types = {};
    $.fn.popup.meta = 'ba3bff91d5c461fa22da2e9c83fd3ba9';
    $.fn.popup.metaclass = '.'+$.fn.popup.meta;
    $.fn.popup.define = function(defaults, o, extra) {
    	if(!o) o={};
    	var model = ( o.type ? ( $.fn.popup.types[o.type] ? $.fn.popup.types[o.type] : o.type ) : $.fn.popup.types[defaults.type] );
    	if(typeof model == 'object') {
			if(model.length >= 1) o.template = model[0];
			if(model.length > 1 && typeof model[1] == "object") defaults = $.extend(defaults, model[1]);			
		}
    	else if(typeof model == 'string') o.template = model;
    	return $.extend(defaults, o, extra);
    };
    $.fn.popup.preload = function(o, loading) {
    	if(!$.fn.popup.ovr ) 
        	$.fn.popup.ovr  = $("<div id='popup-overlay'>").css({
        	position: $.browser.msie?'absolute':'fixed', width: '100%', height: $.ie6?$(window).height():"100%", top:0, left:0
        }).appendTo("body");
        $.fn.popup.ovr.show().css(o.overlay).css({ zIndex: 60000000 + o.popups.length + 1 });       
        $.fn.popup.load(o, loading);
    };
    
    $.fn.popup.load = function(o, loading, popup, pos) {
    	$.fn.popup.lock = false;
    	if(loading) o.content = '';    	
    	if(!o.loader) o.loader = o.popup;
    	popup = $.fn.popup.construct(o);     	
    	if(!popup.length) return o.self.popup();      	
    	var overflow = $.fn.popup.overflow(o, popup);
    	if(loading) overflow.css(o.loading); 
    	
    	// Popup append (is ready)
    	popup.addClass($.fn.popup.meta).css({ height:$.ie6?"1%":"auto",position:'absolute',left:0, top:-99999, zIndex:60000000 + o.popups.length + (o.loader ? 2 : 1) }).appendTo("body")[0].popup = o;
    	popup.find(o.closeTrigger).bind('click', function(){ $.fn.popup.close(this, o); return false; });
    	pos = $.fn.popup.position(o, popup, loading);   
    	
    	if(o.loader && !loading) {
    		o.loader.stop(true, true).animate({ top: pos.top }, 350, function() {     			
    			popup.stop().css({ opacity: 0, left: pos.left, top: pos.top }).animate({ opacity : 1 }, 200, function() { 
    				if(o.loader) { popup.css({ opacity : '' }); o.loader.remove(); o.loader = null; }    				
    				if(!o.position) o.timeout = setTimeout(function() { $.fn.popup.correct(o); }, 1400);
    			}); 
    		});
    		$.fn.popup.overflow(o, o.loader).stop(true, true).animate({ height: pos.height }, 350);
    	}
    	else {
    		switch(o.effect) {        	
	    		case 'slide':
	    			var css = { left: pos.left, top: -pos.height-10 };
	    			var anime = { left: pos.left, top: pos.top };
		        break;
	    		case 'fade' : default :
	    			var css = { opacity: 0, left: pos.left, top: pos.top }
	    	        var anime = { opacity : 1 };
	    		break;        		
	    	}
    		popup.css(css).animate(anime, 200, function() {
    			if(!o.position) o.timeout = setTimeout(function() { $.fn.popup.correct(o); }, 1400);
    		});
    	}    	
    	o.popup = popup;
    	if(!loading) $.fn.popup.opened(o);    	
    };
    $.fn.popup.construct = function(o) {
    	var content = o.template; 
    	for(opt in o) content=content.replace('%'+opt, o[opt]);
    	var jcontent = $(content);
    	if(jcontent.length) return jcontent;
    	else return $('<div>'+content+'</div>'); 
    }
    $.fn.popup.correct = function(o) {
    	if(o.loader) { popup.css({ opacity : '' }); o.loader.remove(); o.loader = null; }
    	if(!o.popupIsClosed) {
	    	pos = $.fn.popup.position(o, o.popup); 
	    	o.popup.stop(true).animate({ left: pos.left, top: pos.top }, 100);
	    	o.timeout = setTimeout(function() { $.fn.popup.correct(o); }, 110);
    	}
    }
    $.fn.popup.opened = function(o) {       	
    	if(o.delay)setTimeout(function() {
			if(!o.popupIsClosed) $.fn.popup.close(null, o);
		}, o.delay);
    	o.afterOpen(o);
    }
    $.fn.popup.overflow = function(o, popup) {
    	var overflow = popup.find(o.overflow).eq(0);
    	if( !overflow.length ) overflow = popup
    	return overflow.css("overflow-y", "auto");  
    }
    $.fn.popup.position = function(o, popup, loading) {

    	var overflow = $.fn.popup.overflow(o, popup);
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
        else {
        	overflow.css(loading ? {}:{ height: 'auto' });        	
        }
        p_h = popup.height();  
        
        if(o.position) {
        	var nl = o.self.offset().left;
	        var nt = o.self.offset().top - (p_h+
    				parseInt(popup.css('paddingTop'))+
    				parseInt(popup.css('paddingBottom')));
	        if( typeof o.position == "object" ) {
	        	nl = nl + o.position.dx;
	        	nt = nt + o.position.dy;
	        }
        }
        else {
	        var nl = Math.max( o.marginBottom*2, (w_w-p_w) / 2 );
	        var nt = Math.max( o.marginBottom*2, (w_h-p_h) / 2) + w_s;
        }
        return { left: nl, top: nt, height: p_h-dec };
    };
    $.fn.popup.retrieve = function(self, o) { 
    	self=$(self);
    	if(!o) {
    		o = self[0].popup;
			if(!o) o = self.parents($.fn.popup.metaclass);
			if(!o) o = $($.fn.popup.metaclass);
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
    		switch(o.effect) {        	
	    		case 'slide': var anime = { top: -self.height()-10 }; break;
	    		case 'fade' : default : var anime = { opacity: 0 }; break;
	    	}
    		o.popup.stop(true, true).animate(anime, 150, function() {
    			$(this).remove();
    			if(!(o.popups.length - 1)) $.fn.popup.ovr.animate({ opacity:0 }, 100, function(){ $.fn.popup.ovr.hide(); });
				$.fn.popup.ovr.show().css({ zIndex: 60000000 + o.popups.length - 1 });
				o.afterClose(o);
    		});
    		$.fn.popup.lock = false;
		}
		return self;    	
    };
    
    $.fn.popup('default', 
	['<div id="%id" class="popup %class" style="margin: auto; width: %width; position:relative;">\
		<div id="popup-title"><div><a class="close"></a></div></div>\
	    <div id="popup-center" class="popup-overflow"><h2>%title</h2>%content</div>\
	    <div id="popup-bottom"><div></div></div>\
	</div>', {
		    
	}]);
	   					    
	$.fn.popup('confirm', 
	['<div id="%id" class="popup %class" style="margin: auto; width: %width; position:relative;">\
		<div id="popup-title"><div><a class="close"></a></div></div>\
	    <div id="popup-center" class="popup-overflow"><h2>%title</h2>%content</div>\
	    <div id="popup-bottom"><div></div></div>\
	</div>', {
		    
	}]);
	   					    
	$.fn.popup('alert', 
	['<div id="%id" class="popup %class" style="margin: auto; width: %width; position:relative;">\
		<div id="popup-title"><div><a class="close"></a></div></div>\
	    <div id="popup-center" class="popup-overflow"><h2>%title</h2>%content</div>\
	    <div id="popup-bottom"><div><input class="ok" value="OK" type="button"/></div></div>\
	</div>', {
			    
	}]);

})(jQuery);