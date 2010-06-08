module("EVENT.DRAG");

test("Requirements",function(){
	
	expect( 7 );
	
	// make sure the right jquery is included
	ok( window.jQuery, "jQuery exists" );
	ok( parseFloat( jQuery([]).jquery ) >= 1.4, "jQuery version is 1.4 or greater" );
				
	// make sure the event interface is complete
	ok( jQuery.event.special.draginit, "DRAGINIT special event is defined" );
	ok( jQuery.event.special.dragstart, "DRAGSTART special event is defined" );
	ok( jQuery.event.special.drag, "DRAG special event is defined" );
	ok( jQuery.event.special.dragend, "DRAGEND special event is defined" );
	ok( jQuery([]).drag, "$('...').drag() method is defined" );
	
});