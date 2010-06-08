test("Callback Properties",function(){
					
	expect( 18 );
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
		.bind("draginit",function( ev, dd ){
			same( dd.drop, [], "drop (draginit)" );
			same( dd.available, [], "available (draginit)" );
		})
		.bind("dragstart",function( ev, dd ){
			same( dd.drop, [], "drop (dragstart)" );
			same( dd.available, $drop.toArray(), "available (dragstart)" );
		})
		.bind("drag",function( ev, dd ){
			same( dd.drop, [], "drop (drag)" );
			same( dd.available, $drop.toArray(), "available (drag)" );
		})
		.bind("dragend",function( ev, dd ){
			same( dd.drop, $drop.eq(0).toArray(), "drop (dragend)" );
			same( dd.available, $drop.toArray(), "available (dragend)" );
			$drag.remove();
			$drop.remove();
		})
	$drop = $('<div class="drop"/><div class="drop"/>')
		.appendTo( document.body )
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			height: 100,
			width: 100
		})
		.bind("dropinit",function( ev, dd ){
			same( dd.drop, [], "drop (dropinit)" );
			same( dd.available, [], "available (dropinit)" );
		})
		.bind("dropstart",function( ev, dd ){
			same( dd.drop, [], "drop (dropstart)" );
			same( dd.available, $drop.toArray(), "available (dropstart)" );
		})
		.bind("drop",function( ev, dd ){
			same( dd.drop, $drop.eq(0).toArray(), "drop (drop)" );
			same( dd.available, $drop.toArray(), "available (drop)" );
		})
		.bind("dropend",function( ev, dd ){
			same( dd.drop, $drop.eq(0).toArray(), "drop (dropend)" );
			same( dd.available, $drop.toArray(), "available (dropend)" );
		});
	
	$.drop({ mode:'overlap', multi:false });
	// simulate a complete drag and drop
	$drag
		.fire("mousedown",{ clientX:50, clientY:50 })
		.fire("mousemove",{ clientX:51, clientY:51 })
		.fire("mouseup",{ clientX:51, clientY:51 })
		.trigger("click");
	
});