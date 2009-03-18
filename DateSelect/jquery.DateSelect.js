(function($){ // confine scope
/*******************************************************************************************/	
// jQuery.DateSelect.js - rev 27 
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2007-02-14 | Updated: 2008-08-06
/*******************************************************************************************/
// REQUIRES: jquery 1.2.3+, utils.js, jquery.Register.js, Parse.js, jquery.alignTo.js
/*******************************************************************************************/
var PLUGIN = "DateSelect", // Register the PLUGIN... and public methods...
$reg = $.Register( PLUGIN, "enable,disable,destroy,value,show,hide".split(',') );
/*******************************************************************************************/
// jquery extension
$.fn[ PLUGIN ] = function( opts ){
	if ( is.String( opts ) ){ // call a single public method
		var args = Slice( arguments, 1 );
		return this.each(function(){ $reg.call( this, opts, args ); });
		}
	// inherit default values
	opts = $.extend( {}, $[ PLUGIN ].defaults, opts||{} );
	// calculate max, min, and date...
	var mn = $.trim(opts.min), mx = $.trim(opts.max);
	opts = $.extend( opts, { 
		min: getYMD( (/^\d{4}$/).test(mn) ? mn+'0101' : mn ) || '01000101', 
		max: getYMD( (/^\d{4}$/).test(mx) ? mx+'1231' : mx ) || '99991231',
		date: Parse(opts.date,'date') || Parse('today '+opts.date,'date') 
		});
	// initialize the feature ( text/hidden/button inputs only )
	return this.each(function(){ 
		var type = $(this).is(':'+PLUGIN) ? false : $(this).attr('type');
		if ( type=='text' || type=='hidden' || type=='button' ) 
			new $[ PLUGIN ].create( this, opts ); 
		});
	};
/*******************************************************************************************/
// plugin defaults
$[ PLUGIN ].defaults = {
	date:			'today',
	min:			null, // year or date obj or date string
	max:			null, // year or date obj or date string
	insert: 		"after", // string "after" or "before"
	order:			"MDY", // select order
	delta:			50, // +/- years
	start:			0, // week start index [ 0=sun, 1=mon... ]
	months: 		'January February March April May June July August September October November December'.split(" "),
	days: 			'1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31'.split(" "),
	weeks: 			'Su Mo Tu We Th Fr Sa'.split(" "),
	overMaxTitle: 	"Invalid: After Maximum Date",
	underMinTitle:	"Invalid: Before Minimum Date",
	closeLinkText:	"Close",
	cancelLinkText:	"Cancel",
	todayLinkText: 	"Today",
	nextMonthText:	"&raquo;",
	prevMonthText: 	"&laquo;",
	buttonTitle:	"Select Date From Calendar",
	buttonValue: 	"...",
	buttonClass:	"calendarButton",
	inputClass:		"",
	spanClass: 		"",
	monthClass:		"",
	dayClass:		"",
	yearClass:		"",
	value: 	function(y,m,d){ // scope: input 
		return Pad(y,-4)+Pad(m+1,-2)+Pad(d,-2); 
		},
	title: 	function(y,m,d){ // scope: options object
		return this.months[m]+' '+this.days[d-1]+', '+Pad(y,-4); 
		}
	};
/*******************************************************************************************/
// plugin constructor
$[ PLUGIN ].create = function( input, opts ){	
	var self = $reg.add( input, this, { input:input, opts:opts, // register the instance, store args
		ready: false, isOpen: false, active: null, isActive: false, // store initial properties
		cal: { m:null, y:null }, last: { x:0, y:0, t:0 }
		}); 
	// try to use the input value, else the options value
	opts.date = Parse( input.value, 'date' ) || opts.date;
	self.$input = $(input).addClass( opts.inputClass )
		.bind( "blur"+self.NS, function(){ self.value( Parse(this.value,'date') ); });
	self.$span = $(sp).addClass( opts.spanClass )
		[ (/after/i).test(opts.insert) ? "insertAfter" : "insertBefore" ](self.$input); 
	self.$button = $('<input type="button" title="'+opts.buttonTitle+'" />')
		.addClass(opts.buttonClass).val(opts.buttonValue).appendTo(self.$span)
		.bind( "click"+self.NS, function(){ self.show(); });
	// THE DATE SELECTS
	// figure out the years array from max/min/theDate...
	var years = [], yMin = opts.min.substr(0,4), yMax = opts.max.substr(0,4);
	if (yMin==yMax) years = [ yMin ]; // only one year	
	else if (yMin!='0100' && yMax!='9999') // max and min are both defined
		for (var i=0; i<=parseInt(yMax,10)-parseInt(yMin,10); i++) 
			years[i] = Pad(parseInt(yMin,10)+i,-4);
	self.adjustYrs = is.empty(years); // fixed year range
	var sel = [], ord = String(opts.order||"").toLowerCase();
	self.$yr = newSelect(years).addClass(opts.yearClass);
	self.$mth = newSelect(opts.months).addClass(opts.monthClass);
	self.$dy = newSelect(opts.days).addClass(opts.dayClass);
	sel[ ord.indexOf("y") ] = self.$yr[0];
	sel[ ord.indexOf("m") ] = self.$mth[0];
	sel[ ord.indexOf("d") ] = self.$dy[0];
	self.$sel = $(sel).bind( "change"+self.NS, function(){ self.changeSelects(); });
	self.$span.prepend( self.$sel );
	this.Publish( "create" ); // "create.PLUGIN"
	self.value( opts.date );
	}; 
/*******************************************************************************************/
// plugin methods
$[ PLUGIN ].create.prototype = {
	init: function(){
		var self = this;
		// create calendar mark-up and references
		self.$cal = $(dv).addClass("calendarPop").appendTo(document.body);//.append( $bg ).append( $fg );
			self.$bg = $(dv).addClass("bgDiv").appendTo(self.$cal);
			self.$fg = $(dv).addClass("fgDiv").appendTo(self.$cal);
				self.$prev = $(dv).addClass("prevMonth").html(self.opts.prevMonthText).appendTo(self.$fg);
				self.$next = $(dv).addClass("nextMonth").html(self.opts.nextMonthText).appendTo(self.$fg);
				self.$head = $(dv).addClass("monthDisplay").text('Month Year').appendTo(self.$fg);
				self.$table = $('<table cellpadding="0" cellspacing="0" border="0"></table>').appendTo(self.$fg);
					self.$thead = $('<thead><tr></tr></thead>').appendTo(self.$table);
					$.each(Array(7),function(i){ // weekday thead cells
						var w = (self.opts.start+i)%7, // the day index
						t = $('<td></td>').addClass( "day"+w ), // the cell
						s = $(sp).text( self.opts.weeks[w] ); // span/text
						$('tr',self.$thead).append( t.append(s) ); 
						});
					self.$tbody = $('<tbody></tbody>').appendTo(self.$table);
				self.$foot = $(dv).addClass("bottomButtons").appendTo(self.$fg);
					self.$close = $(dv).addClass("closeCalendar").html(self.opts.closeLinkText).appendTo(self.$foot);
					self.$cancel = $(dv).addClass("cancelCalendar").html(self.opts.cancelLinkText).appendTo(self.$foot);
					self.$today = $(dv).addClass("selectToday").html(self.opts.todayLinkText).appendTo(self.$foot);
		// set todays title...
		self.$today.attr('title',self.opts.title.apply(self.opts,Parse('today','ymd')));
		// bind events....
		self.$cal
			.bind( "mouseover"+self.NS, function(ev){
				var el = ev.target;
				while (el!=this){
					if ($(el).is('td'))
						return self.move($('td',self.$tbody).index(el));
					el = el.parentNode;
					}
				self.move();
				})
			.bind( "mousedown"+self.NS, function(ev){ 
				var el = ev.target, u = null, 
				clk = { t:ev.timeStamp, x:ev.pageX, y:ev.pageY };
				while (el!=this && u==null){
					if ($(el).is('td.valid')){
						if (clk.t-self.last.t<333 && Math.abs(clk.x-self.last.x)<3 && Math.abs(clk.y-self.last.y)<3) self.hide();
						else u = $('div',el).attr('title'); 
						}
					if (el==self.$cancel[0]){ self.hide(); u = self.$cancel[0].title; }
					if (el==self.$close[0]){ self.hide(); u = true; }
					if (el==self.$today[0]) u = self.$today[0].title;
					if (el==self.$next[0]) u = +1;
					if (el==self.$prev[0]) u = -1;
					if (u==null) el = el.parentNode;
					}
				if (is.String(u)) self.value( u );
				else if (is.Number(u)) self.changeMonth( u );
				self.$button[0].focus();
				self.last = clk;
				ev.stopPropagation();
				});
		// try to use these extensions if available
		try{ $('*',self.$cal).png(); } catch(ex){}
		try{ self.$cal.bgiframe(); } catch(ex){} 
		try{ self.$cal.bind( "mousewheel"+self.NS, function(ev,d){ 
				var el = ev.target, f = 1;
				while (el!=this){
					if (el==self.$head[0]) f = 12;
					el = el.parentNode;
					}
				self.changeMonth( -(d*f) ); 
				ev.preventDefault();
				}); 
			} catch(ex){} 
		self.$cal.hide();
		self.ready = true;
		},
	move: function(n){
		var $divs = $('div',this.$tbody).removeClass('active');
		if (is.Number(n)) this.active = n;
		if (is.String(n)) this.active += parseInt(n) || 0;
		if (is.defined(n) && is.Number(this.active)){
			this.active += this.active<0 ? 42 : this.active>=42 ? -42 : 0;
			$divs.eq(this.active).addClass('active');
			this.isActive = true;
			}
		else this.isActive = false;
		},
	keyPress: function(ev){ 
		if (this.isOpen && !this.disabled) {
			switch (ev.keyCode){
				case ev.shiftKey && 33: // SHIFT + PAGEUP
					this.changeMonth(-12); break;
				case 33: // PAGEUP
					this.changeMonth(-1); break;
				case ev.shiftKey && 34: // SHIFT + PAGEDOWN
					this.changeMonth(+12);; break;
				case 34: // PAGEDOWN
					this.changeMonth(+1);; break;
				case 38: // UP
					this.move('-7'); break;
				case 40: // DOWN
					this.move('+7'); break;
				case 37: // LEFT
					this.move('-1'); break;
				case 39: //  RIGHT
					this.move('+1'); break;
				case 36: // HOME
					this.value(this.$today[0].title); break;
				case 46: // DELETE
					this.value(this.$cancel[0].title); break;
				case 27: // ESC
					this.value(this.$cancel[0].title); 
					this.hide(); 
					break;
				case 13: // ENTER
					var $act = $('div.active',this.$tbody);
					if (is.not.defined($act[0])) this.hide();
					else this.value( $act[0].title );
					break;
				case 9: // TAB
					this.hide();
				default: return;
				}
			ev.preventDefault();
			}
		},
	"value": function(d){ 
		if (!this.disabled){
			var ymd = getYMD(d); d = Parse(ymd,'ymd');
			if (is.Array(d) && ymd>=this.opts.min && ymd<=this.opts.max){
				this.date = Parse(ymd,'date'); 
				this.changeSelects( d[0], d[1], d[2] );
				if (this.isOpen) this.newMonth( d[0], d[1] );
				}
			}
		},
	changeMonth: function(x){ 
		if (!this.disabled){
			var d = new Date(this.cal.y,this.cal.m+x,1), yy = d.getFullYear(), mm = d.getMonth();
			if (yy>99 && this.opts.min<getYMD([yy,mm,monthSize(yy,mm)]) && this.opts.max>getYMD([yy,mm,1])){
				this.newMonth(yy,mm); 
				if (this.isActive) this.move(this.active);
				}
			}
		},
	newMonth: function(y,m){
		var self = this;
		if (!is.Number(y)) y = self.cal.y; 
		if (!is.Number(m)) m = self.cal.m;
		self.$close.attr('title',self.opts.title.apply(self.opts,Parse(self.date,'ymd')));
		if (y!=self.cal.y || m!=self.cal.m){ // change the visible data
			self.cal = { y:y, m:m }; // what the calendar shows
			self.$prev.show(); self.$next.show();
			var sel = getYMD(self.date); // ymd of current selection
			self.$cal.removeClass('month0 month1 month2 month3 month4 month5 month6 month7 month8 month9 month10 month11').addClass('month'+m);
			// set month/year titles
			self.$prev.attr('title',self.opts.months[(m-1<0?11:m-1)]+' '+(m-1<0?y-1:y) );
			self.$next.attr('title',self.opts.months[(m+1>11?0:m+1)]+' '+(m+1>11?y+1:y) );
			self.$head.html(self.opts.months[m]+' '+y); // main calendar title
			var str = '<tr>', d=1, e, s = new Date(y,m,1).getDay(); // beginning day of the month
			if (s<=self.opts.start) s = s+7; e = monthSize(y,m)+s; // ending day of the month
			for (var i=self.opts.start; i<(42+self.opts.start); i++) {
				if (i>self.opts.start && i%7==self.opts.start && i<41+self.opts.start) str += '</tr><tr>'; // new row
				var x = new Date(y,m,( i<s ? -(s-i-1) : i>=e ? d+i-e : d++ )), ymd = getYMD( x );
				str += '<td class="'+( i<s ? "prevMonth" : i>=e ? "nextMonth" : "currentMonth" );
				if (ymd==sel){ self.active = self.isActive ? self.active : i-self.opts.start; str += " selected"; } 
				str += (ymd>=self.opts.min&&ymd<=self.opts.max?" valid":" invalid")+'"><div class="day'+(i%7)+'"';
				str += 'title="'+( ymd<self.opts.min ? self.opts.underMinTitle : 
					ymd>self.opts.max ? self.opts.overMaxTitle : self.opts.title.apply(self.opts,Parse(x,'ymd')) );
				str += '"><span>'+self.opts.days[ x.getDate()-1 ]+'</span></div></td>'; // write the cell
				if (ymd==self.opts.min) self.$prev.hide(); if (ymd==self.opts.max) self.$next.hide();
				}
			self.$tbody.html( str + '</tr>' );
			self.$tds = $('td',self.$tbody);
			}
		else { // change the selection
			self.active = new Date(y,m,1).getDay(); 
			self.active += (self.active<=self.opts.start?7:0)+self.date.getDate()-1;
			self.$tds.removeClass("selected").eq(self.active-self.opts.start).addClass("selected"); 
			self.move();
			}	
		},
	adjYears: function(y){ 
		var yr = this.$yr[0], l = yr.options.length,
		s = Math.max( y-this.opts.delta, parseInt(this.opts.min.substr(0,4),10) ),
		e = Math.min( y+this.opts.delta, parseInt(this.opts.max.substr(0,4),10) );
		if (l==0 || Pad(s,-4)!=yr.options[0].value || Pad(e,-4)!=yr.options[l-1].value){
			yr.options.length = 0;
			for ( var i=0; i<=e-s; i++ ){
				y = Pad( s+i, -4 );
				yr.options[i] = new Option( y, y );
				}
			}
		},
	changeSelects: function( y, m, d ){ 
		if (!this.disabled){
			y = y || parseInt(this.$yr.val(),10); 
			m = is.Number(m) ? m : this.$mth[0].selectedIndex; 
			d = d || this.$dy[0].selectedIndex+1;
			var l = this.$dy[0].options.length, x = monthSize(y,m), 
			ymd = Math.min(Math.max(getYMD([y,m,Math.min(d,x)]),this.opts.min),this.opts.max);
			if (is.Date(ymd=Parse(Pad(ymd,-8),'date'))){ 
				this.date = ymd; //Parse(ymd,'date'); 
				x = monthSize(ymd.getFullYear(),ymd.getMonth()); // update month size
				if (x<l) this.$dy[0].options.length = x;  // shorten the days
				else for (var i=l; i<x; i++) // lengthen days
					this.$dy[0].options[i] = new Option( this.opts.days[i], this.opts.days[i] );
				if (this.adjustYrs) this.adjYears(y); // move the year range based on selected year
				}
			this.Publish( "change", this.date ); // "change.PLUGIN"
			}
		this.setSelects();
		},
	setSelects: function(){ 
		var ymd = Parse(this.date,'ymd');
		try {
			if (this.$yr.val()!=Pad(ymd[0],-4)) this.$yr.val( Pad(ymd[0],-4) );
			if (this.$mth[0].selectedIndex!=ymd[1]) this.$mth[0].selectedIndex = ymd[1];
			if (this.$dy[0].selectedIndex!=ymd[2]-1) this.$dy[0].selectedIndex = ymd[2]-1;
			} 
		catch(ex){ }
		this.$input.val( this.opts.value.apply( this.$input[0], ymd ) );
		},
	"show": function(){
		Hide();
		var self = this;
		if (!self.disabled){
			if (!self.ready) self.init();
			self.last = self.opts.title.apply(self.opts,Parse(self.date,'ymd'));
			self.$cancel.attr('title',self.last);
			self.newMonth( self.date.getFullYear(), self.date.getMonth() ); 
			self.$cal.appendTo(document.body).alignTo(self.$button,{auto:"point"}).show();
			$(document).bind("mousedown"+self.NS, function(){ self.hide(); });
			$(window).bind("keydown"+self.NS, function(ev){ self.keyPress(ev) });
			self.isOpen = true;
			this.Publish( "show" ); // "show.PLUGIN"
			Hide = self.hide;
			}
		},
	"hide": function(){
		if (this.isOpen){
			this.$cal.hide();
			$(document).unbind("mousedown"+this.NS);
			$(window).unbind("keydown"+this.NS);
			this.isOpen = false;
			this.Publish( "hide" ); // "hide.PLUGIN"
			}
		},
	"enable": function(){
		this.disabled = false;
		this.$input.attr('disabled',false);
		this.$sel.attr('disabled',false);
		this.Publish( "enable" ); // "enable.PLUGIN"
		},
	"disable": function(){
		this.hide();
		this.disabled = true;
		this.$input.attr('disabled',true);
		this.$sel.attr('disabled',true);
		this.Publish( "disable" ); // "disable.PLUGIN"
		},
	"destroy": function(){
		this.$button.unbind( this.NS );
		this.$input.unbind( this.NS );
		this.$span.empty().remove();
		this.Publish( "destroy" ); // "destroy.PLUGIN"
		$reg.drop( this ); // unregister
		}
	};
/*******************************************************************************************/
var // private helpers
getYMD = function(str){
	if (is.empty(str)) return null;
	if (is.Array(str)) str = eval('new Date('+str.join(',')+')');
	var ymd = Parse(str,'ymd'); // [y,m,d]
	return ymd ? Pad(ymd[0],-4)+Pad(ymd[1]+1,-2)+Pad(ymd[2],-2) : null;
	},
newSelect = function(arr){
	var sel = $('<select></select>');
	for (var i=0; i<arr.length; i++) 
		sel[0].options[i] = new Option( arr[i], arr[i] );
	return sel;
	},
monthSize = function(y,m){ return 32-( new Date(y,m,32).getDate() ); },
Hide = function(){}, dv = '<div></div>', sp = '<span></span>';
/*******************************************************************************************/
})(jQuery) // secure the $ jQuery alias