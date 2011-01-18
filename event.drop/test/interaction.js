test("Interaction Options",function(){
					
	expect( 36 );				
		
	// create the markup for the test
	var $drag = $('<div />')
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			height: 100,
			width: 100
		})
		.appendTo( document.body )
		.bind("draginit dragstart drag dragend click", function( event ){
			counts[ event.type ] += 1;
		}),
	$drop = $('<div />')
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			height: 100,
			width: 100
		})
		.appendTo( document.body )
		.bind("dropinit dropstart drop dropend",function( event ){
			counts[ event.type ] += 1;																 
		}),
	counts,
	reset = function( opts ){
		counts = { 
			draginit:0, dragstart:0, drag:0, dragend:0, 
			dropinit:0, dropstart:0, drop:0, dropend:0,
			click:0 
		};
		$.extend( $drag.data( $.event.special.drag.datakey ), $.event.special.drag.defaults, opts ); 
	};
	

	setTimeout(function(){
		ok( true, "Drag and Drop defaults...");
		// prep DEFAULT interaction
		reset();
		// simulate DEFAULT interaction
		$drag
			.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.fire("mouseup",{ clientX:51, clientY:51 })
			.trigger("click");
		// inspect results	
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 1, "drag");
		equals( counts.dragend, 1, "dragend");
		equals( counts.dropinit, 1, "dropinit");
		equals( counts.dropstart, 1, "dropstart");
		equals( counts.drop, 1, "drop");
		equals( counts.dropend, 1, "dropend");
		// continue
		start();
	}, 20 );
	stop();
	
	setTimeout(function(){
		ok( true, 'Drag "drop" option (false)...');
		// prep interaction
		reset({ drop:false });
		// simulate drag
		$drag
			.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.fire("mouseup",{ clientX:51, clientY:51 })
			.trigger("click");
		// inspect results		
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 1, "drag");
		equals( counts.dragend, 1, "dragend");
		equals( counts.dropinit, 0, "dropinit");
		equals( counts.dropstart, 0, "dropstart");
		equals( counts.drop, 0, "drop");
		equals( counts.dropend, 0, "dropend");
		// continue
		start();
	}, 20 );
	stop();
	
	setTimeout(function(){
		ok( true, 'Drag "drop" option (unmatched)...');
		// prep interaction
		reset({ drop:'body' });
		// simulate drag
		$drag
			.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.fire("mouseup",{ clientX:51, clientY:51 })
			.trigger("click");
		// inspect results		
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 1, "drag");
		equals( counts.dragend, 1, "dragend");
		equals( counts.dropinit, 0, "dropinit");
		equals( counts.dropstart, 0, "dropstart");
		equals( counts.drop, 0, "drop");
		equals( counts.dropend, 0, "dropend");
		// continue
		start();
	}, 20 );
	stop();
	
	setTimeout(function(){
		ok( true, 'Drag "drop" option (matched)...');
		// prep interaction
		reset({ drop:'div' });
		// simulate drag
		$drag
			.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.fire("mouseup",{ clientX:51, clientY:51 })
			.trigger("click");
		// inspect results		
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 1, "drag");
		equals( counts.dragend, 1, "dragend");
		equals( counts.dropinit, 1, "dropinit");
		equals( counts.dropstart, 1, "dropstart");
		equals( counts.drop, 1, "drop");
		equals( counts.dropend, 1, "dropend");
		// continue
		start();
	}, 20 );
	stop();
	
	// test clean-up
	setTimeout(function(){
		$drag.remove();
		$drop.remove();
	}, 20 );
	
});

