(function($){ // secure the $ jQuery alias
/******************************************************************************/
// jquery.Verify.js - rev 3
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2009-02-19 | Updated: 2009-02-27
/******************************************************************************/
// REQUIRES: jquery 1.3.x
/******************************************************************************/
// extend the jquery prototype
$.fn.Verify = function( opts ){
	opts = $.extend( {}, $.Verify.defaults, opts || {} );
	return this.each(function(){ new $.Verify( this, opts ); });
	};
/******************************************************************************/
// instance constructor...
$.Verify = $.extend( function( elem, opts ){
	var self = this;
	// store the arguments
	self.form = elem;
	self.opts = opts;
	// bind some form events...
	self.$form = $( elem ).bind("submit verify focusout keyup click", function(){
		return self.handle.apply( self, arguments ); 							
		});
	// optional listeners...
	if ( opts["verify:field"] ) // delegate the FIELD decorator
		self.$form.delegate( "verify:field", ":input", opts["verify:field"] );
	if ( opts["verify:form"] ) // bind the FORM decorator
		self.$form.bind( "verify:form", opts["verify:form"] );
	// create the message decorator...
	self.format = opts.formatError || function(x){ return x; };
	// pre-inspect the form...
	self.prepare();
	},{
/******************************************************************************/
	// global default options
	defaults: {
		formatError: function( str ){
			var name = $.data( this, "verify.name" ) || 
				$.data( this, "verify.name", $( this ).prev('label').text() );
			return str.replace( /{field}/g, name ); 	
			},
		"verify:field": function( event ){
			var $p = $( this ).parents('p'), error = event.detail[0];
			$p[ error ? "addClass" : "removeClass" ]("req").find('span:last').remove();
			if ( error ) $p.append('<span>'+( event.detail[0] || "" )+'</span>');
			},
		"verify:form": function( event ){
			var i = event.detail.length;
			$('#msg').html( i ? "Please fix the "+ i +" error"+( i>1 ? "s" : "" )+"." : "" );
			}
		},
/******************************************************************************/
	// instance methods...
	prototype: {
		prepare: function(){ 
			var self = this, data;
			self.propagate = false;
			// filter all fields in the form...
			self.$fields = $( ":input", self.$form ).map(function(){
				// keep if it matches a rule... or remove...
				return $( this ).is( $.Verify.anyRule ) ? 
					$.data( this, "verify.errors", [] ) && this : 
					$.removeData( this, "verify.errors" );
				});
			return self.$fields;
			},
		handle: function( event ){
			var self = this, elem = event.target, ok;
			switch ( event.type ){
				case 'submit': 
				case elem==self.form && 'verify':
					self.prepare().each(function(){ // all fields
						self.verify( this, event ); // verify:field
						});
					self.callback( event ); // verify:form
					return !self.errors().length;
				case 'click':
					ok = $( elem ).is(":radio,:checkbox");
					if ( ok && elem.name ) // find first of same name for rules
						elem = self.$form.find('[name='+ elem.name +']')[0];
					ok = ok && $.data( elem, 'verify.tested' ); // be unobtrusive
					break;
				case 'keyup':
					ok = $( elem ).is(":text,:password,:file,select,textarea");
					// ok = ok && !$( elem ).is('.pending'); // buffer requests...
					ok = ok && $.data( elem, 'verify.tested' ); // be unobtrusive
					break;	
				case 'focusout': // "blur"
					ok = $( elem ).is(":text,:password,:file,select,textarea");
					break;	
				case 'verify': 
					ok = true;
					break;
				}
			if ( ok ){
				self.propagate = true;
				self.verify( elem, event );
				}
			},
		verify: function( field, event ){
			if ( !$.data( field, 'verify.errors' ) ) return; // not prepared...
			var self = this, $field = $( field ), 
			errors = [], error, value = $.trim( field.value );
			$.data( field, 'verify.tested', true ); // be unobtrusive
			// test all the stored rules...
			$.each( $.Verify.rules, function( selector, rule ){
				if ( !$field.is( selector ) ) return; // skip rule
				if ( error = rule.call( field, value ) ) // execute rule
					return !errors.push( self.format.call( field, error ) ); // store result, break
				});
			event.type = "verify:field"; // set the correct handler type...
			event.detail = $.data( field, 'verify.errors', errors ); // store the errors
			$field.trigger( event ); // callback any "field" event handlers...
			if ( self.propagate ) self.callback( event ); // verify:form
			},
		callback: function( event ){			
			event.detail = this.errors(); // collect form wide errors...
			event.type = "verify:form"; // set the correct handler type...
			this.$form.trigger( event ); // callback form level events...
			this.propagate = false; // be selective in propagation
			},
		errors: function(){
			var errors = [];
			this.$fields.each(function(){
				errors = errors.concat( $.data( this, 'verify.errors' ) || [] );
				});
			return errors; // array of error strings
			}
		},
/******************************************************************************/
	// static rule definitions...
	anyRule: "", rules: {}, 
	addRule: function( selector, func ){
		if ( !func ) return;
		$.Verify.rules[ selector ] = func;// store the function...
		$.Verify.anyRule += selector+","; // store the rule for matching...
		},
	// internal, execute common rules consistently...
	applyRule: function( type, value, data, message ){
		var error;
		switch( type ){
			case data && 'require':
				if ( $( this ).is(':radio,:checkbox') )
					value = $.Verify.findCheckedByName( this ).length;
				if ( !value || (/^\s*$/).test( value ) ) 
					error = "{field} is required.";
				break;
			case data && 'checked':
				if ( $.Verify.findCheckedByName( this ).length < data )
					error = "{field} requires "+ data +" or more.";
				break;
			case value && 'pattern':
				data = data instanceof RegExp ? data : $.Verify.patterns[ data ] || new RegExp( data );
				if ( !data.test( value ) ) 
					error = "{field} is not valid.";
				break;
			case 'match':
				if ( value != $( data ).val() )
					error = "{field} does not match.";
				break;
			case 'equal':
				if ( value != data )
					error = "{field} is not correct.";
				break;
			case 'min':
				if ( value < data )
					error = "{field} is below the minimum.";
				break;
			case 'max':
				if ( value > data )
					error = "{field} is above the maximum.";
				break;
			case 'minlength':
				if ( value.length < data )
					error = "{field} must be a minimum "+ data +" characters.";
				break;
			case 'maxlength':
				if ( value.length > data )
					error = "{field} must be a maximum "+ data +" characters.";
				break;
			default: // look for a "class" selector rule...
				data = $.Verify.rules["."+ type ];
				if ( data ) error = data.call( this, value ); 
				break;
			}	   
		// possible to set a custom message...
		return error && message || error;
		},
	findCheckedByName: function( elem ){
		return $( elem ).closest('form')
			.find('[name='+ elem.name +']')
			.map(function(i,el){ 
		 	 	return el.checked ? el : null; 
				});
		},
	patterns: {
		// name@email.com | name@192.168.1.100 | "my name"@email.com.de
		"email": (/^.+@([^\.]+.*\.)+[a-z0-9]{2,}$/),
		// US: 1-617-555-1234 | (617)555-1234 | 617/555.1234 | 6175551234
		"phone": (/^1?[^a-z0-9]*\(?\s*([2-9]\d\d)\s*\)?[^a-z0-9]*([\d]{3})[^a-z0-9]*([\d]{4})$/),
		// US: 01776 | 01776-1234
		"zipcode": (/^[0-9]{5}(-[0-9]{4})?$/),
		// only numbers allowed
		"numeric": (/^(?:-?\d*\.?\d+(?:e[\+\-]\d+)?)|Infinity$/),
		"integer": (/^\d+$/)
		}
	});
/******************************************************************************/	
// create a selector rule for custom attr metadata...
$.Verify.addRule( "[verify]", function( val ){
	var el = this, msg, data = $.data( el, 'verify.meta' );
	if ( !data ){ // extract data from attribute
		data = el.getAttribute && el.getAttribute('verify') || 'null'; 
		if ( data.indexOf('{') < 0 ) data = "{" + data + "}"; // fix bad json
		try { window['eval']("data = ("+ data +");"); } catch (e){ data = null; } // interpret
		data = $.data( el, 'verify.meta', data ); // cache and return the data
		}
	$.each( data || {}, function( key ){
		msg = $.Verify.applyRule.call( el, key, val, data[ key ], data.error );
		return !msg; // break at 1st message
		});
	return msg;
	});
/******************************************************************************/
// utilize "live" events (sort of)
$.fn.delegate = function( type, selector, fn ){
	var proxy = $.event.proxy( fn );
	proxy.guid += selector + type;
	type = type +'.'+ selector.replace(/\./g, "`").replace(/ /g, "|");
	return this.bind( "live."+ type, selector, proxy );
	};
/******************************************************************************/
// simulate bubbling "focusout/focusin" with "blur/focus" event capturing... 
// from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
$.each({ focus:'focusin', blur:'focusout' }, function( orig, custom ){
	$.event.special[ custom ] = !$.browser.msie && {
		setup: function(){
			this.addEventListener( orig, $.event.special[ custom ].handle, true );
			},
		handle: function( event ){
			event = $.event.fix( event ); // normalize event
			event.type = custom; // hijack the event
			return $.event.handle.call( this, event ); 
			},
		teardown:function(){
			this.removeEventListener( orig, $.event.special[ custom ].handle, true );
			}
		};
	});
/******************************************************************************/
})(jQuery) // secure the $ jQuery alias