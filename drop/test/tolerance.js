test("Tolerance Modes",function(){
					
	expect( 130 );				
	
	// create the markup for the test
	var $drop = $('<div />')
		.css({
			position: 'absolute',
			top: 200,
			left: 200,
			height: 100,
			width: 100
		})
		.appendTo( document.body )
		.bind("dropinit",function( event ){
			if ( multidrop )
				return $( this )
					.clone( true )
					.addClass('clone')
					.appendTo( document.body )
					.add( this );
		})
		.bind("drop",function( event ){
			count += 1;																 
		}),
	$drag = $('<div />')
		.css({
			position: 'absolute',
			top: 100,
			left: 100,
			height: 100,
			width: 100
		})
		.appendTo( document.body )
		.bind("draginit", function( event ){
			if ( multidrag )
				return $( this )
					.clone( true )
					.addClass('clone')
					.appendTo( document.body )
					.add( this );
		})
		.bind("dragstart",function( ev, dd ){
			if ( proxy )
				return $( this ).clone()
					.addClass('clone')
					.appendTo( document.body );
		})
		.bind("drag",function( ev, dd ){
			if ( move )
				$( dd.proxy ).css({ 
					top: dd.offsetY, 
					left: dd.offsetX 
				});
		})
		.bind("dragend",function( ev, dd ){
			var $div = $( this ).css({ 
				top: 100, 
				left: 100 
			});
			$( document.body ).find('.clone').remove();
		}),
	// local refs	
	count, move, proxy, multidrag, multidrop;
	
	// test MOUSE mode
	setTimeout(function(){
		
		// test each mode...
		$.each({
			'mouse':{
				'overlap':[0,0,0,0,0], 
				'middle':[0,0,0,0,0], 
				'fit':[0,0,0,0,0], 
				'mouse':[1,1,1,2,4], 
				'away':[0,0,0,0,0] 
			},
			'overlap':{ 
				'overlap':[0,1,1,2,4], 
				'middle':[0,1,1,2,4], 
				'fit':[0,1,1,2,4], 
				'mouse':[0,0,0,0,0], 
				'away':[0,0,0,0,0] 
			}, 
			'middle':{ 
				'overlap':[0,0,0,0,0], 
				'middle':[0,1,1,2,4], 
				'fit':[0,1,1,2,4], 
				'mouse':[0,0,0,0,0], 
				'away':[0,0,0,0,0] 
			}, 
			'fit':{ 
				'overlap':[0,0,0,0,0], 
				'middle':[0,0,0,0,0], 
				'fit':[0,1,1,2,4], 
				'mouse':[0,0,0,0,0], 
				'away':[0,0,0,0,0] 
			}, 
			'intersect':{ 
				'overlap':[0,1,1,2,4], 
				'middle':[0,1,1,2,4], 
				'fit':[0,1,1,2,4], 
				'mouse':[1,1,1,2,4], 
				'away':[0,0,0,0,0] 
			}
			}, function( mode, expected ){
			// execute interaction variants
			ok( true, mode.toUpperCase() +' tolerance...');
			// test prep
			$.drop({ mode:mode, multi:true });
			// drag to each position
			$.each({
				'overlap':{ clientX:33, clientY:33 }, 
				'middle':{ clientX:66, clientY:66 }, 
				'fit':{ clientX:100, clientY:100 }, 
				'mouse':{ clientX:250, clientY:250 }, 
				'away':{ clientX:-1, clientY:-1 } 
				}, function( where, coord ){
				// execute interaction variants
				$.each([
					'dropped '+ where +' (no motion)',
					'dropped '+ where +' (drag motion)',
					'dropped '+ where +' (proxy motion)',
					'dropped '+ where +' (multi drag)',
					'dropped '+ where +' (multi drop)'
					], function( i, msg ){
					// set-up
					count = 0;
					move = ( i > 0 );
					proxy = ( i > 1 );
					multidrag = ( i > 2 );
					multidrop = ( i > 3 );
					// simulate a complete drag
					$drag
						.fire("mousedown",{ clientX:0, clientY:0 })
						.fire("mousemove", coord )
						.fire("mouseup", coord )
						.trigger("click");
					// check counts
					equals( count, expected[where][i], msg );
				});
			});			
		});
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

