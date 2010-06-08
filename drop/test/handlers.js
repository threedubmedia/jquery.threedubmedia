test("Event Handlers",function(){
					
	expect( 24 );
	
	// create the markup for the test
	var $drag = $('<div class="drag"/>')
		.appendTo( document.body )
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			height: 100,
			width: 100
		})
		.bind("dragend",{ drop:'.drop' },function( event, dd ){
			same( dd.drop, dragend, "drop (dragend)" );
		}),
	$drop = $('<div class="drop"/><div class="extra"/>')
		.appendTo( document.body )
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			height: 100,
			width: 100
		})
		.bind("dropinit dropstart drop dropend",function( event, dd ){
			counts[ event.type ] += 1;
			return returned[ event.type ];
		}),
	counts, returned, dragend,
	reset = function(){
		$.drop({ mode:'overlap', multi:false });
		counts = { dropinit:0, dropstart:0, drop:0, dropend:0 };
		returned = {};
	};	

	// test DROPINIT FALSE
	ok( true, 'DROPINIT returns false...' );
	// test prep
	reset();
	returned.dropinit = false;
	dragend = [];
	// simulate a partial drag
	$drag
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// check counts
	equals( counts.dropinit, 1, "dropinit");
	equals( counts.dropstart, 0, "dropstart");
	equals( counts.drop, 0, "drop");
	equals( counts.dropend, 0, "dropend");
	
	// test DROPSTART FALSE
	ok( true, 'DROPSTART returns false...' );
	// test prep
	reset();
	returned.dropstart = false;
	dragend = [];
	// simulate a partial drag
	$drag
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// check counts
	equals( counts.dropinit, 1, "dropinit");
	equals( counts.dropstart, 1, "dropstart");
	equals( counts.drop, 0, "drop");
	equals( counts.dropend, 0, "dropend");
	
	// test DROP FALSE
	ok( true, 'DROP returns false...' );
	// test prep
	reset();
	returned.drop = false;
	dragend = [];
	// simulate a partial drag
	$drag
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// check counts
	equals( counts.dropinit, 1, "dropinit");
	equals( counts.dropstart, 1, "dropstart");
	equals( counts.drop, 1, "drop");
	equals( counts.dropend, 0, "dropend");

	// test DROPINIT returns elements
	ok( true, 'DROPINIT returns elements...' );
	// test prep
	reset();
	returned.dropinit = $drop.eq(1);
	dragend = [ $drop[1] ];
	// simulate a partial drag
	$drag
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	// check counts
	equals( counts.dropinit, 1, "dropinit");
	equals( counts.dropstart, 1, "dropstart");
	equals( counts.drop, 1, "drop");
	equals( counts.dropend, 1, "dropend");

	// test clean-up
	setTimeout(function(){
		$drag.remove();
		$drop.remove();
	}, 20 );
	
});