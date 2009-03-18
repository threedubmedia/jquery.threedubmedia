/*! Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)  */
;(function($){ // secure $ jQuery alias
/*******************************************************************************************/
// jquery.delgate.js - version 1.2
// Liscensed under the MIT License 
// http://www.opensource.org/licenses/mit-license.php
// Created: 2008-08-14 | Updated: 2008-12-18
/*******************************************************************************************/

// extend jquery prototype, twice
$.fn.delegate = function( types, selector, handler, data ){
	return this.each(function(){	
		$.event.delegate.add( this, types, selector, handler, data );
		});
	}; 
$.fn.undelegate = function( types, selector, handler ){
	return this.each(function(){
		$.event.delegate.remove( this, types, selector, handler ); 
		});
	};

// extend the jquery.event object
$.event.delegate = {
	// ADD DELEGATES
	add: function( elem, types, selector, handler, data ){
		// first four arguments are required
		if ( arguments.length < 4 ) return;
		// handle single/multiple comma-seperated selectors...
		var selectors = split( selector, comma ),  
		// reference or create an event delegation repository 
		repos = $.data( elem, 'delegates' ) || $.data( elem, 'delegates', {} );
		// handle single/multiple space seperated event types...
		$.each( split( types, space ), function( i, type ){
			// reference or create event.type delegate cache
			var cache = repos[ type ] || ( repos[ type ] = [] );
			// bind the master delegate handler for this event.type
			if ( !cache.length ) $.event.add( elem, type, $.event.delegate.handle, repos );
			// store the handler with each selector
			$.each( selectors, function( i, selector ){
				// no empty strings
				if ( !selector.length ) return;
				// add the delegate selector and handler (and data) into the cache (push)
				cache[ cache.length ] = { 
					selector: selector, 
					handler: handler, 
					data: data 
					};
				});
			});
		},
	// REMOVE DELEGATES	
	remove: function( elem, types, selector, handler ){
		// handle single/multiple comma-seperated selectors...
		var selectors = split( selector, comma ),
		// reference event delegation repository 
		repos = $.data( elem, 'delegates' ) || {};
		// remove ALL types and selectors
		if ( elem && !types ){
			// iterate all delegate types stored on this element
			$.each( repos, function( type ){
				// unbind the master delegate handler for each type 					
				$.event.remove( elem, type, $.event.delegate.handle );
				});
			// clean-up stored data on this element
			$.removeData( elem, 'delegates' );
			// stop
			return;
			}
		// handle single/multiple space seperated event types...
		$.each( split( types, space ), function( i, type ){	
			// are there any selectors to check?
			if ( selector && selector.length ){
				// iterate all the stored selectors and handlers...
				repos[ type ] = $.grep( repos[ type ] || [], function( stored, keep ){
					// check against each passed selector
					if ( stored ) $.each( selectors, function( x, selector ){
						// match selector, and handler if provided
						if ( stored.selector === selector && 
							( !handler || stored.handler === handler ) )
							// break and set flag to remove data
							return ( keep = false );
						});	
					// remove or keep stored data
					return ( keep !== false );
					});
				// if cache is NOT empty, stop
				if ( repos[ type ].length ) return; 
				}
			// unbind the master delegate handler for this event.type 
			$.event.remove( elem, type, $.event.delegate.handle );
			// clean-out cached data for this event.type
			delete repos[ type ]; 	
			});
		},
	// HANDLE EVENT DELEGATION
	handle: function( event ){
		// store the master delegate element
		event.delegateParent = this;
		// give delegate method for cancelling
		event.stopDelegation = function(){ canceled = true; };
		// local element, local variables
		var target = event.target, args = arguments, ret, canceled,
		// get delegates for this element and event.type
		cache = ( event.data || {} )[ event.type ] || [];
		// iterate stored delegate selectors		
		if ( cache.length ) do $.each( cache, function( i, stored ){
			// match the target element to the delegate selector
			if ( stored && $( target ).matches( stored.selector ) ) {
				// pass along the data and selector
				event.data = stored.data;
				event.filter = stored.selector;
				// call the stored handler function
				ret = stored.handler.apply( target, args );
				// break $.each if "return false" or "stopDelegation"
				if ( ret===false || canceled===true ) return false;
				}
			});
		// walk up the parent tree to the delegate source/parent
		while ( ret !== false && canceled !== true && target != this && ( target = target.parentNode ) )
		// pass along the latest handler return value
		return ret;
		}
	};
	
// like "is" method... but handles descendant selector
$.fn.matches = function( expr ) {
	// reject bad arguments immediately
	if ( typeof expr != "string" ) return false;
	// local refs
	var $this = this, tokens;
	// loop through selector query in family pieces...
	while ( expr.length && $this.length && ( tokens = pattern.exec( expr ) ) ) {
		// filter collection for the terminal child(3) selector
		$this = $this.setArray( $.filter( tokens[3], $this ).r );
		// traverse "up" as needed using the descendant(2) and ancestor(1)
		if ( tokens[2] ) $this = $this[ lookup[ tokens[2] ] ]( tokens[1] );
		// remove descendant(2) and child(3) section of the query
		expr = expr.replace( tokens[0].substr( tokens[1] ? tokens[1].length : 0 ), "" );
		}
	// query remains and no regexp match == bad selector
	if ( !empty.test( expr ) && !tokens ) $this = [];
	// if any elements matched, return true
	return !!( $this.length > 0 );
	};
		
// "is" regular expression matches from the end of the selector
var pattern = (/(?:([^>+~\s]+)\s*([>+~\s])\s*)?([^>+~\s]+)\s*$/),
// white-space regexp and comma-sep regexp for splitting strings
space = (/\s+/), comma = (/\s*,\s*/), empty = (/^\s*$/),
// "is" lookup pairs the descender with the correct method to ascend...
lookup = { ' ':'parents', '>':'parent', '+':'prev', '~':'prevAll' };
// split and trim space seperated event types or comma-seperated selectors
function split( str, regexp ){ return $.trim( str ).split( regexp ); }; 

/*******************************************************************************************/
})(jQuery);