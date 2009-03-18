(function($){ // secure the $ jQuery alias
/*******************************************************************************************/	
// jQuery.Blackbox.js - rev 42 
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2007-03-22 | Updated: 2008-05-19
/*******************************************************************************************/
// REQUIRES: jquery 1.2.3+, utils.js, jquery.Register.js (rev 16+)
/*******************************************************************************************/
var PLUGIN = "Blackbox", // Register the PLUGIN... and public methods...
$reg = new $.Register( PLUGIN, "enable,disable,destroy,show,hide,size,align".split(',') );
/*******************************************************************************************/
// the jquery extension
$.fn[ PLUGIN ] = function( arg ){
	if ( is.String( arg ) ){ // call a single public method
		var args = Slice( arguments, 1 );
		return this.each(function(){ $reg.call( this, arg, args ); });
		}
	// inherit default options
	var opts = $.extend( {}, $[ PLUGIN ].defaults, arg||{} );
	// convert some option values from a percentage to a decimal
	$.each(['width','height','opacity'],function(x,v){ 
		if (x=(/^(\d+)%$/i).exec(opts[v])) opts[v] = parseInt(x[1])/100; 
		});
	// initialize the feature
	return this.each(function(){ new $[ PLUGIN ].create( this, opts ); });
	};
/*******************************************************************************************/
// default settings
$[ PLUGIN ].defaults = {
	html: '<h1>Please wait...</h1>', // (string|function|element|jquery) box content to be appended
	onOpen: null, // (null|function) optional fn, return false to prevent, scope: source element, arg: box element
	onClose: null, // (null|function) optional fn, return false to prevent, scope: source element, arg: box element
	opacity: null, // (string|number) overrides the opacity in bgCss
	background: null, // (string|number) overrides the background in bgCss
	wrapClass: '', // (string) optional "wrapper" classname
	wrapCss: {}, // (object) optional "wrapper" css
	bgClass: '', // (string) optional "background" classname
	bgCss: {}, // (object) optional "background" css
	boxClass: '', // (string) optional "display box" classname
	boxCss: {}, // (object) optional "display box" css
	height: 'auto', // (string|number) overrides the height in boxCss
	width: 'auto', // (string|number) overrides the width in boxCss
	top: 'center', // (string|number) overrides the top in boxCss
	left: 'center', // (string|number) overrides the left in boxCss
	isolate: false, // (boolean) true: only this one overlay visible at a time
	keepHtml: true, // (boolean) false: re-create the box content on every "show"
	emptyBox: true, // (boolean) remove all box content before (re)filling
	autoZindex: true, // (boolean) true: automatically manage the z-index
	showEvent: "click", // (string|false) which event on the element triggers "show", false to prevent
	bgClose: "click" // (string|false) which event on the bg div triggers "hide", false to prevent
	};
var base_z_index = 999; // @private var // but customize as needed
/*******************************************************************************************/
// constructor
$[ PLUGIN ].create = function( el, opts ){
	var self = $reg.add( el, this, { el:el, opts:opts }); // register the instance, store args
	self.size( opts.width, opts.height ); // store size
	self.align( opts.left, opts.top ); // store alignment
	if ( opts.showEvent ) // bind the element show event
		$( el ).bind( opts.showEvent+self.NS, function(){
			var html = self.ready && self.opts.keepHtml ? null : self.opts.html;
			if (!self.disabled) return self.show( html );
			});
	this.Publish( "create" ); // "create.PLUGIN"
	}; 
/*******************************************************************************************/
// methods
$[ PLUGIN ].create.prototype = {
	init: function(){ var self = this;
		// create the overlay markup 
		self.$bg = $(dv).addClass(self.opts.bgClass)
			.css( $.extend({position:'absolute',width:'100%',height:'100%',top:0,left:0}, self.opts.bgCss||{}) );
		self.$bx = $(dv).addClass(self.opts.boxClass)
			.css( $.extend({position:'absolute'},self.opts.boxCss||{}) );
		self.$wrap = $(dv).addClass(self.opts.wrapClass)
			.css( $.extend({position:'absolute',top:0,left:0},self.opts.wrapCss||{}) )
			.append( self.$bg ).append( self.$bx ).hide();
		try { self.$wrap.bgiframe() } catch(err){ } // try "bgiframe" 
		// optional opacity and background overrides
		if (!is.empty(self.opts.opacity)) self.$bg.css('opacity',self.opts.opacity);
		if (!is.empty(self.opts.background)) self.$bg.css('background',self.opts.background);
		// bind the bg close event
		if ( self.opts.bgClose ) self.$bg.bind( self.opts.bgClose+self.NS , function(){ self.hide(); });
		self.html = self.opts.html; // set the default html
		self.ready = true;
		},
	allow: function(fn){
		if (this.disabled) return false;
		if (is.Function(fn)) return (fn.call( this.el, this.$bx[0] )!==false); 
		return true;
		},
	"show": function( html ){ 
		var self = this;
		if (!self.ready) self.init();
		html = html || self.html;
		if ( !bbx.isolate && self.allow(self.opts.onOpen) ){	
			if ( html ){ // fill box content
				if ( self.opts.emptyBox ) self.$bx.empty();
				if ( is.Function(html) ) html = html.call( self.el, self.$bx[0] );
				if ( html===false ) return false; 
				self.$bx.append( html ); // insert any html
				if (self.opts.keepHtml) self.html = false; // clear the html
				}
			if (self.opts.isolate) { // isolate this overlay
				$[ PLUGIN ]('hide'); // close everything
				if (bbx.opened.length==0) bbx.isolate = true; // everything is closed 
				else return false; // something else is still open
				}
			var z = bbx.open( self ); 
			if (self.opts.autoZindex){ // manage z-index
				self.$wrap.css('z-index',z);
				self.$bg.css('z-index',z+1);
				self.$bx.css('z-index',z+2);
				}
			else bbx.z = parseInt($wrap.css('zIndex'))||base_z_index; // store this Z
			this.Publish( "show" ); // "show.PLUGIN"
			$(document.body).append( self.$wrap );
			self.$wrap.show();
			$(window).trigger( "resize." + PLUGIN );
			self.isOpen = true;
			self.size();
			}
		return false;
		},
	"hide": function(){ var self = this;
		if ( self.isOpen && self.allow(self.opts.onClose) ){
			bbx.close( self );
			if ( self.opts.isolate ) bbx.isolate = false;
			self.$wrap.hide();
			bbx.page();
			self.isOpen = false;
			this.Publish( "hide" ); // "hide.PLUGIN"
			}
		},
	"align": function( x, y ){ //console.log('align',x,y)
		this.x = is.defined(x) ? x : this.x;
		this.y = is.defined(y) ? y : this.y;
		if ( this.isOpen ){
			var self = this, xx = self.x, yy = self.y, tt, ll, scr,
			hh = self.$bx.outerHeight({margin:true}), 
			ww = self.$bx.outerWidth({margin:true});
			bbx.page( ww, hh ); // adjusts page size
			self.$wrap.css({ // cover the page
				height: Math.max( WIN.h, BOD.h ), width: Math.max( BOD.w, WIN.w )
				});
			if ( xx=='center' ){ // horizontal center	
				if ( ww > WIN.x ){ // box content overflow
					ll = self.$bx.offset()['left']; // current position	
					scr = SCR.x - lastSCR.x; // scroll difference: right[+] / left[-]
					ll = ( scr>0 && ll+ww<SCR.x+WIN.w ) ? SCR.x+WIN.w-ww : // right edge
						( scr<0 && ll>SCR.x ) ? SCR.x : Math.min( ll, SCR.x ); // left edge 
					}
				else ll = Math.round( (WIN.w-ww)/2 )+SCR.x; // viewport center
				xx = Math.min( Math.max( ll, 0 ), BOD.w-ww ); // page limited position
				}		
			if ( yy=='center' ){ // vertical center	
				if ( hh > WIN.h ){ // box content overflow
					tt = self.$bx.offset()['top']; // current position	
					scr = SCR.y-lastSCR.y; // scroll difference: down[+] / up[-]
					tt = ( scr>0 && tt+hh<SCR.y+WIN.h ) ? SCR.y+WIN.h-hh : // bottom edge
						( scr<0 && tt>SCR.y ) ? SCR.y : Math.min( tt, SCR.y ); // top edge
					}
				else tt = Math.round( (WIN.h-hh)/2 )+SCR.y; // viewport center
				yy = Math.min( Math.max( tt, 0 ), BOD.h-hh ); // page limited position
				}	
			self.$bx.css({ top: yy, left: xx }); // pos box
			}
		},
	"size": function( w, h ){ //console.log("size",w,h);
		this.w = is.defined(w) ? w : this.w;
		this.h = is.defined(h) ? h : this.h;
		if ( this.isOpen ){
			var self = this, ww, hh;
			self.$wrap.css({ // cover the page, gives content box layout
				height: Math.max( WIN.h, BOD.h ), width: Math.max( BOD.w, WIN.w )
				});
			// figure out box width
			ww = w || self.w || self.opts.boxCss.width;
			if (!ww || ww=='auto') ww = self.$bx.width('').width();
			self.$bx.width( ww<1 ? Math.round(WIN.w*ww) : ww );
			// figure out box height
			hh = h || self.h || self.opts.boxCss.height;
			if (!hh || hh=='auto') hh = self.$bx.height('').height();
			self.$bx.height( hh<1 ? Math.round(WIN.h*hh) : hh );
			self.align();
			}
		},
	"enable": function(){
		this.disabled = false;
		this.Publish( "enable" ); // "enable.PLUGIN"
		},
	"disable": function(){
		this.disabled = true;
		this.Publish( "disable" ); // "disable.PLUGIN"
		},
	"destroy": function(){
		$(window).unbind( this.NS ); // window events
		bbx.hide( this.el ); // unreg bbx
		$( this.el ).unbind( this.NS ); // remove "show" event
		this.$wrap.remove().empty(); // remove the markup
		this.Publish( "destroy" ); // "destroy.PLUGIN" 
		$reg.drop( this ); // unregister
		}
	};
/*******************************************************************************************/
// store and update window props seperately
var WIN = {}, SCR = {x:0,y:0}, lastSCR = {x:0,y:0}, BOD = {w:0,h:0}, trueBOD = {}, $bod;
$(function(){ // doc.ready	
	$bod = $(document.body);
	$(window)
		.bind( "resize."+PLUGIN, function(){ //console.log('WINDOW.SIZE',WIN) 
			WIN = { w: $(this).width(), h: $(this).height() }; 
			bbx.page(); // recalculate the total page size
			bbx.each('size'); // "size" all open instances
			})
		.bind( "scroll."+PLUGIN, function(event){ //console.log('SCROLL.SIZE',SCR)
			lastSCR = SCR; // to compare scroll direction
			SCR = { x: $(this).scrollLeft(), y: $(this).scrollTop() }; 
			bbx.each('align'); // "align" all open instances
			});
	}); // doc.ready	
/*******************************************************************************************/
// private helpers - manage open-ness and z-index and such
var bbx = {
	z: base_z_index, opened: [],
	open: function( obj ){
		bbx.close( obj );
		bbx.opened.push( obj );
		return ( bbx.z+=3 );
		},
	close: function( obj ){
		bbx.opened = $.grep( bbx.opened, function(val){ return val.el!==obj.el; });
		if (bbx.opened.length==0) bbx.z = base_z_index;
		}, 
	each: function( meth ){
		$.each( bbx.opened, function(){ this[ meth ](); });
		},
	page: function( ww, hh ){ 
		if ( is.Number( ww, hh ) ){
			BOD = { w: Math.max( trueBOD.w, ww ), h: Math.max( trueBOD.h, hh ) };
			if ( BOD.w!=trueBOD.w ) $bod.width( BOD.w );
			if ( BOD.h!=trueBOD.h ) $bod.height( BOD.h );
			}
		else trueBOD = { w: $bod.width("").width(), h: $bod.height("").height() }; // to compare page sizes
		},
	isolate: false
	}, 
dv = '<div></div>';
/*******************************************************************************************/
})(jQuery) // secure the $ jQuery alias