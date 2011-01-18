test("Instance Method",function(){
	
	expect( 56 );
	
	$.each(['init','start','','end'],function( i, type ){
	
		// make sure the event handler gets bound to the element
		var $elem = $('<div />'), 
		elem = $elem[0],
		count = 0,
		fn = function(){
			count += 1;
		},
		opts = {
			which: 99, 
			distance: 88, 
			not: 77, 
			handle: 66, 
			drop: 55, 
			click: 44 
		},
		data;
		
		ok( $elem.drag( type, fn )[0] == elem, ".drag("+( type ? "'"+ type +"'," : "" )+" fn )" );
		ok( $.data( elem, $.event.special.drag.datakey ), "drag data exists" );
		ok( $.data( elem, "events" ), "event data exists" );
		ok( $.data( elem, "events" )[ 'drag'+type ][0], 'drag'+ type +" event handler added" );
		
		ok( $elem.drag( type )[0] == elem, ".drag("+( type ? "'"+ type +"'," : "" )+")" );
		ok( count == 1, "handler was triggered");
		
		$elem.unbind( type );
		
		ok( $elem.drag( type, fn, opts )[0] == elem, ".drag("+( type ? "'"+ type +"'," : "" )+" fn, opts )" );
		ok( data = $.data( elem, $.event.special.drag.datakey ), "drag data exists" );
		ok( data.which == opts.which, "'which' option stored" );
		ok( data.distance == opts.distance, "'distance' option stored" );
		ok( data.not == opts.not, "'not' option stored" );
		ok( data.handle == opts.handle, "'handle' option stored" );
		ok( data.drop == opts.drop, "'drop' option stored" );
		ok( data.click == opts.click, "'click'option stored" );
		
		$elem.remove();
		
	});
});