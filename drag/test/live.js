test("Live Delegation",function(){
	
	expect( 16 );
	
	// set up the delegation
	$('.drag').live("draginit dragstart drag dragend",function( event ){
		counts[ event.type ] += 1;
		equals( this, $drag[0], event.type+" target" );
	});
	// local refs
	var counts = { draginit:0, dragstart:0, drag:0, dragend:0 },
	// add a div to test the delegation
	$drag = $('<div class="drag" />').appendTo( document.body );
	
	// check triggering of the event handlers
	$.each(["dragend","drag","dragstart","draginit"],function( i, type ){
		$drag.trigger( type );
		equals( counts[ type ], 1, "triggered "+ type );
		counts[ type ] = 0;
	});
	
	// simulate a complete drag
	$drag
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	
	// check the event handler counts
	$.each(["dragend","drag","dragstart","draginit"],function( i, type ){
		equals( counts[ type ], 1, "delegated "+ type );
	});
});