/*! Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)  */
;(function($){ // secure $ jQuery alias
/*******************************************************************************************/	
// jquery.event.wheel.js - rev 2 
// Liscensed under the MIT License 
// http://www.opensource.org/licenses/mit-license.php
// Created: 2008-07-01 | Updated: 2008-10-08
/*******************************************************************************************/

// jquery method
$.fn.wheel = function( fn ){
	return this[ fn ? "bind" : "trigger" ]( "wheel", fn );
	};

// special event config
$.event.special.wheel = {
	setup: function(){
		$.event.add( this, wheelEvents, wheelHandler, {} );
		},
	teardown: function(){
		$.event.remove( this, wheelEvents, wheelHandler );
		}
	};

// events to bind ( browser sniffed... )
var wheelEvents = "DOMMouseScroll mousewheel" // IE, opera, safari, firefox
	+( $.browser.mozilla && $.browser.version < "1.9" ? " mousemove" : "" ); // firefox 2

// shared event handler
function wheelHandler( event ){ 
	switch ( event.type ){
		case "mousewheel": // IE, opera, safari
			event.delta = event.wheelDelta/120; // normalize delta
			if ( window.opera ) event.delta *= -1; // normalize delta
			break;
		case "DOMMouseScroll": // firefox
			$.extend( event, event.data ); // fix event properties in FF2
			event.delta = -event.detail/3; // normalize delta
			break;
		case "mousemove": // FF2 has incorrect event positions
			return $.extend( event.data, { // store the correct properties
				clientX: event.clientX, pageX: event.pageX, 
				clientY: event.clientY, pageY: event.pageY
				});			
		}
	event.type = "wheel"; // hijack the event	
	return $.event.handle.call( this, event, event.delta );
	};
	
/*******************************************************************************************/
})(jQuery); // confine scope