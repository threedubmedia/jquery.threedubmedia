test("Interaction Options",function(){
					
	expect( 60 );				
		
	// create the markup for the test
	var $div = $('<div />')
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			height: 100,
			width: 100
		})
		.append('<div class="child" />')
		.appendTo( document.body )
		.bind("draginit dragstart drag dragend click", function( event ){
			counts[ event.type ] += 1;
		}),
	counts,
	reset = function( opts ){
		counts = { draginit:0, dragstart:0, drag:0, dragend:0, click:0 };
		$.extend( $div.data( $.event.special.drag.datakey ), $.event.special.drag.defaults, opts ); 
	};
	
	// prep DEFAULT interaction
	reset();
	// simulate DEFAULT interaction
	$div
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results	
	ok( true, "Drag defaults...");
	equals( counts.draginit, 1, "draginit");
	equals( counts.dragstart, 1, "dragstart");
	equals( counts.drag, 1, "drag");
	equals( counts.dragend, 1, "dragend");
	equals( counts.click, 0, "click");
	
	// prep NOT interaction
	reset({ not:'.child' });
	// simulate NOT interaction
	$div.children()
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "not" option (matched)...');
	equals( counts.draginit, 0, "draginit");
	equals( counts.dragstart, 0, "dragstart");
	equals( counts.drag, 0, "drag");
	equals( counts.dragend, 0, "dragend");
	equals( counts.click, 1, "click");
	// simulate NON NOT interaction
	reset({ not:'.child' });
	$div
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "not" option (unmatched)...');
	equals( counts.draginit, 1, "draginit");
	equals( counts.dragstart, 1, "dragstart");
	equals( counts.drag, 1, "drag");
	equals( counts.dragend, 1, "dragend");
	equals( counts.click, 0, "click");
	
	// prep HANDLE interaction
	reset({ handle:'.child' });
	// simulate HANDLE interaction
	$div.children()
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "handle" option (matched)...');
	equals( counts.draginit, 1, "draginit");
	equals( counts.dragstart, 1, "dragstart");
	equals( counts.drag, 1, "drag");
	equals( counts.dragend, 1, "dragend");
	equals( counts.click, 0, "click");	
	// simulate NON HANDLE interaction
	reset({ handle:'.child' });
	$div
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "handle" option (unmatched)...');
	equals( counts.draginit, 0, "draginit");
	equals( counts.dragstart, 0, "dragstart");
	equals( counts.drag, 0, "drag");
	equals( counts.dragend, 0, "dragend");
	equals( counts.click, 1, "click");
	
	// prep WHICH interaction
	reset({ which:3 });
	// simulate WHICH interaction
	$div
		.fire("mousedown",{ clientX:50, clientY:50, button:2 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "which" option (matched)...');
	equals( counts.draginit, 1, "draginit");
	equals( counts.dragstart, 1, "dragstart");
	equals( counts.drag, 1, "drag");
	equals( counts.dragend, 1, "dragend");
	equals( counts.click, 0, "click");	
	// simulate NON WHICH interaction
	reset({ which:3 });
	$div
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "which" option (unmatched)...');
	equals( counts.draginit, 0, "draginit");
	equals( counts.dragstart, 0, "dragstart");
	equals( counts.drag, 0, "drag");
	equals( counts.dragend, 0, "dragend");
	equals( counts.click, 1, "click");
	
	// prep DISTANCE interaction
	reset({ distance:5 });
	// simulate NON DISTANCE interaction
	$div
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "distance" option (unmatched)...');
	equals( counts.draginit, 1, "draginit");
	equals( counts.dragstart, 0, "dragstart");
	equals( counts.drag, 0, "drag");
	equals( counts.dragend, 0, "dragend");
	equals( counts.click, 1, "click");	
	// simulate DISTANCE interaction
	reset({ distance:5 });
	$div
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:53, clientY:54 })
		.fire("mouseup",{ clientX:53, clientY:54 })
		.trigger("click");
	// inspect results		
	ok( true, 'Drag "distance" option (matched)...');
	equals( counts.draginit, 1, "draginit");
	equals( counts.dragstart, 1, "dragstart");
	equals( counts.drag, 1, "drag");
	equals( counts.dragend, 1, "dragend");
	equals( counts.click, 0, "click");		
	
	// prep CLICK interaction
	reset({ click:true });
	// simulate CLICK interaction
	$div
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// inspect results	
	ok( true, 'Drag "click" option (true)...');
	equals( counts.draginit, 1, "draginit");
	equals( counts.dragstart, 1, "dragstart");
	equals( counts.drag, 1, "drag");
	equals( counts.dragend, 1, "dragend");
	equals( counts.click, 1, "click");	
	
	$div.remove();
});

