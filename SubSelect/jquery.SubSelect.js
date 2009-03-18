;(function($){ // confine scope
/*******************************************************************************************/	
// jQuery.SubSelect.js - rev 15 
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2007-04-06 | Updated: 2008-09-17
/*******************************************************************************************/
// REQUIRES: jquery 1.2.3+, utils.js, jquery.Register.js
/*******************************************************************************************/
var PLUGIN = "SubSelect", // Register the PLUGIN... and public methods...
$reg = $.Register( PLUGIN, "enable,disable,destroy,value".split(',') );
/*******************************************************************************************/
// jquery extension
$.fn[ PLUGIN ] = function( map, opts ){
	if ( is.String( map ) ){ // call a single public method
		var args = Slice( arguments, 1 );
		if ( map=='value' && !args.length ) return $reg.call( this.filter(':'+PLUGIN)[0], map, args ); // get 1st value
		else return this.each(function(){ $reg.call( this, map, args ); });
		}
	// initialize the feature
	opts = $.extend( {}, $[ PLUGIN ].defaults, opts||{} );
	return this.each(function(){ new $[ PLUGIN ].create( this, map, opts ); });
	};
/*******************************************************************************************/
// plugin defaults
$[ PLUGIN ].defaults = {
	selectClass: 	"", // classname(s) to add to generated <select>s
	formatText:		function(s){ return s.split('#')[1]; }, // return <option> value or null for index
	formatValue: 	function(s){ return s.split('#')[0]; } // return <option> text or null for unformatted value
	};
/*******************************************************************************************/
// plugin constructor
$[ PLUGIN ].create = function( el, map, opts ){
	var self = $reg.add( el, this, { el:el, map:map, opts:opts } ); // register the instance, store args
	self.root = self.subSel(map);
	$(el).append(self.root);
	self.set( opts.value ).get();
	self.Publish( "create" ); // "create.PLUGIN"
	}; 
/*******************************************************************************************/
// plugin methods
$[ PLUGIN ].create.prototype = {
	value: function(v){ return is.defined(v) ? this.set(v) : this.get(); },
	set: function(v){ 
		var o = this, $s = o.root, 
		i = 0; v = o.val = v || o.val;
		if ( is.Array(v) && v.length>0 ) 
			while ( is.defined( v[i], $s[0] ) ){
				$s.val( v[i++] ).trigger( "change"+o.NS );
				$s = $(":input",$s.next('span'));
				}
		else if ( is.not.empty(v) ) $s.val(v).trigger( "change"+o.NS );
		else { $s[0].selectedIndex = 0; $s.trigger( "change"+o.NS ); }
		return o;
		},
	get: function(){
		var o = this, i = 0; o.val = []; 
		o.val[ i++ ] = o.root.val(); // root <select>
		$(":input", o.root.next('span') ) // each <subselect>
			.each(function(){ o.val[i++] = $(this).val(); }); 
		return o.val;
		},
	newSel: function(arr){
		var sel = $('<select class="'+this.opts.selectClass+'"></select><span></span>');
		for (var v,t,i=0; i<arr.length; i++) 
			if (is.not.empty(arr[i])){
				v = is.Function(this.opts.formatValue) ? this.opts.formatValue(arr[i]) : i;
				t = is.Function(this.opts.formatText) ? this.opts.formatText(arr[i]) : arr[i];
				sel[0].options[i] = new Option( t||arr[i], v||i );
				}
		return sel;
		},
	subSel: function( map ){
		if ( is.not.empty( map ) ){ 
			var arr=[], opt=[], self = this;
			for (var attr in map){ 
				arr.push(attr); 
				opt.push(map[attr]);	
				}
			return self.newSel(arr).filter('select')
				.bind("change"+self.NS,function(){
					if ( !self.disabled ) 
						self.change( $(this).next('span').empty(), opt[ this.selectedIndex ] );
					}).end();
			}
		return null;
		},
	change: function( $sp, map ){
		if ( is.Array(map) && !is.String.apply( this, map ) ) // check each array member...
			for (var i=0; i<map.length; i++) this.change($sp,map[i]);
		else if (is.Array(map)) $sp.append( this.newSel(map) );
		else if (is.String(map)) $sp.append( map ); 
		else if (is.Object(map)) $sp.append( this.subSel(map) ); 
		else if (is.Function(map)) map($sp);
		this.Publish( "change" ); // "change.PLUGIN"
		return this;
		},
	enable: function(){
		this.disabled = false;
		$(':input',this.root).andSelf().attr('disabled',false);
		this.Publish( "enable" ); // "enable.PLUGIN"
		},
	disable: function(){
		this.disabled = true;
		$(':input',this.root).andSelf().attr('disabled',true);
		this.Publish( "disable" ); // "disable.PLUGIN"
		},
	destroy: function(){
		this.root.remove().empty();	
		this.Publish( "destroy" ); // "destroy.PLUGIN"
		$reg.drop( this ); // unregister
		objectDestroy( this ); // self-destruct
		}
	};
/*******************************************************************************************/
})(jQuery) // secure the $ jQuery alias