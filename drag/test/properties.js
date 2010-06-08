test("Callback Properties",function(){
					
	expect( 13 );
	
	// create the markup for the test
	var $div = $('<div />')
		.appendTo( document.body ),
	// starting position
	sx = Math.round( Math.random() * 90 ) + 5,
	sy = Math.round( Math.random() * 90 ) + 5,
	// mouse offset position
	mx = Math.round( Math.random() * 90 ) + 5,
	my = Math.round( Math.random() * 90 ) + 5,
	// distance dragged
	dx = Math.round( Math.random() * 90 ) + 5,
	dy = Math.round( Math.random() * 90 ) + 5;

	$div
		.drag(function( event, dd ){
			
			ok( dd.target == $div[0], "target: [drag target]" );
			ok( dd.drag == $div[0], "drag: [drag target]" );
			ok( dd.proxy == $div[0], "proxy: [drag target]" );
			
			equals( dd.startX, sx + mx, "startX" );
			equals( dd.startY, sy + my, "startY" );
			
			equals( dd.deltaX, dx, "deltaX" );
			equals( dd.deltaY, dy, "deltaY" );
			
			equals( dd.originalX, sx, "originalX" );
			equals( dd.originalY, sy, "originalY" );
			
			equals( dd.offsetX, sx + dx, "offsetX" );
			equals( dd.offsetY, sy + dy, "offsetY" );
			
			ok( dd.drop.constructor == Array && !dd.drop.length, "drop: []" );
			ok( dd.available.constructor == Array && !dd.available.length, "available: []" );
			
		})
		.css({
			position: 'absolute',
			top: sy,
			left: sx,
			height: 100,
			width: 100
		})
		// simulate a drag
		.fire("mousedown",{ 
			clientX: sx + mx, 
			clientY: sy + my,
			pageX: sx + mx, 
			pageY: sy + my 
		})
		.fire("mousemove",{ 
			clientX: sx + mx + dx, 
			clientY: sy + my + dy,
			pageX: sx + mx + dx, 
			pageY: sy + my + dy 
		})
		.fire("mouseup",{ 
			clientX: sx + mx + dx, 
			clientY: sy + my + dy,
			pageX: sx + mx + dx, 
			pageY: sy + my + dy 
		});
	$div.remove();
});