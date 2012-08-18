/*global define */

define('loader/path', function () {
	'use strict';

	define.loader = 'path';

	/**
	 * @class A base class for loading modules. Loader modules should be
	 * stateless. Instances of this module will be reused throught the loading
	 * process.
	 */
	define.loaders.path = function () {

	};

	/**
	 * Load a module for the given id. This is done by creating a script tag and
	 * inserting it into the DOM. Implement this method to override how modules
	 * are loaded.
	 *
	 * @param  {String} id A module id that has been resolved to its absolute path.
	 */
	define.loaders.path.prototype.load = function (id) {
		var element = document.createElement('script'),
			body = document.body;

		element.async = true;
		element.src = id + '.js';

		if (typeof NON_ESSENTIAL === 'undefined') {
			element.id = 'module-' + id;
			element.name = 'modulejs-module';
		}

		body.appendChild(element);
	};

	/**
	 * Resolve a relative id to an absolute one. In the simplest situation
	 * this method just concatenates the relative onto the absolute one.
	 * Implement this method to override how modules are resolved.
	 *
	 * @param  {String} root     The root path to find modules.
	 * @param  {String} relative The relative id that should be resolved.
	 * @return {String}
	 */
	define.loaders.path.prototype.resolve = function (root, relative) {
		switch (relative.charAt(0)) {

		// handles ../ and ./
		case '.':
			var rel_parts = relative.split('/'),
				root_parts = root.split('/'),
				part;

			// get rid of the empty element created by the '/'
			root_parts.pop();

			for (part in rel_parts) {
				if (rel_parts[0] === '..') {
					root_parts.pop();
				}

				rel_parts.shift();
			}

			return root_parts.join('/') + '/' + rel_parts.join('/');

		case '/':
			return relative;

		case 'h':
			if (/https?:.*/.test(relative)) {
				return relative;
			}

			return root + relative;

		default:
			return root + relative;
		}
	};
});