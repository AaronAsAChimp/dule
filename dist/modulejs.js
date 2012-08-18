/*! modulejs - v0.0.1 - 2012-08-18
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
		resolve = local_define.loader,
		id_parts, depend, depend_id;

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

		id_parts = id.split('!');

		if (id_parts[0].length === 0) {
			resolve = id_parts[0];

			if (id_parts.length !== 1) {
				id = id_parts[1];
			}
		}

		// redefine resolve to be the instance of the loader
		resolve = new local_define.loaders[resolve]();
		
		// make the id absolute
		id = resolve.resolve(local_define.module_path, id);

		if (!(id in local_define._modules)) {
			// this is a source module-- it was included directly
			//   and not through the module resolution process.

			local_define._modules[id] = new local_define.Module(id);
		}

		// quick loop to resolve depencency names
		for (depend in dependencies) {
			dependencies[depend] = resolve.resolve(local_define.module_path, dependencies[depend]);
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
			}

			if (!(depend_id in local_define._modules)) {
				// if there are no circular dependencies create the module for this dependency
				//   its dependencies will be added when its module load.s
				local_define._modules[depend_id] = new local_define.Module(depend_id);

				// include it
				resolve.load(depend_id);
			}

			// then let it know what depends on it
			local_define._modules[depend_id].dependency_of(local_define._modules[id]);

		}
	}
}

// Extend define with the necessary goodies
(function (define) {
	'use strict';

	define.Module = function (id) {
		this._id = id;
		this._dependency_of = [];
		this._loaded_depends = {};
		this._is_factory_called = false;

		// this stuff can't be determined until the dependencies are set
		this._depends = null;
		this._left = 1 / 0; // Infinity, seems like this optimization should be in uglify. It is! https://github.com/mishoo/UglifyJS/pull/340

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

		// if the dependency is preloaded tell the new module so.
		// at this point backtrack should've already ran.
		if (this.is_loaded()) {
			module.dependency_loaded(this._id, this._factory);
		}
	};

	module_prototype.is_loaded = function () {
		return this._left === 0;
	};

	module_prototype.backtrack = function () {

		// the module factory should be prepared regardless of it being a
		// dependency of another module. Define may be simply be used as a
		// function closure.
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

	define.loaders = {};

	define._modules = {};

	/**
	 * Utility functions
	 *
	 * @private
	 */
	define._util = {
		isArray: function (test_array) {
			// this is not a 100% test.
			//   It will not handle arrays created in separate windows.
			//   It will not handle Array.prototype which is technically an array, although no one cares.
			return test_array instanceof Array;
		}
	};

	// Non-essential code, this will be removed when using UglifyJS
	// $ uglify --define NON_ESSENTIAL=true

	if (typeof NON_ESSENTIAL === 'undefined') {

		// not necessary if minified
		define._util.error = function (message) {
			return 'ModuleJS: ERROR: ' + message;
		};

		// not necessary if minified
		define._util.warn = function (message) {
			return 'ModuleJS: WARNING: ' + message;
		};

		define._util.save = function () {
			return {
				_util: {},
				_modules: {
					'loader/path': define._modules['loader/path']
				},
				module_path: define.module_path,
				loader: define.loader
			};
		};

		// this function is useful only for running tests and is not helpful,
		// and potentially damaging, in production code.
		define._util.reset = function (state) {
			var module_tags = document.getElementsByName('modulejs-module'),
				tag;

			define._modules = {
				'loader/path': define._modules['loader/path']
			};

			define.module_path = state.module_path;
			define.loader = state.loader;

			for (tag = module_tags.length - 1; tag >= 0; tag--) {
				module_tags[tag].parentNode.removeChild(module_tags[tag]);
			}
		};
	}

	/**
	 * This the path to the modules. Don't forget the trailing slash.
	 *
	 * @public
	 */
	define.module_path = '/modules/';

	/**
	 * This is the default loader, set it to your preferred loader
	 *
	 * @public
	 */
	define.loader = 'nop';

	/**
	 * This define function abides by the Asynchronous Module Definition specification.
	 *
	 * @public
	 */
	define.amd = {};

	/**
	 * @class A Loader that doesn't do any thing. Set this as your default
	 * loader if you wish to load modules through an external source. Such as
	 * HTML script tags.
	 */
	define.loaders.nop = function () {};

	define.loaders.nop.prototype.load = function (id) {
		if (typeof NON_ESSENTIAL === 'undefined') {
			console.warn(define._util.warn(
				'A module (' + id + ') has been asked to load with the NOP' +
				' loader.\n\nThe NOP loader assumes that module has been loaded' +
				' through some other mechanism. To remove this warning, double' +
				' check that you have included all your dependencies and then' +
				' reorder them so that a dependencies are not required before' +
				' they are loaded.'));
		}
	};

	define.loaders.nop.prototype.resolve = function (root, id) {
		return id;
	};

}(define));

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

	var path_proto = define.loaders.path;

	/**
	 * Load a module for the given id. This is done by creating a script tag and
	 * inserting it into the DOM. Implement this method to override how modules
	 * are loaded.
	 *
	 * @param  {String} id A module id that has been resolved to its absolute path.
	 */
	path_proto.prototype.load = function (id) {
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
	path_proto.prototype.resolve = function (root, relative) {
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