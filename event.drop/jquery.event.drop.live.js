/*! 
 * jquery.event.drop.live - v 2.1.0 
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2010-06-07
// Updated: 2010-09-13
// REQUIRES: jquery 1.4.2+, event.drag 2.1+, event.drop 2.1+

;(function($){ // secure $ jQuery alias

// local refs (increase compression)
var $event = $.event,
// ref the drop special event config
drop = $event.special.drop,
// old drop event add method
origadd = drop.add,
// old drop event teradown method
origteardown = drop.teardown;

// the namespace for internal live events
drop.livekey = "livedrop";

// new drop event add method
drop.add = function( obj ){ 
	// call the old method
	origadd.apply( this, arguments );
	// read the data
	var data = $.data( this, drop.datakey );
	// bind the live "dropinit" delegator
	if ( !data.live && obj.selector ){
		data.live = true;
		$event.add( this, "dropinit."+ drop.livekey, drop.delegate );
	}
};

// new drop event teardown method
drop.teardown = function(){ 
	// call the old method
	origteardown.apply( this, arguments );
	// remove the "live" delegation
	$event.remove( this, "dropinit", drop.delegate );
};

// identify potential delegate elements
drop.delegate = function( event, dd ){
	// local refs
	var elems = [], $targets, 
	// element event structure
	events = $.data( this, "events" ) || {};
	// query live events
	$.each( events.live || [], function( i, obj ){
		// no event type matches
		if ( obj.preType.indexOf("drop") !== 0 )
			return;
		// locate the elements to delegate
		$targets = $( event.currentTarget ).find( obj.selector );
		// no element found
		if ( !$targets.length ) 
			return;
		// take each target...
		$targets.each(function(){
			// add an event handler
			$event.add( this, obj.origType +'.'+ drop.livekey, obj.origHandler, obj.data );
			// remember new elements
			if ( $.inArray( this, elems ) < 0 )
				elems.push( this );	
		});	
	});
	// may not exist when artifically triggering dropinit event
	if ( dd )
		// clean-up after the interaction ends
		$event.add( dd.drag, "dragend."+drop.livekey, function(){
			$.each( elems.concat( this ), function(){
				$event.remove( this, '.'+ drop.livekey );							
			});
		});
	//drop.delegates.push( elems );
	return elems.length ? $( elems ) : false;
};

})( jQuery ); // confine scope	