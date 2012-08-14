/*global define */

define('dependent-module-a', ['library-module-a', 'library-module-b'], function (lib_a, lib_b) {
	'use strict';

	return {
		verify_property_string: function (is) {
			is.equal(lib_a.property_string, '!', 'are strings from library a ok?');
			is.equal(lib_b.property_string, '!', 'are strings from library b ok?');
		},
		verify_property_number: function (is) {
			is.equal(lib_a.property_number, 42, 'are the numbers from library a ok?');
			is.equal(lib_b.property_number, 42, 'are the numbers from library b ok?');
		},
		verify_method: function (is) {
			is.equal(typeof lib_a.method, 'function', 'are the methods from library a functions?');
			is.equal(typeof lib_b.method, 'function', 'are the methods from library b functions?');

			is.equal(lib_a.method(), 42, 'do the methods from library a work?');
			is.equal(lib_b.method(), 42, 'do the methods from library b work?');
		},
		verify_subobject: function (is) {
			is.notEqual(typeof lib_a.subobject, 'undefined', 'is the subobject defined?');
			is.notEqual(typeof lib_b.subobject, 'undefined', 'is the subobject defined?');

			is.strictEqual(lib_a.subobject.subproperty, false, 'do the subproperty from library a work?');
			is.strictEqual(lib_b.subobject.subproperty, false, 'do the subproperty from library b work?');
		}
	};
});