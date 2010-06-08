test("Instance and Static Methods",function(){
	
	expect( 29 );
	
	$.each(['init','start','','end'],function( i, type ){
	
		// make sure the event handler gets bound to the element
		var $elem = $('<div />'), 
		elem = $elem[0],
		count = 0,
		fn = function(){
			count += 1;
		};
		
		ok( $elem.drop( type, fn )[0] == elem, ".drop("+( type ? "'"+ type +"'," : "" )+" fn )" );
		ok( $.data( elem, $.event.special.drop.datakey ), "drop data exists" );
		ok( $.data( elem, "events" ), "event data exists" );
		ok( $.data( elem, "events" )[ 'drop'+type ][0], 'drop'+ type +" event handler added" );
		
		ok( $elem.drop( type )[0] == elem, ".drop("+( type ? "'"+ type +"'," : "" )+")" );
		ok( count == 1, "handler was triggered");
				
		$elem.remove();
		
	});
	
	// call the static method with settings
	var fn = function(){};
	$.drop({
		multi: 99,
		delay: 88,
		mode: 77,
		tolerance: fn
	});
	
	ok( $.event.special.drop.multi == 99, "$.drop() static method..." );
	ok( $.event.special.drop.multi == 99, "multi option was set" );
	ok( $.event.special.drop.delay == 88, "delay option was set" );
	ok( $.event.special.drop.mode == 77, "mode option was set" );
	ok( $.event.special.drop.tolerance == fn, "tolerance option was set" );
	
	// restore defaults
	$.drop({
		multi: 1,
		delay: 20,
		mode: 'overlap',
		tolerance: null
	});
	
});