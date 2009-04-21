(function($){
/******************************************************************************/
// PLUGIN FACTORY...
$.ux = function( name, config ){
	
	// validate, don't overwrite anything...
	if ( typeof name != "string" || $.fn[ name ] || $[ name ] ) 
		return false;
		
	// jquery instance method...
	$.fn[ name ] = function( arg, args ){
		var self, opts, ret, undefined;
		// call method "arg" on each instance
		if ( typeof arg == "string" && Plugin.allowed[ arg ] ){
			this.each(function(){
				self = $.data( this, name );
				if ( self ) 
					ret = self[ arg ].apply( self, args );
				// stop if a value is returned...
				return ( ret === undefined );
				});
			return ret !== undefined ? ret : this;
			}
		opts = $.extend({}, public.defaults, arg||{});
		if ( config.prepare ) 
			opts = config.prepare.call( this, opts, arguments ) || opts;
		return this.each(function(){ 
			new Plugin( this, opts ); 
			});
		};
		
	// custom jquery pseudo selector...
	$.expr[':'][ name ] = function(a){ 
		return !!$.data( a, name ); 
		};
	
	// public static jquery namespace...
	var public = $[ name ] = function( arg, args ){
		if ( typeof arg == "string" ) // call method "arg" on all instances
			$.each( Plugin.cache, function( i, cached ){
				if ( cached ) 
					this.instance[ arg ].apply( this.instance, args );
				});
		else // set and return global default options...
			return $.extend( public.defaults, arg || {} );
		};
	
	// static public properties
	public.defaults = config.defaults || {};
	
	// Plugin constructor
	function Plugin( elem, opts ){
		// custom create function...
		if ( config.create && config.create.apply( this, arguments )===false ) 
			return; // initialization was suppressed...
		// global instance tracking
		Plugin.cache.push({ instance:this, element:elem });	
		// local instance tracking...
		$.data( elem, name, this );
		};
		
	// Plugin instance methods
	Plugin.prototype = config.methods || {};
	Plugin.destroy = function(){
		var self = this, elem;
		// custom destroy function...
		if ( config.destroy ) 
			config.destroy.apply( self, arguments );
		// global instance tracking
		Plugin.cache = $.grep( Plugin.cache, function( cached ){
			return cached.instance !== self || !( elem = cached.element );
			});	
		// local instance tracking...
		$.removeData( elem, name );
		// self destruct...
		setTimeout(function(){
			for ( var attr in self ) 
				delete self[ attr ];
			self = elem = null;	
			}, 100 );
		};
	
	// cache all plugin instances (local)
	Plugin.cache = [];	
	
	// cache callable public methods...
	Plugin.allowed = { destroy: 1 };
	$.each( ( config.expose||"" ).split(/\s/),function( i, method ){ 
		Plugin.allowed[ method ] = 1;
		});
	
	// remember the plugin (global)
	$.ux.cache.push( Plugin );
	
	return true;
	};

// store all UX plugins
$.ux.cache = [];

// call a method on ALL UX plugin instances
$.ux.all = function( method, args ){
	$.each( $.ux.cache, function( i, Plugin ){
		if ( Plugin && Plugin.allowed[ method ] )
			$.each( Plugin.cache, function( j, cached ){
				if ( cached && cache.instance ) 
					cached.instance[ method ].apply( cached.instance, args );
				});
		});
	};

/******************************************************************************/
})(jQuery);