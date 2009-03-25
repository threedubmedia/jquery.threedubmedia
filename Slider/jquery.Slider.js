(function($){ // confine scope
/*******************************************************************************************/
// jQuery.Slider.js - rev 14 
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2007-02-27 | Updated: 2008-09-09
/*******************************************************************************************/
// REQUIRES: jquery 1.2.3+, utils.js, jquery.Register.js (rev 16+), jquery.event.drag.js
/*******************************************************************************************/
var PLUGIN = "Slider", // Register the PLUGIN... and public methods...
$reg = new $.Register( PLUGIN, "enable,disable,destroy,value".split(',') );
/*******************************************************************************************/
// the jquery extension
$.fn[ PLUGIN ] = function( arg ){ 
	if ( is.String( arg ) ){ // call a single public method
		var args = Slice( arguments, 1 );
		return this.each(function(){ $reg.call( this, arg, args ); });
		}
	// inherit defaults
	var opts = $.extend( {}, $[ PLUGIN ].defaults, arg||{} );
	// initialize the new feature
	return this.each(function(){ 
		var type = $(this).is(':'+PLUGIN) ? false : $(this).attr('type');
		if ( type=='text' || type=='hidden' || type=='button' ) 
			new $[ PLUGIN ].create( this, opts ); 
		}); 
	}; 
/*******************************************************************************************/
// the default settings
$[ PLUGIN ].defaults = {
	val:			50, // the value to be set
	min:			0, // the minimum value
	max:			100, // the maximum value
	step:			20, // number of range subdivisions : (max-min)/snap = increments : (100-0)/20 = 5 
	insert:			"before", // string "after" or "before"
	axis:			"H", // horizontal|h|x [or] vertical|v|y
	activeClass:	"Slider_active",
	disabledClass:	"Slider_disabled",
	wrapClass:		"Slider_wrap", 
	trackClass:		"Slider_track", 
	handleClass:	"Slider_handle", 
	inputClass:		"Slider_input", 
	round: 			2, // number of decimal places to round to (-1=10s, 0=integer, 1=1/10ths)
	invert: 		false, // flip the max/min values: 100=>0, 0=>100
	formatValue:	null, // optional value formatting (like $cash())
	unformatValue:	null, // optional for cleaning up user entered values
	onChange: 		null
	};	
/*******************************************************************************************/
// initialize the feature
$[ PLUGIN ].create = function( input, opts ){ 
	var self = $reg.add( input, this, { // register the instance 
		input: input, opts: opts, // store the args
		$input: $(input).addClass(opts.inputClass)
		}); 
	// create/insert the DOM elements
	self.$handle = $(dv).addClass(opts.handleClass);
	self.$track = $(dv).addClass(opts.trackClass).append( self.$handle );
	self.$wrap = $(dv).addClass(opts.wrapClass).append( self.$track )
		[ (/after/i).test(opts.insert) ? "insertAfter" : "insertBefore" ]( self.$input );
	// apply options, calculate ranges
	self.X = (/[hx]/i).test(opts.axis);
	var size = self.$track[ self.X ? "width" : "height" ](),
	mn = is.Number(opts.min) ? opts.min : $[ PLUGIN ].defaults.min,
	mx = is.Number(opts.max) ? opts.max : $[ PLUGIN ].defaults.max,
	st = is.Number(opts.step) ? opts.step : $[ PLUGIN ].defaults.step,
	snap = (size/opts.step), step = ((mx-mn)/opts.step);
	// some helper functions...
	self.change = function(v,fv){ if (is.Function(opts.onChange)) opts.onChange.call(self.$input[0],v,fv); };
	self.format = function(v){ return is.Function(opts.formatValue) ? opts.formatValue(v) : v; };
	self.unformat = function(v){ return is.Function(opts.unformatValue) ? opts.unformatValue(v) : v; };
	self.flip = function(v){ return opts.invert ? mx-v+mn : v; };
	self.range = function(v){ return Math.max(Math.min(mx,Math.round(v/step)*step),mn); };
	self.limit = function(p){ return Math.max(Math.min(size,Math.round(p/snap)*snap),0); };
	self.pos2val = function(p){ return (p/size)*(mx-mn)+mn; };
	self.val2pos = function(v){ return Math.round(size*((v-mn)/(mx-mn))); };
	// bind DOM events...
	self.$input.bind("blur"+self.NS, function(){ self.value.call(self,this.value); });
	self.$track // $.event.special.drag
		.bind('dragstart'+self.NS, function( event ){
			if ( self.dragging || self.disabled ) return false;
			self.dragging = true; 
			self.$wrap.addClass(opts.activeClass);
			self.Publish( "start", event ); // "start.PLUGIN"
			})
		.bind('drag'+self.NS, {drop:false}, function( event ){
			if ( !self.dragging || self.disabled ) return false;
			var xy = self.X ? 
				event.pageX - self.$track.offset().left : 
				event.pageY - self.$track.offset().top ;
			self.position( xy ); 
			self.Publish( "move", event ); // "move.PLUGIN"				
			})
		.bind('dragend'+self.NS, function( event ){
			self.dragging = false;
			self.$wrap.removeClass(opts.activeClass);
			self.Publish( "stop", event ); // "stop.PLUGIN"
			});
	// set the provided/default value
	self.value(opts.val);
	self.Publish( "create" ); // "create.PLUGIN"
	};
/*******************************************************************************************/
// inherited methods	
$[ PLUGIN ].create.prototype = {
	// setters
	position: function(p){
		p = this.limit( p ); 
		this.$handle.css( this.X ? 'left' : 'top', p );
		if (this.dragging) this.value( this.flip(this.pos2val(p)) );
		},
	value: function(v){
		v = this.range( this.unformat(v) ); 
		if (is.Number(this.opts.round)) v = Round(v,this.opts.round);
		var fv = this.format(v); // return false to cancel
		if (is.Number(v) && v!=this.lastV && fv!==false ){ // value changed
			this.lastV = v;
			this.$input.val( fv||v ); 
			if (!this.dragging) this.position( this.val2pos(this.flip(v)) ); 
			this.change(v,fv||v); // onChange callback
			}
		},	
	// controllers
	enable: function(){ 
		this.disabled = false;
		this.$input[0].disabled = false;
		this.$wrap.removeClass(this.opts.disabledClass);
		this.Publish( "enable" );  // "enable.PLUGIN"
		},
	disable: function(){ 
		this.disabled = true;
		this.$input[0].disabled = true;
		this.$wrap.addClass(this.opts.disabledClass);
		this.Publish( "disable" ); // "disable.PLUGIN"
		},
	destroy: function(){ 
		this.$input.unbind( this.NS ).removeClass(this.opts.inputClass);
		this.$track.unbind( this.NS );
		this.$wrap.remove().empty(); // cleanup the DOM 
		this.Publish( "destroy" ); // "destroy.PLUGIN"
		$reg.drop( this ); // unregister 
		objectDestroy( this ); // self destruct
		}
	};
/*******************************************************************************************/
// private vars
var dv = '<div></div>';
/*******************************************************************************************/
})(jQuery) // secure the $ jQuery alias