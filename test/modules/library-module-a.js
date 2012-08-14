/*global define */

define('library-module-a', {
	property_string: '!',
	property_number: 42,
	method: function () {
		'use strict';

		return this.property_number;
	},
	subobject: {
		subproperty: false
	}
});