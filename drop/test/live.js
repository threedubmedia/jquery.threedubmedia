test("Live Delegation",function(){
	
	expect( 0 );
	
	// set up the delegation
	$('.drop-live').live("dropinit dropstart drop dropend",function( event ){
		counts[ event.type ] += 1;
		equals( this, $drop[0], event.type+" target" );
	});
	// local refs
	var counts = { dropinit:0, dropstart:0, drop:0, dropend:0 },
	// add a div to test the delegation
	$drop = $('<div class="drop-live" />')
		.css({
			position: 'absolute',
			top: 0, left: 0,
			height: 100, width: 100
			})
		.appendTo( document.body ),
	// add a dragger
	$drag = $('<div class="drag-live" />')
		.css({
			position: 'absolute',
			top: 0, left: 0,
			height: 100, width: 100
			})
		.appendTo( document.body )
		.drag(function(){ },{ drop:'.drop-live' });
	
	// check triggering of the event handlers
	$.each(["dropend","drop","dropstart","dropinit"],function( i, type ){
		$drop.trigger( type );
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
	$.each(["dropend","drop","dropstart","dropinit"],function( i, type ){
		equals( counts[ type ], 1, "delegated "+ type );
	});
});