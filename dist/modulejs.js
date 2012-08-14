/*! modulejs - v0.0.1 - 2012-08-14
* Copyright (c) 2012 Aaron Spaulding; Licensed MIT */

/**
 * A light weight implementation of AMD with no dependencies.
 *
 * Errors:
 *
 * To keep this file small the errors have also been minified. Here's a cheat sheet:
 *
 *   - E:1 - Invalid arguments
 *   - E:2 - Circular dependency found
 */
function define(id, dependencies, factory) {
	'use strict';

	var local_define = define, // a reference to the global define for minification
		depend, depend_id;

	if (typeof factory === 'undefined') {
		if (typeof dependencies === 'undefined') {
			// define(function () {}) or define({})
			factory = id;
			id = null;
			dependencies = [];
		} else if (typeof id === 'string') {
			// define('/modules/coolModule', function () {})
			//   or define('/modules/coolModule', {})
			factory = dependencies;
			dependencies = [];
		} else if (local_define._util.isArray(id)) {
			// define(['/modules/coolModule', '/modules/coolerModule'], function () {})
			//   or define(['/modules/coolModule', '/modules/coolerModule'], {})
			factory = dependencies;
			dependencies = id;
			id = null;
		} else {
			// there are two parameters, but the first is of an unexpected type
			if (typeof NON_ESSENTIAL === 'undefined') {
				throw local_define._util.error('Improper arguments provided to define');
			} else {
				throw 'E:1';
			}
		}
	}

	if (id !== null) {

		// make the id absolute
		id = local_define._util.path_resolve(local_define.module_path, id);

		if (!(id in local_define._modules)) {
			// this is a source module-- it was included directly
			//   and not through the module resolution process.

			local_define._modules[id] = new local_define.Module(id);
		}

		// quick loop to resolve depencency names
		for (depend in dependencies) {
			dependencies[depend] = local_define._util.path_resolve(local_define.module_path, dependencies[depend]);
		}

		local_define._modules[id].factory(factory);
		local_define._modules[id].depends_on(dependencies);

		// look for circular dependencies.
		for (depend in dependencies) {
			depend_id = dependencies[depend];

			// if we've seen it and its not fully loaded, then its a circular dependency
			if (depend_id in local_define._modules && !local_define._modules[depend_id].is_loaded()) {
				if (typeof NON_ESSENTIAL === 'undefined') {
					throw local_define._util.error('Circular dependency found when defining module: ' + id);
				} else {
					throw 'E:2';
				}
			} else {
				// if there are no circular dependencies create the module for this dependency
				//   its dependencies will be added when its module load.s
				local_define._modules[depend_id] = new local_define.Module(depend_id);

				// then let it know what depends on it
				local_define._modules[depend_id].dependency_of(local_define._modules[id]);

				// include it
				local_define._util.require(depend_id);
			}
		}
	}
}

// Extend define with the necessary goodies
(function (define, document) {
	'use strict';

	define.Module = function (id) {
		this._id = id;
		this._dependency_of = [];
		this._loaded_depends = {};
		this._is_factory_called = false;

		// this stuff can't be determined until the dependencies are set
		this._depends = null;
		this._left = 1 / 0; // Infinity, seems like this should be in uglify

		// this can't be determined until the factory is set
		this._factory = null;
	};

	var module_prototype = define.Module.prototype;

	module_prototype.depends_on = function (depends) {
		this._depends = depends;
		this._left = depends.length;

		// if its a leaf dependency
		// immediately tell its parents that its loaded.
		if (this.is_loaded()) {
			this.backtrack();
		}
	};

	module_prototype.factory = function (factory) {
		this._factory = factory;
	};

	module_prototype.dependency_of = function (module) {
		this._dependency_of.push(module);
	};

	module_prototype.is_loaded = function () {
		return this._left === 0;
	};

	module_prototype.backtrack = function () {

		this.prepare_factory();

		// tell the modules that depend on it that its loaded
		for (var i = this._dependency_of.length - 1; i >= 0; i--) {
			this._dependency_of[i].dependency_loaded(this._id, this._factory);
		}
	};

	module_prototype.prepare_factory = function () {
		// this should only happen once
		if (!this._is_factory_called && typeof this._factory === 'function') {

			// prepare the arguments for the factory
			for (var depend = this._depends.length - 1; depend >= 0; depend--) {
				this._depends[depend] = this._loaded_depends[this._depends[depend]];
			}

			this._is_factory_called = true;
			this._factory = this._factory.apply(null, this._depends);
		}
	};

	module_prototype.dependency_loaded = function (id, factory) {
		this._left--;

		this._loaded_depends[id] = factory;

		if (this.is_loaded()) {
			this.backtrack();
		}
	};

	define._modules = {};

	/**
	 * Utility functions
	 *
	 * @private
	 */
	define._util = {
		isArray: Array.isArray || function (test_array) {
			// this is not a 100% test.
			//   It will not handle arrays created in separate windows.
			//   It will not handle Array.prototype which is technically an array, although no one cares.
			return test_array instanceof Array;
		},
		path_resolve: function (root, relative) {
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
		},
		require: function (id) {
			var element = document.createElement('script'),
				// i suppose the head is as good a place as any
				header = document.getElementsByTagName('head')[0];

			element.id = 'module-' + id;
			element.src = id + '.js';

			header.appendChild(element);
		}
	};

	// Non-essential code, this will be removed when using UglifyJS
	// $ uglify --define NON_ESSENTIAL=true

	if (typeof NON_ESSENTIAL === 'undefined') {

		// not necessary if minified
		define._util.error = function (message) {
			return 'ModuleJS: ERROR: ' + message;
		};

		define._util.save = function () {
			return {
				_util: {
					require: define._util.require
				},
				module_path: define.module_path
			};
		};

		// this function is useful only for running tests and is not helpful,
		// and potentially damaging, in production code.
		define._util.reset = function (state) {
			define._modules = {};
			define._util.require = state._util.require;
			define.module_path = state.module_path;
		};
	}

	/**
	 * This the path to the modules. Don't forget the trailing slash.
	 *
	 * @public
	 */
	define.module_path = '/modules/';

	/**
	 * This define function abides by the Asynchronous Module Definition specification.
	 *
	 * @public
	 */
	define.amd = {};

}(define, document));
