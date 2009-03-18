(function($){ // confine scope
/*******************************************************************************************/	
// jquery.Suggest.js - rev 18
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2007-10-21 | Updated: 2008-05-05
/*******************************************************************************************/
// REQUIRES: jquery 1.2.3+, utils.js, jquery.Register.js, jquery.alignTo.js
/*******************************************************************************************/
var PLUGIN = "Suggest", // Register the PLUGIN... and public methods...
$reg = $.Register( PLUGIN, "enable,disable,destroy,search".split(',') );
/*******************************************************************************************/
// jquery extension
$.fn[ PLUGIN ] = function( opts ){
	if (is.String(opts)){ // call a single public method
		var args = Slice( arguments, 1 );
		return this.each(function(){ $reg.call( this, opts, args ); });
		}
	// initialize the feature
	var src = opts.source, cache = opts.cache;
	if (is.empty(src)||!(is.Array(src)||is.String(src))) return this; // bad source
	opts = $.extend( {}, $[ PLUGIN ].defaults, opts||{} ); // inherit options/defaults
	cache = isCache(cache) ? cache : new $[ PLUGIN ].Cache(opts); // passed (shared) [or] new cache 
	return this.each(function() { // each element
		if ( $(this).is("input[type=text]") ) // text inputs only
			new $[ PLUGIN ].create( this, src, cache, opts ); // init
		});
	};
/*******************************************************************************************/
// plugin defaults
$[ PLUGIN ].defaults = {
	chars:			2, // min chars before a search
	delay:			1000, // after last key event, before search...
	display: 		10, // how many results to display at a time
	limit:			500, // max number of results to cache/return for each query
	cacheSize:		102400, // 100kb, max-size of the cache, 1kb ~ 1024b
	cacheMode:		'LRU', // REMOVE: Least Recently Used (LRU) or Most Recently Used (MRU)
	delimiter:		'\n', // split() server response
	subset:			true, // allow matching of subsets
	rank: 			true, // allow ranking/sorting matches // false if chosen to be done on server-side
	rankValue:		false, // optional fn to format the sort/match value (input.value) // scope: Input, args: [rawValue]
	formatResult:	false, // optional fn to format the displayed value (suggestion) // scope: List Item, args: [rawValue]
	onSelect:		false, // optional fn // return formatted value or false to prevent // scope: Input, args: [rawValue]
	callback: 		false, // optional fn to call after a suggestion is chosen/complete // scope: Input, no args
	//busyClass: 		'suggest_busy', // classname for <span> that wraps all, while busy
	width: 			null, // width of the results
	inputClass:		'suggest_input', // classname for <input /> 
	ulClass:		'suggest_list', // classname for results <ul> container
	divClass: 		'suggest_results', // classname for results <div> wrapper
	activeClass:	'suggest_over', // classname for results <li> hover/highlight
	matchClass:		'suggest_match', // classname for <span> in results text (query match substring)
	lessClass: 		'suggest_moreless', // classname for previous suggestions
	moreClass:		'suggest_moreless', // classname for more sugestions
	moreText:		"More Suggestions", // text for more suggestions
	lessText: 		"Previous Suggestions", // text for previous suggestions
	ajaxParams: 	{} // optional additional parameters passed with each ajax request
	};
/*******************************************************************************************/
// plugin constructor
$[ PLUGIN ].create = function( input, source, Cache, opts ) { 
	var self = $reg.add( input, this ), ens = self.NS; // register the instance, namespace
	self.input = input; self.source = source; self.Cache = Cache; self.opts = opts; // store args
	// prep the input and DOM elements
	self.$input = $(input).attr("autocomplete","off").addClass(opts.inputClass);
	//self.$span = self.$input.wrap("<span></span>").parent().css('position','relative');
	self.$div = $("<div></div>").addClass(opts.divClass).css('position','absolute')
		.appendTo(document.body).width( opts.width || self.$input.width() );//.appendTo(self.$span);
	self.$ul = $("<ul></ul>").addClass(opts.ulClass).appendTo(self.$div);	
	self.ppg = is.Number(opts.display) ? opts.display : Infinity;
	// enclose callbacks
	self.onSelect = function(v){ 
		return is.Function(opts.onSelect) ? opts.onSelect.call(input,v) : v; 
		};
	self.callback = function(){ 
		if (is.Function(opts.callback)) opts.callback.call(input); 
		};
	self.formatResult = function(li,data){
		return is.Function(opts.formatResult) ? opts.formatResult.call(li,data)||data : data;
		};	
	// bind events to the input	
	self.$input
		.bind( "keydown"+ens, function(ev){ 
			self.keydown.call(self,ev); 
			})	
		.bind( "blur"+ens, function(){ 
			setTimeout(function(){ 
				self.keep ? self.keep=false : self.hide(); 
				},200); 
			});
	// bind mouse events to the <ul> 
	self.$ul
		.bind( "mouseout"+ens, function(){ 
			self.hover.call( self, null ); 
			})
		.bind( "mouseover"+ens, function(e){ 
			self.hover.call( self, self.$li.index(self.li(e)) ); 
			})
		.bind( "click"+ens, function(e){ 
			self.keep = true; // keep results open
			if (self.active<0){ // no active item
				var el = self.li(e);
				if (el==self.$more[0]) self.more.call(self); // pg.down
				if (el==self.$less[0]) self.less.call(self); // pg.up	
				}
			else self.select.call(self); // current active item
			self.input.focus(); // maintain focus
			});
	// attempt to use "bgiframe" and "mousewheel" plugins
	try { self.$ul.bgiframe(); } catch(err){ }
	try { self.$ul.bind("mousewheel"+ens,function(e,d){ 
			d>0 ? self.less.call(self) : self.more.call(self); 
			}); } catch(err){ }
	// hide the results
	self.hide(); 
	self.Publish( "create" ); // "create.PLUGIN"
	}; 
/*******************************************************************************************/
// plugin methods
$[ PLUGIN ].create.prototype = {
	search: function(val){
		var self = this, q = $.trim( val || self.$input.val() ), 
		opts = self.opts, src = self.source, Cache = self.Cache;
		if ( q.length>=opts.chars && !self.disabled && q!=self.last ){ // new query or forced query
			self.last = q; 
			//self.$span.addClass(opts.busyClass);
			var cached = Cache.get( q, opts.subset, opts.limit, opts.rank );
			if (cached!==false) self.show( q, cached );
			else if (is.not.String(src)) self.show(q, Cache.filter(q,src,opts.limit,opts.rank));
			else $.ajax({ 
				type: 'GET', 
				dataType: 'text',
				url: src+(src.indexOf('?')<0?"?":"&")+"q="+escape(escRegExp(q)),
				data: $.extend({}, opts.ajaxParams, {limit:opts.limit}),
				success: function(txt){ 
					self.show(q, Cache.filter(q,txt.split(opts.delimiter),opts.limit,opts.rank)); 
					},
				error: function(){ self.hide(); }
				});	
			self.Publish( "search" ); // "search.PLUGIN"
			}
		else self.hide();
		},
	select: function(){
		var S = this, fv, v = (S.active>-1 && S.visible) ? S.data[S.active+S.index] : null; // raw value
		if (v && (fv=S.onSelect(v))!==false){ // onSelect fn NOT false		
			S.$input.val( S.last = is.String(fv) ? fv : v ); // formatted value
			S.callback();
			S.hide();
			S.input.focus(); // maintain focus	
			S.Publish( "select" ); // "select.PLUGIN"
			}
		},
	keydown: function(ev){
		var S = this, //self = self.$list,
		bubble = false, vz = S.visible, a = S.active;
		if (S.keyTmr) clearTimeout(S.keyTmr); // search timer
		switch (ev.keyCode){
			case vz && 33: // KEY.PAGEUP: 
				S.less(); break;
			case vz && 34: // KEY.PAGEDOWN: 
				S.more(); break;
			case vz && 38: // KEY.UP: 
				S.hover('-1'); break;
			case vz && 40: // KEY.DOWN: 
				S.hover('+1'); break;
			case !vz && 40: // KEY.DOWN: 
				S.last = ""; // force the search
				S.search(); 
				bubble = true; 
				break;
			case vz && 37: // KEY.LEFT: 
			case vz && 39: // KEY.RIGHT: 
			case vz && 27: // KEY.ESC: 
				S.hide(); 
				bubble = true; 
				break;
			case vz && a>-1 && 9: // KEY.TAB: 
				(ev.shiftKey) ? S.hover('-1') : S.hover('+1');
				break;
			case vz && a>-1 && 13: // KEY.ENTER: 
				S.keep = true; // keep results open
				S.select();
				break;
			case 9: // KEY.TAB: 
			case 13: // KEY.ENTER:
				bubble = true; // don't search
				break;	
			default: 
				bubble = true; 
				S.keyTmr = setTimeout(function(){ S.search.call(S); },S.opts.delay);
				break;
			}
		if (!bubble) ev.preventDefault();
		},
	li: function(e){ 
		return $(e.target).is('li') ? e.target : $(e.target).parents('li')[0]; 
		},
	hover: function(i){ var S = this;
		S.$li.removeClass(S.opts.activeClass);
		S.active = is.Number(i) ? i : is.String(i) ? S.active+(parseInt(i)||0) : is.defined(i) ? S.active : -1;
		S.active = S.active<-1 ? S.limit-1 : S.active==S.limit ? -1 : S.active;	
		S.$li.eq( S.active ).addClass( S.opts.activeClass );
		},
	more: function(){ var S = this;
		if (S.data.length>S.index+S.limit) S.populate(S.index+S.limit);
		},
	less: function(){ var S = this;
		if (S.index>0) S.populate(S.index-S.ppg);
		},
	hide: function(){
		this.$div.hide();
		this.visible = false;
		},
	show: function( q, arr ){ 
		var S = this;
		S.term = q; S.data = arr; 
		if (S.populate(0)){ 
			S.$div.appendTo(document.body)
				.alignTo(S.$input,{left:'left',auto:'outside'}).show();
			S.visible = true;
			}
		},
	populate: function(x){
		var S = this, opts = S.opts, len = S.data.length;
		//S.$span.removeClass(opts.busyClass);
		var ind = S.index = Math.max(x,0); 
		S.active = -1; 
		var lim = S.limit = Math.min(len-ind,S.ppg); 
		if (lim>0) {
			S.$ul.empty(); // empty the list
			for (var $row,v,i=ind; i<lim+ind; i++){
				if (!S.data[i]) continue; // bad data
				$row = $(li); // new row item
				v = S.formatResult( $row[0], S.data[i] )
					.replace(new RegExp(escRegExp(S.term),'ig'),function(q){
						return '<span class="'+opts.matchClass+'">'+q+'</span>'; 
						});
				S.$ul.append( $row.append(v) );
				}
			S.$li = $('li',S.$ul); // update the $li collection
			S.$less = (ind<=0) ? $([]) : // ## Previous Suggestions
				$(li).addClass(opts.lessClass).text( ind+' '+opts.lessText );
			S.$more = (len<=(lim+ind)) ? $([]) : // ## More Suggestions
				$(li).addClass(opts.moreClass).text( (len-lim-ind)+' '+opts.moreText );
			S.$ul.prepend(S.$less).append(S.$more); // add more and/or less
			return true; // something to show
			}
		S.hide();
		return false; // nothing to show
		},
	enable: function(){
		this.disabled = false;
		this.Publish( "enable" ); // "enable.PLUGIN"
		},
	disable: function(){
		this.disabled = true;
		this.Publish( "disable" ); // "disable.PLUGIN"
		},
	destroy: function(){
		// remove events from the input	
		this.$input.unbind( this.NS );
		// remove events from the <ul> 
		this.$ul.unbind( this.NS );
		// clean-up the DOM
		this.$input.attr("autocomplete","")
			.removeClass(this.opts.inputClass)
			.insertBefore(this.$span);
		this.$div.remove().empty();
		this.Publish( this, "destroy" ); // "destroy.PLUGIN"
		$reg.drop( this ); // unregister
		objectDestroy( this ); // self-destruct  
		}
	};
/*******************************************************************************************/
// Cache Constructor
$[ PLUGIN ].Cache = function( options ){
	return isCache(this) ? (function( opts ){
		var mx = (is.Number(opts.cacheSize) && opts.cacheSize>0) ? opts.cacheSize : $[ PLUGIN ].defaults.cacheSize;
		return Extend( this, { // new cache object
			size: 0, data: [], max: is.Number(mx) ? mx : Infinity,
			mode: is.String(opts.cacheMode) ? opts.cacheMode.toUpperCase() : $[ PLUGIN ].defaults.cacheMode,
			format: is.Function(opts.rankValue) ? opts.rankValue : function(){}
			});
		}).call( this, options || {} ) : new $[ PLUGIN ].Cache( options );
	};
/*******************************************************************************************/
// Cache Methods
$[ PLUGIN ].Cache.prototype = { 
	add: function( q, arr, size ){ 
		if (this.max<size) return arr; // too big to cache
		this.flush(size).data.unshift({ q:q, s:size, d:arr }); 
		this.size += size;
		return this.data[0].d; // << newest data is always [0]
		},
	get: function( q, subset, limit, rank ){
		var ret = false, arr = this.data, s = false;
		$.each( arr, function(i,val){ // each cached query (start with most recent)
			if ((new RegExp("^"+val.q+"$","i")).test(q)){ // query matches exactly cached data
				ret = arr.splice(i,1)[0]; // remove matched data
				arr.unshift( ret ); // make it newest data
				ret = ret.d; // data only
				return false; // stop iterating
				}			
			if (subset!==false && s===false) // allowed to find subs and none found yet
				if (val.d.length<limit && (new RegExp(escRegExp(val.q),"i")).test(q)) s = i; // hold the subset index
			});
		if (ret===false && s!==false) // no exact match, but subset match
			ret = this.filter( q, arr[s].d, limit, rank ); // filter subset and cache
		this.data = arr; // restore array
		return ret; // match or false
		},
	filter: function( q, data, limit, rank ){ 
		var chars=0, ret=[], arr=[];
		if (rank===true){
			var fmt = this.format, rnk = makeRank(q); // ranking func based on query
			$.each( data, function( r, v ){ // translate & rank
				if ( is.not.empty( v=$.trim(v) ) && ( r=rnk(fmt(v)||v) )<9 ) // matches only
					arr[arr.length] = [ v, r+" "+v.toLowerCase() ]; 
				}); 
			arr.sort(function(a,b){ return a[1]<b[1]?-1:a[1]>b[1]?1:0; }); // sort by rank
			}
		else arr = data;
		$.each( arr, function( i, val ){ // translate & filter
			val = (rank===true) ? val[0] : val;
			ret[ret.length] = val; // original value
			chars += val.length; // count bytes/characters
			if ( is.not.empty(limit) && ret.length>=limit ) return false; // stop at limit
			});
		return this.add( q, ret, chars ); // cache results
		},
	flush: function(x){
		if (is.not.empty(x) && is.Number(x) && x>=0)
			while (this.data.length && this.size+x>this.max) // make "x" space in the cache
				this.size -= ( this.mode=="MRU" ? this.data.shift() : this.data.pop() ).s; // MRU / LRU
		else { this.data = []; this.size = 0; } // flush everything
		return this;
		}
	};	
/*******************************************************************************************/
var // private helpers
li = '<li></li>',
isCache = function(o){ return (o instanceof $[ PLUGIN ].Cache); }, 
makeRank = function(q){ q = escRegExp(q); 
	var re = [ // create regexp so they don't compile everytime
		new RegExp("^"+q+"$","i"), // exact match
		new RegExp("(\\(|(, ))"+q+"(\\)|,)","i"), // exact (program) match
		new RegExp(q,"i"), // any match at all
		new RegExp("^"+q,"i"), // line starts with...
		new RegExp(" "+q,"i"), // word starts with...
		new RegExp(q+"(\\s|$)","i"), // ...ends in word boundry
		];
	return function(val){ var num = 2; // relevant match algorithm fn
		if (re[0].test(val)) num = 0; // exact match
		else if (re[1].test(val)) num = 1; // exact (parenthetical word match)
		else { // partial or no match
			if (!re[2].test(val)) num += 3; // doesn't match at all
			if (!re[3].test(val)) num += 2; // not: line start
			if (!re[4].test(val)) num += 1; // not: word start
			if (!re[5].test(val)) num += 1; // not: word or line end
			}
		return num; // ties revert to alphabetic order
		};
	};
/*******************************************************************************************/
})(jQuery); // secure the $ jQuery alias