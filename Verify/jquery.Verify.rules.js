(function($){ // secure the $ jQuery alias
/******************************************************************************/
// jquery.Verify.rules.js - rev 1
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2009-02-19 | Updated: 2009-02-27
/******************************************************************************/
// REQUIRES: jquery 1.3.1+
/******************************************************************************/

$.Verify.addRule( ".require", function( val ){
	return $.Verify.applyRule.call( this, 'require', val, true );
	}); 
	
$.Verify.addRule( ".email", function( val ){
	return $.Verify.applyRule.call( this, 'pattern', val, $.Verify.patterns['email'] );
	}); 

$.Verify.addRule( ".phone", function( val ){
	return $.Verify.applyRule.call( this, 'pattern', val, $.Verify.patterns['phone'] );
	});

$.Verify.addRule( ".zipcode", function( val ){
	return $.Verify.applyRule.call( this, 'pattern', val, $.Verify.patterns['zipcode'] );
	});

$.Verify.addRule( ".acceptImage", function( val ) {
	return $.Verify.applyRule.call( this, 'pattern', val, 
		(/\.(gif|jpg|jpeg|png|bmp)$/i), "{field} is not a valid format." );
	});

$.Verify.addRule( ".acceptVideo", function( val ) {
	return $.Verify.applyRule.call( this, 'pattern', val, 
		(/\.(mov|mpeg|mpg|mp2|mp4|flv|wmv|avi)$/i), "{field} is not a valid format." );
	});

$.Verify.addRule( ".uniqueUser", function( val ){
	var $field = $( this ), 
	data = $field.data("verify.users") || $field.data("verify.users",{});
	if ( !val || data[ val ] === true ) return; // verified
	if ( data[ val ] === false ) return "{field} is already taken."; // failed
	if ( !data[ val ] ){
		$field.addClass("pending"); // prevent multiple requests
		data[ val ] = "checking..."; // prevent multiple requests
		$.get("user_lookup.jsp", { user: val }, function( txt ){
			data[ val ] = !!txt; // cache the response
			$field.removeClass("pending").trigger("verify"); // verify:field
			},"text");
		return "Checking {field}..."
		}
	});

$.Verify.addRule( ".strongPassword", function( val ){
	if ( !val ) return; // skip empty
	var score = 0;
	// min length... fail
	if ( val.length < 6 ) 
		return "Password must be at least 6 characters.";
	// no spaces... fail
	if ( (/\s/).test( val ) ) 
		return "Password cannot contain any spaces.";
	// score lowercase... 
	if ( (/[a-z]/).test( val ) ) score += 1; 
	// score uppercase...
	if ( (/[A-Z]/).test( val ) ) score += 1; 
	// score number...
	if ( (/[0-9]/).test( val ) ) score += 1; 
	// score symbol...
	if ( (/[^a-zA-Z0-9]/).test( val ) ) score += 1; 
	// score length...
	if ( val.length >= 10 ) score += 1;
	// return message
	return score < 3 ? "Password is not strong enough." : null;
	});

$.Verify.addRule( ".creditcard", function( val ) {
	if ( !val ) return; // not necessarily required...										
	val = String( val ).replace(/\D/g,""); // get digits only...
	for ( var sum = 0, n, i = 1; i <= val.length; i++ ) { // loop each digit
		n = parseInt( val.charAt( val.length - i ), 10 ); // right to left
		sum += i % 2 < 1 ? n > 4 ? 2 * n - 9 : 2 * n : n; // apply luhn formula
		}	
	// checksum and simple prefix+length patterns (visa, mastercard, amex, discover)
	if ( sum%10 != 0 || !(/^(4\d{12}|4\d{15}|5[1-5]\d{14}|3[47]\d{13}|6\d{15})/).test( val ) ) 
		return "{field} is not a valid.";
	});

/******************************************************************************/
})(jQuery) // secure the $ jQuery alias