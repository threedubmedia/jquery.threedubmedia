(function($){ // confine scope
/*******************************************************************************************/	
// jQuery.ColorPicker.js - rev 48 
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2007-02-14 | Updated: 2008-05-19
/*******************************************************************************************/
// REQUIRES: jquery 1.2.3+, utils.js, jquery.Register.js (rev 16+), Color.js, jquery.alignTo.js
/*******************************************************************************************/
var PLUGIN = "ColorPicker", // Register the PLUGIN... and public methods...
$reg = $.Register( PLUGIN, "enable,disable,destroy,value,show,hide".split(',') );
/*******************************************************************************************/
// jquery extension
$.fn[ PLUGIN ] = function( opts ){
	if ( is.String( opts ) ){ // call a single public method
		var args = Slice( arguments, 1 );
		return this.each(function(){ $reg.call( this, opts, args ); });
		}
	// inherit defaults...
	opts = $.extend( {}, $[ PLUGIN ].defaults, opts||{} );
	
	// initialize the feature
	return this.each(function(){ 
		var type = $(this).is(':'+PLUGIN) || !$(this).is('input') ? false : $(this).attr('type');
		if ( type=='text' || type=='hidden' || type=='button' ){
			// try any metadata options...	
			new $[ PLUGIN ].create( this, opts ); 
			}
		});	
	};
/*******************************************************************************************/
// plugin defaults
$[ PLUGIN ].defaults = {
	format: 		'hex',
	color: 			'#000',
//	speed: 			null,
	insert: 		"after", // String "before" or "after"
	inputClass:		"cpk_input",
	swatchClass:	"cpk_swatch",
	spanClass: 		"cpk_span",
	activeClass:	"cpk_active",
	onOpen:			false, // optional function (position the picker) // false to prevent // scope: cpk_div
	onColor:		false, // optional function // return a value to modify, false to prevent // scope: input, arg: Color Object
	// classnames used in the color picker mark-up
	pickerClass: 	"cpk_div", 
	bgClass: 		"cpk_bg",
	wheelClass:		"cpk_wheel",
	hueClass:		"cpk_hue",
	hueBgClass:		"cpk_hueBg",
	hueFgClass:		"cpk_hueFg",
	origClass:		"cpk_orig",
	origBgClass:	"cpk_origBg",
	origFgClass:	"cpk_origFg",
	currClass:		"cpk_curr",
	currBgClass:	"cpk_currBg",
	currFgClass:	"cpk_currFg",
	lumClass:		"cpk_lum",
	satClass:		"cpk_sat",
	areaClass:		"cpk_area",
	wMarkerClass:	"cpk_wMarker",
	bMarkerClass:	"cpk_bMarker",
	acceptClass:	"cpk_accept",
	rejectClass:	"cpk_reject"
	};
/*******************************************************************************************/
// plugin constructor
$[ PLUGIN ].create = function( input, opts ){
	var self = $reg.add( input, this, { input:input, opts:opts }); // register the instance, store args
	// adjust some options...
	opts.format = (/rgb/i).test(opts.format) ? "rgb" : (/hsl/i).test(opts.format) ? "hsl" : "hex";
	// init some elements
	self.$input = $(input).addClass(opts.inputClass)
		.bind( "blur"+self.NS, function(){ self.value(this.value); });
		//.bond( "blur", self, 'value' );
	//self.$span = $('<span></span>').css("position","relative").addClass(opts.spanClass)
	self.$swatch = $('<input type="button" />').addClass(opts.swatchClass)//.appendTo( self.$span )
		[ (/after/i).test(opts.insert) ? "insertAfter" : "insertBefore" ]( self.$input )
		//.bind( "click"+self.NS, function(){ self.show(); });
		.bond( "click", self, 'show' );
	self.$bgs = $( self.$swatch );
	self.value( opts.color );
	}; 
/*******************************************************************************************/
// plugin methods
$[ PLUGIN ].create.prototype = {
	init: function(){
		var o = this;
		// create the colorpicker mark-up and references
		o.$picker = $(div).addClass(o.opts.pickerClass).appendTo(document.body); 
			o.$bg = $(div).addClass(o.opts.bgClass).appendTo(o.$picker);
			o.$wheel = $(div).addClass(o.opts.wheelClass).appendTo(o.$picker);
				o.$hue = $(div).addClass(o.opts.hueClass).appendTo(o.$wheel);
					o.$hueBG = $(div).addClass(o.opts.hueBgClass).appendTo(o.$hue);
					o.$hueFG = $(div).addClass(o.opts.hueFgClass).appendTo(o.$hue);
			o.$reset = $(div).addClass(o.opts.origClass).appendTo(o.$picker);
				o.$resetBG = $(div).addClass(o.opts.origBgClass).appendTo(o.$reset);
				o.$resetFG = $(div).addClass(o.opts.origFgClass).appendTo(o.$reset);
			o.$curr = $(div).addClass(o.opts.currClass).appendTo(o.$reset);
				o.$currBG = $(div).addClass(o.opts.currBgClass).appendTo(o.$reset);
				o.$currFG = $(div).addClass(o.opts.currFgClass).appendTo(o.$reset);
			o.$lum = $(div).addClass(o.opts.lumClass).appendTo(o.$picker);
			o.$sat = $(div).addClass(o.opts.satClass).appendTo(o.$picker);
			o.$area = $(div).addClass(o.opts.areaClass).appendTo(o.$picker);
				o.$xy = $(div).addClass(o.opts.bMarkerClass).appendTo(o.$area);
			o.$accept = $(div).addClass(o.opts.acceptClass).appendTo(o.$picker);
			o.$reject = $(div).addClass(o.opts.rejectClass).appendTo(o.$picker);
		o.$bgs = o.$bgs.add( o.$currBG ); // the background colors to update
		o.$bgHue = $( o.$area ).add( o.$hueBG ); // the background hues to update
		// make IE6 and lower happy, if possible
		try{ $('*',o.$picker).png(); } catch(ex){}
		try{ o.$picker.bgiframe(); } catch(ex){} 
		// calculate/store the dimensions to do the math
		o.innerRadius = parseInt(o.$wheel.css('width'))/2;
		o.outerRadius = o.innerRadius+parseInt(o.$wheel.css('padding-top'));
		o.hueAdj = { x: o.$hue.width()/2, y: o.$hue.height()/2 };
		var x = o.$hue[0].offsetLeft - o.outerRadius + o.hueAdj.x;
		var y = o.$hue[0].offsetTop - o.outerRadius + o.hueAdj.y;
		o.radius = Math.sqrt( Math.pow(x,2) + Math.pow(y,2) ); // radius to follow
		o.areaScale = { x: o.$area.width()/100, y: o.$area.height()/100 };
		o.ready = true; 
		//o.hide();
		},
	"value": function(c){
		var o = this, fmt = this.opts.format;
		if (!o.disabled){
			o.clr = Color( c || o.clr );
			var color = (is.Function(o.opts.onColor)) ? o.opts.onColor.call(o.$input[0],o.clr[fmt]) : null;
			if (color!==false){
				//clr = Color(color||clr); // makes picker choppy
				o.$input.val( color || o.clr[fmt] );
				o.$bgs.css('background-color',o.clr.html());
				if (o.ready && o.isOpen){
					o.$bgHue.css('background-color',o.clr.sat(100).lum(50).html());
					var angle = (o.clr.H/360)*2*Math.PI;
					o.$hue.css({ // hue marker
						left: Math.round(Math.sin(angle)*o.radius+o.outerRadius)-o.hueAdj.x,
						top: Math.round(-Math.cos(angle)*o.radius+o.outerRadius)-o.hueAdj.y
						});
					o.$xy.css({ // sat/lum marker
						left: Math.round(o.areaScale.x*(100-o.clr.S)),
						top: Math.round(o.areaScale.y*(100-o.clr.L))
						});
					var lim = (o.clr.H>45&&o.clr.H<75)?(33):(o.clr.H>210&&o.clr.H<280)?(66):(50);
					o.$xy[( o.clr.L<lim ? 'addClass' : 'removeClass' )](o.opts.wMarkerClass);
					}
				}
			}
		else o.$input.val( o.clr[fmt] ); // disabled, restore last color value
		},	
	"show": function(){
		Hide(); var o = this;
		if (!o.disabled){
			if (!o.ready) o.init();
			var chk = is.Function(o.opts.onOpen) ? o.opts.onOpen.call( o.$picker[0] ) : true;
			if (chk!==false){
				Hide = o.hide;
				o.$picker.appendTo(document.body)
					.alignTo(o.$swatch,{auto:"point"}).show(); // opts.speed
				o.isOpen = true;
				//$(document).bind("mousedown"+o.NS,function(e){ o.start(e); });
				$(document).bond('mousedown',o,'start');
				//$(window).bind("keypress"+o.NS,function(e){ o.key(e); });
				$(window).bond('keypress',o,'key');
				o.original( o.clr );
				o.value();
				}
			else o.hide();
			}
		},
	"hide": function(){
		var o = this;
		if (o.isOpen){
			o.$picker.hide();
			//$(document).unbind("mousedown"+o.NS);
			$(document).unbond('mousedown',o,'start');
			//$(window).unbind("keypress"+o.NS);
			$(window).unbond('keypress',o,'key');
			o.isOpen = false;
			}
		},
	original: function(c){
		if (is.empty(c)){ // use orig color
			this.value(this.orig.hex);
			if (c===null) this.hide(); 
			}
		else { // set orig color
			this.orig = is.String(c) ? Color(c) : Color(this.clr);
			this.$reset.css('background-color', this.orig.html() );
			}
		},
	start: function(event){
		var o = this;
		if (o.isOpen && !o.inDrag){
			var xy = relPos(event,o.$wheel), el = event.target,
			ctr = Math.sqrt(Math.pow(xy.x-o.outerRadius,2)+Math.pow(xy.y-o.outerRadius,2));
			if (ctr>o.innerRadius && ctr<o.outerRadius) o.act = 'dragHue';
			else xy = relPos(event,o.$xy);
			while ( el ){
				if (el==o.$area[0]) o.act = 'dragArea';
				if (el==o.$hue[0]) o.act = 'dragHue';
				if (el==o.$sat[0]) o.act = 'dragSat';
				if (el==o.$lum[0]) o.act = 'dragLum';
				if (el==o.$reject[0]) return o.original(null);
				if (el==o.$reset[0]) return o.original();
				if (el==o.$accept[0]||el==document.body) return o.hide();
				if (el==o.$picker[0]) return;
				if (o.act!=null) {
					o.inDrag = true;
					o.off = xy;
					o.tmr = event.timeStamp;
					o.move(event);
					$(document).bind('mousemove'+o.NS,function(e){ o.move(e); })
						.bind("mouseup"+o.NS,function(e){ o.stop(e); });
					break;
					}
				else el = el.parentNode;
				}
			}
		},
	move: function(event){
		var o = this, xy, time = event.timeStamp - o.tmr;
		switch (o.act){
			case 'dragArea':
				xy = relPos(event,o.$area);
				o.value(o.clr.sat(100-(xy.x/o.areaScale.x)).lum(100-(xy.y/o.areaScale.y))); 
				break;
			case 'dragHue':
				xy = relPos(event,o.$wheel);
				o.value(o.clr.hue(360*((Math.PI+Math.atan2(-(xy.x-o.outerRadius),xy.y-o.outerRadius))/(2*Math.PI)))); // 0 <-> 360
				break;
			case 'dragSat':
				xy = relPos(event,o.$area).x + o.$xy.width()/2;
				o.value(o.clr.sat(100-((xy - o.off.x)/o.areaScale.x)));
				break;	
			case 'dragLum':
				xy = relPos(event,o.$area).y + o.$xy.height()/2;
				o.value(o.clr.lum(100-((xy - o.off.y)/o.areaScale.y)));
				break;
			default: return;
			}
		},
	stop: function(event){
		var o = this;
		if (o.isOpen && o.inDrag){
			var xy, time = event.timeStamp - o.tmr;
			switch (o.act){ // just a click?
				case time<200 && 'dragSat': 
					xy = relPos(event,o.$sat);
					o.value(o.clr.sat( o.clr.S+( xy.x < o.$sat.width()/2 ? 1 : -1 ) ));
					break;
				case time<200 && 'dragLum':
					xy = relPos(event,o.$lum);
					o.value(o.clr.lum( o.clr.L+( xy.y < o.$lum.height()/2 ? 1 : -1 ) ));
					break;
				default: break;
				}		
			$(document).unbind('mousemove'+o.NS+' mouseup'+o.NS);
			o.act = null;
			o.inDrag = false;
			o.tmr = 0;
			o.off = null;
			}
		},
	key: function(ev){
		var o = this;
		if (o.isOpen){
			switch (ev.keyCode){
				case 38: o.value( o.clr.lum('+1') ); break; // UP: lum++
				case 40: o.value( o.clr.lum('-1') ); break; // DOWN: lum--
				case 37: o.value( o.clr.sat('+1') ); break; // LEFT: sat++
				case 39: o.value( o.clr.sat('-1') ); break; // RIGHT: sat--
				case 33: o.value( o.clr.hue('+1') ); break; // PAGEUP: hue++
				case 34: o.value( o.clr.hue('-1') ); break; // PAGEDOWN: hue--
				case 36: o.value( o.clr.sat(100).lum(50) ); break; // HOME: pure hue
				case 35: o.value( o.clr.gray() ); break; // END: grayscale
				case 46: o.original(); break; // DELETE: use original color
				case 45: o.original( o.clr ); break; // INSERT: update orig color
				case 27: o.original( null ); break; // ESC: reject/close
				case 13: o.hide(); break; // ENTER: accept/close
				case 9:	o.hide(); // TAB: accept/close
				default: return true;
				}
			ev.preventDefault();
			return false; 
			}
		},
	"enable": function(){
		this.disabled = false;
		this.$input.attr('disabled',false);
		this.Publish( "enable" ); // "enable.PLUGIN"
		},
	"disable": function(){
		this.hide();
		this.disabled = true;
		this.$input.attr('disabled',true);
		this.Publish( "disable" ); // "disable.PLUGIN"
		},
	"destroy": function(){
		var self = this;
		self.$picker.remove().empty();
		self.$input.unbind( "blur"+self.NS );
		$.each("input $swatch $picker".split(' '), 
			function(i,attr){ delete self[ attr ]; });
		this.Publish( "destroy" ); // "destroy.PLUGIN"
		$reg.drop( this ); // unregister
		}
	};
/*******************************************************************************************/
var // private helpers
Hide = function(){}, 
div = "<div></div>",
relPos = function( event, elem ){
	var offset = $(elem).offset();
	return { x: event.pageX-offset.left, y: event.pageY-offset.top };
	};
/*******************************************************************************************/
})(jQuery) // secure the $ jQuery alias