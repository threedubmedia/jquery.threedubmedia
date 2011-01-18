test("Event Handlers",function(){
					
	expect( 35 );
	
	// create the markup for the tests
	var $div = $('<div />')
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
			if ( extratest[ event.type ] )
				extratest[ event.type ].apply( this, arguments );
			return returned[ event.type ];
		}),
	counts, extratest, returned, 
	reset = function(){
		counts = { draginit:0, dragstart:0, drag:0, dragend:0 };
		extratest = {};
		returned = {};
	};
	
	// test DRAGINIT FALSE
	setTimeout(function(){
		ok( true, 'DRAGINIT returns false...' );
		// test prep
		reset();
		returned.draginit = false;
		// simulate a partial drag
		$div.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.trigger("click");
		// check counts
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 0, "dragstart");
		equals( counts.drag, 0, "drag");
		equals( counts.dragend, 0, "dragend");
		// continue
		start();	
	}, 20 );
	stop();
	
	// test DRAGSTART FALSE
	setTimeout(function(){
		ok( true, 'DRAGSTART returns false...' );				
		// test prep
		reset();
		returned.dragstart = false;
		// simulate a partial drag
		$div.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.trigger("click");
		// check counts
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 0, "drag");
		equals( counts.dragend, 0, "dragend");
		// continue
		start();
	}, 20 );
	stop();
	
	// test DRAG FALSE
	setTimeout(function(){
		ok( true, 'DRAG returns false...' );				
		// test prep
		reset();
		returned.drag = false;
		// simulate a partial drag
		$div.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.trigger("click");
		// check ocunts
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 1, "drag");
		equals( counts.dragend, 1, "dragend");
		// continue
		start();
	}, 20 );
	stop();
	
	// test DRAGINIT ELEMENT
	setTimeout(function(){
		ok( true, 'DRAGINIT returns different element...' );
		// test prep
		reset();
		var $clone = returned.draginit = $div.clone( true );
		extratest.dragstart = extratest.drag = extratest.dragend = function( ev, dd ){
			ok( dd.drag === $clone[0], ev.type +' target element' );
		};
		// simulate a complete drag
		$div.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.fire("mouseup",{ clientX:51, clientY:51 })
			.trigger("click");
		// check counts
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 1, "drag");
		equals( counts.dragend, 1, "dragend");
		// continue
		start();
	}, 20 );
	stop();
	
	// test DRAGINIT ELEMENTS
	setTimeout(function(){
		ok( true, 'DRAGINIT returns two elements...' );
		// test prep
		reset();
		returned.draginit = $div.clone( true ).add( $div );
		// simulate a complete drag
		$div.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.fire("mouseup",{ clientX:51, clientY:51 })
			.trigger("click");
		// check counts
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 2, "dragstart");
		equals( counts.drag, 2, "drag");
		equals( counts.dragend, 2, "dragend");
		// continue
		start();
	}, 20 );
	stop();
	
	// test DRAGSTART PROXY
	setTimeout(function(){
		ok( true, 'DRAGSTART returns proxy element...' );
		// test prep
		reset();
		var $proxy = returned.dragstart = $div.clone().addClass('proxy');
		extratest.drag = extratest.dragend = function( ev, dd ){
			ok( dd.proxy === $proxy[0], ev.type +' proxy element' );
		};
		// simulate a complete drag
		$div.fire("mousedown",{ clientX:50, clientY:50 })
			.fire("mousemove",{ clientX:51, clientY:51 })
			.fire("mouseup",{ clientX:51, clientY:51 })
			.trigger("click");
		// check counts	
		equals( counts.draginit, 1, "draginit");
		equals( counts.dragstart, 1, "dragstart");
		equals( counts.drag, 1, "drag");
		equals( counts.dragend, 1, "dragend");
		// continue
		start();
	}, 20 );
	stop();
	
	// test clean-up
	setTimeout(function(){
		$div.remove();
		start();
	}, 20 );
	stop();
	
});