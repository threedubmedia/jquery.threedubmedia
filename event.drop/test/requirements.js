module("EVENT.DROP");

test("Requirements",function(){
	
	expect( 9 );
	
	// make sure the right jquery is included
	ok( window.jQuery, "jQuery exists" );
	ok( parseFloat( jQuery([]).jquery ) >= 1.4, "jQuery version is 1.4 or greater" );
	ok( jQuery.event.special.drag, "DRAG special event is defined" );
	
	// make sure the event interface is complete
	ok( jQuery.event.special.dropinit, "DROPINIT special event is defined" );
	ok( jQuery.event.special.dropstart, "DROPSTART special event is defined" );
	ok( jQuery.event.special.drop, "DROP special event is defined" );
	ok( jQuery.event.special.dropend, "DROPEND special event is defined" );
	ok( jQuery([]).drop, "$('...').drop() method is defined" );
	ok( jQuery.drop, "$.drop() method is defined" );
	
});