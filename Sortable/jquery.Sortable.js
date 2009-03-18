;(function($){ // confine scope
/*******************************************************************************************/	
// jQuery.Sortable.js - rev 9 
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2007-11-28 | Updated: 2008-05-05
/*******************************************************************************************/
// REQUIRES: jquery 1.2.3+, utils.js, jquery.Register.js (rev 16+)
/*******************************************************************************************/
var PLUGIN = "Sortable", // Register the PLUGIN... and public methods...
$reg = new $.Register( PLUGIN, "enable,disable,destroy,sort".split(',') );
/*******************************************************************************************/
// jquery extension
$.fn[ PLUGIN ] = function( opts ){
	if ( is.String( opts ) ){ // call a single public method
		var args = Slice( arguments, 1 );
		return this.each(function(){ $reg.call( this, opts, args ); });
		}
	// initialize the feature
	opts = $.extend( {}, $[ PLUGIN ].defaults, opts||{} );
	return this.each(function(){ 
		var tag = $(this).is(':'+PLUGIN) ? false : this.nodeName.toLowerCase(),
		config = ( tag=='ul' || tag=='ol' ) ? { bod:$(this), row:"li" } : 
			( tag=='table' ) ? { ths:$('thead td',this), bod:$('tbody',this), row:"tr", cell:"td" } :	
			( tag=='select' ) ? { bod:$(this), row:"option" } :  false;
		if ( tag && config ) new $[ PLUGIN ].create( this, opts, config ); 
		});
	};
/*******************************************************************************************/
// plugin defaults
$[ PLUGIN ].defaults = {
	sortClass:	'sortAsc sortDsc',
	groupClass:	'group',
	groupClosed:'closed',
	cache:		true,
	cols: 		[],
	groups: 	[],
	stripe: 	false,
	onSort: 	null, // executed before sorting, return false to prevent
	callback:	null // executed whenever sorting completes
	};
/*******************************************************************************************/
// plugin constructor
$[ PLUGIN ].create = function( el, opts, config ){
	var self = $.extend( $reg.add( el, this ), config, { 
		el: el, opts: opts, rows: [], cache: []		
		}); // register the instance, store args, init props
	self.ths = $( opts.head || self.ths || "<span></span>" );
	// bind click to the table headers
	if ( self.ths.jquery ) 
		self.ths.bind( "click"+self.NS, function(){ 
			self.sort( self.ths.index(this) ); 
			return false;
			});
	self.bod.each(function(i){ 
		self.rows[i] = $( self.row, this ); 
		self.cache[i] = [];
		}); // ref the init rows
	self.stripe();
	}; 
/*******************************************************************************************/
// plugin methods
$[ PLUGIN ].create.prototype = {
	findData: function( b, dsc ){
		var o = this, x = o.active, fn, td, txt, group, grp = o.opts.groups[x],
		data = o.cache[b][x] || []; // load cached data
		if (is.empty(data)){ // read data
			fn = getParser( o.opts.cols[x], (o.cell?$(o.cell,o.rows[b]):$(o.rows[b])).eq(x).text() ); 
			group = is.Function(grp) ? grp : function(x){ return grp ? x : false; };
			o.rows[b].each(function(i){
				td = ( o.cell ? $(o.cell,this) : $(this) ).eq(x);
				txt = td.text();
				data[i] = { i:i, v:fn.call( td[0], txt ), g:group(txt) };	
				});
			data.sort(function(a,b){ 
				return a.g < b.g ? -1 : a.g > b.g ? 1 :
					a.v < b.v ? -1 : a.v > b.v ? 1 : a.i - b.i; 
				});// sort the data (asc)
			if (o.opts.cache) o.cache[b][x] = data; // cache (asc)
			}
		return dsc ? data.slice().reverse() : data;
		},
	sort: function( x, dsc ){ 
		var o = this, a = o.opts.sortClass.split(" "), lastGrp, tr, group = [], len, $trGrp, doGrp; 
		if (o.allow(x)==false||is.not.Number(o.active)) return; // break
		if (is.not.defined(dsc)) dsc = o.ths.eq(o.active).is(".sortAsc"); // direction
		o.ths.removeClass(o.opts.sortClass); // unclass
		if (o.active>-1) { // sort column
			$.each( o.bod, function(j){
				$('tr.'+o.opts.groupClass,this).remove(); // ungroup
				$.each( o.findData(j,dsc), function(i,c){ 
					tr = o.rows[j][c.i]; doGrp = (c.g!==false);
					if (lastGrp!=c.g && doGrp){
						// bind event to previous group
						if (group.length) o.toggler( $trGrp, group );
						// create the next group
						len = $(tr).children().length;
						$trGrp = $('<tr class="'+o.opts.groupClass+'"></tr>')
							.append('<td colspan="'+( len )+'"><span class="toggle">'+( c.g )+'</span></td>');
						o.bod.eq(j).append( $trGrp );
						group = [ tr ];
						lastGrp = c.g;	
						}
					else if (doGrp) group[ group.length ] = tr;
					o.bod.eq(j).append( $(tr).show() ); // move the row
					}); 
				// bind event to final group
				if (group.length && doGrp) o.toggler( $trGrp, group );
				});
			o.ths.eq(o.active).addClass(dsc?a[1]:a[0]); // sort class
			}
		else o.rows.each(function(i,v){ o.bod.append(v); }); // unsort
		this.Publish( "sort" ); // "sort.PLUGIN"
		o.stripe().exec( o.opts.callback, o.active );
		},
	toggler: function( $elem, rows ){
		var cls = this.opts.groupClosed;
		//$('span',$elem).html( '('+rows.length+')' );
		$elem.bind('click',function(){ 
			var dir = $( this ).is('.'+cls);
			$( rows )[ dir ? "show" : "hide" ]();
			$elem[ dir ? "removeClass" : "addClass" ]( cls );
			});
		},
	allow: function( x ){ var o = this; 
		x = is.Number(x) && x<o.ths.length ? x : o.active || 0;
		if (o.disabled||o.opts.cols[x]===false) return false; // disabled
		if (o.exec(o.opts.onSort,x)===false) return false; // onSort = false;
		o.active = x;
		},
	stripe: function(){
		var str = this.opts.stripe, arr;
		if (is.String(str) && is.not.empty(str) && is.Array(arr=str.split(" ")))
			$( this.row, this.bod ).each(function(i){								
				if ( $(this).is(":visible") ) 
					$( this ).removeClass( str )
						.addClass( arr[ i%arr.length ] );	
				});
		return this;
		},
	exec: function( fn, arg ){ return is.Function( fn ) ? fn.call( this, arg ) : null; },
	enable: function(){
		this.disabled = false;
		this.Publish( "enable" ); // "enable.PLUGIN"
		},
	disable: function(){
		this.disabled = true;
		this.Publish( "disable" ); // "disable.PLUGIN"
		},
	destroy: function(){
		this.ths.unbind( "click"+this.NS );
		this.Publish( "destroy" ); // "destroy.PLUGIN"
		$reg.drop( this ); // unregister
		objectDestroy( this ); // self destruct
		}
	};
/*******************************************************************************************/
// private helpers
var P = {}, // more private functions
getParser = function(id,x){ var fn; 
	if (is.Function(id)) fn = id;
	if (is.Function(P[id])) fn = P[id];
	if (is.not.Function(fn)) // try automatic decision
		Each("date time number money text".split(" "),function(i,v){
			if (is.Function(P[v]) && P[v](x)!=Infinity) fn = P[v];
			return is.not.Function(fn);
			});
	return fn;
	};
/*******************************************************************************************/
// PUBLIC fn to extend data parsing
$[ PLUGIN ].learn = function( id, fn ){
	if (is.empty(id)||is.not.String(id)||is.not.Function(fn)) return false;
	else P[id] = fn; return true;
	};
// Standard Parse Extensions
$[ PLUGIN ].learn("text",function(x){ 
	return x.toLowerCase(); 
	});
$[ PLUGIN ].learn("number",function(x){ 
	return isNaN(x=parseFloat(x)) ? Infinity : x; 
	});
$[ PLUGIN ].learn("money",function(x){
	return isNaN(x=parseFloat(x.replace(/(\$|\,)/g,""))) ? Infinity : x;
	});
// the following require: Parse.js
$[ PLUGIN ].learn("date",function(x){
	return is.not.Array( x = Parse(x,'ymd') ) ? Infinity : // YYYY+MM+DD+hh+mm+ss+ms.
		$.each( x, function(i,v){ x[i] = Pad( v, i==0 ? -4 : i==6 ? -3 : -2 ); }).join("");
	});
$[ PLUGIN ].learn("time",function(x){
	return is.not.Array( x = Parse(x,'hms') ) ? Infinity : // hh+mm+ss+ms.
		$.each( x, function(i,v){ x[i] = Pad( v, i==3 ? -3 : -2 ); }).join("");
	});
/*******************************************************************************************/
})(jQuery) // secure the $ jQuery alias