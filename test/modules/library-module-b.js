/*global define */

define('library-module-b', function () {
	'use strict';

	return {
		property_string: '!',
		property_number: 42,
		method: function () {
			return this.property_number;
		},
		subobject: {
			subproperty: false
		}
	};
});