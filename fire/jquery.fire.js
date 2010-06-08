;(function($){

// jQuery method
$.fn.fire = function( type, opts ){
	return this.each(function(){
		new $.fire( this, type, opts );
	});
};		   

// Constructor
$.fire = function( element, type, opts ){
	this.element = element;
	this.type = type;
	this.opts = $.extend( {}, $.fire.defaults, opts );
	this.event = this.create( type, opts );
	this.dispatch();
};

// Defaults 
$.fire.defaults = {
	bubbles: true, 
	cancelable: true, 
	view: window, 
	detail: 0,
	screenX: 0, 
	screenY: 0, 
	clientX: 0, 
	clientY: 0,
	ctrlKey: false, 
	altKey: false, 
	shiftKey: false, 
	metaKey: false,
	button: 0
};

// Methods
$.fire.prototype = {
	create: function(){
		switch ( this.type ){
			case "mousemove":
				this.opts.cancelable = false;
			case "mousedown":
			case "mouseup":
			case "mouseover":
			case "mouseout":
			case "click":
			case "dblclick":
				return this.mouse();
			case "keyup":
			case "keypress":
			case "keydown":
				return this.key();
		}
	},
	mouse: function(){
		var event, opts = this.opts;
		if ( document.createEvent ){
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(
				this.type, 
				opts.bubbles, 
				opts.cancelable, 
				opts.view, 
				opts.detail,
				opts.screenX, 
				opts.screenY, 
				opts.clientX, 
				opts.clientY,
				opts.ctrlKey, 
				opts.altKey, 
				opts.shiftKey, 
				opts.metaKey,
				opts.button, 
				$( opts.releatedTarget )[0] || document.body.parentNode 
			);
		} 
		else if ( document.createEventObject ) {
			event = $.extend( document.createEventObject(), opts );
			event.button = { 0:1, 1:4, 2:2 }[ event.button ] || event.button;
		}
		return event;
	},
	key: function(){
		var event, opts = this.opts;
		if ( document.createEvent ) {
			try {
				event = document.createEvent("KeyEvents");
				event.initKeyEvent(
					this.type, 
					opts.bubbles, 
					opts.cancelable, 
					opts.view,
					opts.ctrlKey, 
					opts.altKey, 
					opts.shiftKey, 
					opts.metaKey,
					opts.keyCode, 
					opts.charCode
				);
			} 
			catch ( err ){
				event = document.createEvent("Events");
				event.initEvent(
					this.type, 
					opts.bubbles, 
					opts.cancelable
				);
				$.extend( event, { 
					view: opts.view,
					ctrlKey: opts.ctrlKey, 
					altKey: opts.altKey, 
					shiftKey: opts.shiftKey, 
					metaKey: opts.metaKey,
					keyCode: opts.keyCode, 
					charCode: opts.charCode
				});
			}
		} 
		else if ( document.createEventObject ){
			event = $.extend( document.createEventObject(), opts );
		}
		if ( $.browser.msie || $.browser.opera ){
			event.keyCode = opts.charCode > 0 ? opts.charCode : opts.keyCode;
			event.charCode = undefined;
		}
		return event;
	},
	dispatch: function(){
		if ( this.element.dispatchEvent )
			this.element.dispatchEvent( this.event );
		else if ( this.element.fireEvent )
			this.element.fireEvent( 'on'+this.type, this.event );
	}
};

})( jQuery );

