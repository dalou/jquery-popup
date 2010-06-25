(function($){	
	
	$.fn.popup_types = {
		'default': 
'<div id="%id" class="popup %class" style="margin: auto; width: %width; position:relative;">\
	<div id="popup-title">\
		<div>\
			<a class="close" id="popup-close" onclick="jQuery(this).popup(false);"></a>\
		</div>\
    </div>\
    <div id="popup-center" class="popup-overflow">\
    	<h2>%title</h2>\
		%content\
    </div>\
    <div id="popup-bottom"><div></div></div>\
</div>',
					    
		'confirm':  
'<div id="%id" class="popup %class" style="margin: auto; width: %width; position:relative;">\
	<div id="popup-title">\
    </div>\
    <div id="popup-center" class="popup-overflow">\
    	<h2>%title</h2>\
		%content\
    </div>\
    <a id="" onclick="jQuery(this).popup(\'ok\');">%okTitle</a>\
    <a id="" onclick="jQuery(this).popup(\'cancel\');">%cancelTitle</a>\
    <div id="popup-bottom"><div></div></div>\
</div>',
					    
		'alert':  
'<div id="%id" class="popup %class" style="margin: auto; width: %width; position:relative;">\
	<div id="popup-title">\
    </div>\
    <div id="popup-center" class="popup-overflow">\
    	<h2>%title</h2>\
		%content\
		<a onclick="jQuery(this).popup(\'ok\');"><input class="cancel"  value="%okTitle" type="button"/></a>\
    </div>\
    <div id="popup-bottom"><div></div></div>\
</div>'
					   
	};

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	    
	    
	
    

	$.fn.popup = function(o) 
    {
    	if( $.fn.popup.lock ) return this; $.fn.popup.lock = true;
    	if( o === false ) return $.fn.popup.close(this);
    	if( typeof o == "string" ) {  
    		if( o == "close" ) return $.fn.popup.close(this);
    		else if( o == "cancel" || o == "ok") {
    			var opt = $.fn.popup.retrieve(this); 
    			if (opt) opt[o](opt);
    			return false;
    		}
    	}
    	  	
		o=$.extend({			
			overlay:		{ opacity:0.6, background: '#000' },
			scroll:			false,
			overflow: 		".popup-overflow",
			type: 			'default',
			dataType:		'html',
			loading:		false,
			title:			'',
			width:			$.support.boxModel?'542px':'auto',
			position:		false,
			effect:			'fade', //'slide',
			content: 		null,
			marginBottom: 	10,	
			cancelTitle:	'Cancel',
			cancel:			function(o) { $.fn.popup.close(this, o); },
			okTitle:		'OK',
			ok:				function(o) { $.fn.popup.close(this, o); },			
			beforeClose:	function(o) { return true; },
			afterClose: 	function(o) {},
			beforeOpen: 	function(o) { return true; },
			afterOpen: 		function(o) {},
			url: 			this.attr('href'),
			title: 			this.attr('title')
		}, o, {			
			popups:			$('.ba3bff91d5c461fa22da2e9c83fd3ba9'),
			self: 			this,
			popup: 			null,			
			minHeight:		$.support.boxModel?"1%":"auto"
		});		

        if( o.url && !o.content ) {	
        	
        	$.ajax({
        		url: o.url, type: 'GET', dataType: o.dataType,
        		beforeSend: function(xhr) { 
        			if(o.beforeOpen(o, xhr)) {
        				$.fn.popup.preload(o);
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
        				alert(o.data)
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
        else if(o.content && o.beforeOpen(o)) { $.fn.popup.preload(o); $.fn.popup.load(o); }
        else if (!o.content) $.fn.popup.close(null, o);
    	return this;
    };
    
    $.fn.popup.preload = function(o) {
    	if($.fn.loading&&o.loading) $.fn.loading(); 
    	if(!$.fn.popup.ovr ) 
        	$.fn.popup.ovr  = $("<div id='popup-overlay'>").css({opacity: 0}).css({
        	position: $.browser.msie?'absolute':'fixed', width: '100%', height: $.ie6?$(window).height():"100%", top:0, left:0
        }).appendTo("body");
        $.fn.popup.ovr.show().css(o.overlay).css({ zIndex: 60000000 + o.popups.length + 1 });
    };
    
    $.fn.popup.load = function(o) {

    	if($.fn.loading&&o.loading) $.fn.loading();
    //	$(document).scroll(function(){ $(document.body).scrollTo(0); return true; })
    	$.fn.popup.lock = false;
    	if(o.type != 'none' && $.fn.popup_types[o.type] ) {
    		
    		var content = $.fn.popup_types[o.type];    		
    		for(opt in o) content=content.replace('%'+opt, o[opt]);  		
    		o.popup = $(content);
    		
    	}
    	else o.popup = $(o.content);
    	
    	if(!o.popup.length) return o.self.popup();
    	o.popup.addClass('ba3bff91d5c461fa22da2e9c83fd3ba9').css({
            height:$.ie6?"1%":"auto",position:'absolute',left:0, top:-99999,
            zIndex:60000000 + o.popups.length +1
        }).appendTo("body");
    	
    	o.popup[0].popup = o;  
    	var overflow = o.popup.find(o.overflow).eq(0);
    	if( !overflow.length ) overflow = o.popup;
    	overflow.css("overflow-y", "auto");
    	
    	$.fn.popup.timeout(o, true);
    	
    	o.afterOpen(o);if(o.delay)setTimeout(function() {
			if(!o.popupIsClosed) $.fn.popup.close(null, o);
		}, o.delay);
    };
    $.fn.popup.timeout = function(o, first) {
    	var reload = function() { 
    		o.timeout = setTimeout(function() { $.fn.popup.timeout(o); }, 20); 
    	}
    	
    	var overflow = o.popup.find(o.overflow).eq(0);
    	if( !overflow.length ) overflow = o.popup
    	overflow.css("overflow-y", "auto");
    	
    	var w_w = $(window).width();
    	var w_h = $(window).height();
    	var w_s = $.browser.msie?document.documentElement.scrollTop:window.pageYOffset;
    	var p_h = o.popup.height();
    	var p_w = o.popup.width();
    	var f_h = p_h + overflow.innerHeight() - overflow.height();
    	var dec = p_h - overflow.height();
        
        if(f_h >= w_h - (o.marginBottom*2))
        {
        	p_h = Math.max(10, w_h - (o.marginBottom*2) );
        	f_h = p_h - dec;
        	overflow.css({ height: f_h });        	
        }
        else {
        	overflow.css({ height: 'auto' });        	
        }
        p_h = o.popup.height();  
        
        if(o.position) {
        	var nl = o.self.offset().left;
	        var nt = o.self.offset().top - (p_h+
    				parseInt(o.popup.css('paddingTop'))+
    				parseInt(o.popup.css('paddingBottom')));
	        if( typeof o.position == "object" ) {
	        	nl = nl + o.position.dx;
	        	nt = nt + o.position.dy;
	        }
        }
        else {
	        var nl = Math.max( o.marginBottom*2, (w_w-p_w) / 2 );
	        var nt = Math.max( o.marginBottom*2, (w_h-p_h) / 2) + w_s;
        }
          
        if(first) {
        	switch(o.effect) {        	
        		case 'slide':
        			var css = { left: nl, top: -p_h-10 };
        			var anime = { left: nl, top: nt };
		        break;
        		case 'fade' : default :
        			var css = { opacity: 0, left: nl, top: nt }
        	        var anime = { opacity : 1 };
        		break;        		
        	}
        	o.popup.css(css).stop().animate(anime, 200, reload );
        }
        else {
        	if($.browser.msie)$.fn.popup.ovr.css({height: w_h + w_s});
        	
        	o.popup.css({ left: nl, top: nt });
        	if(!o.position) reload();  	
        	
        }
    };
    $.fn.popup.retrieve = function(self, o) { 
    	self=$(self);
    	if(!o) {
    		o = self[0].popup;
			if(!o) o = self.parents('.ba3bff91d5c461fa22da2e9c83fd3ba9');
			if(!o) o = $('.ba3bff91d5c461fa22da2e9c83fd3ba9');
			o = o.length && o[0].popup ? o[0].popup : null;
    	}
    	return o;
    };
    $.fn.popup.close = function(self, o) {    	
    	
    	o = $.fn.popup.retrieve(self, o); 		
		if(o && o.beforeClose(o)) {
			o.popupIsClosed=true;
			o.popups = $('.ba3bff91d5c461fa22da2e9c83fd3ba9');	
    		clearTimeout(o.timeout); 
    		switch(o.effect) {        	
	    		case 'slide': var anime = { top: -self.height()-10 }; break;
	    		case 'fade' : default : var anime = { opacity: 0 }; break;
	    	}
    		o.popup.stop().animate(anime, 200, function() {
    			$(this).remove();
    			if(!(o.popups.length - 1)) $.fn.popup.ovr.animate({ opacity:0 }, 100, function(){ $.fn.popup.ovr.hide(); });
				$.fn.popup.ovr.show().css({ zIndex: 60000000 + o.popups.length - 1 });
				o.afterClose(o);
    		});
    		$.fn.popup.lock = false;
		}
		return self;    	
    };

})(jQuery);
