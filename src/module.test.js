/*global QUnit, define */

(function () {
	'use strict';

	QUnit.module('Dule define()', {
		setup: function () {
			// mocks
			this.define_state = define._util.save();
			define.loader = 'nop';
		},
		teardown: function () {
			define._util.reset(this.define_state);
		}
	});

	QUnit.test('define("module", [], {}) can be called without error.', function (is) {
		QUnit.expect(0);

		define('module', [], {});
	});

	QUnit.test('define("module", {}) can be called without error.', function (is) {
		QUnit.expect(0);

		define('module', {});
	});

	QUnit.test('define([], {}) can\'t be called without error.', function (assert) {
		QUnit.expect(1);

		assert.throws(function () {
			define([], {});
		}, /\bid\b/i, 'are ids required?');
	});

	QUnit.test('define({}) can\'t be called without error.', function (assert) {
		QUnit.expect(1);

		assert.throws(function () {
			define({});
		}, /\bid\b/i, 'are ids required?');
	});

	QUnit.test('define() can detect circular references.', function (is) {
		QUnit.expect(3);

		// mock console.warn to get spy on whats happening
		var native_warn = console.warn;

		console.warn = function () {
			is.ok(true, 'was a warning given?');
		};

		is.throws(function () {
			define('module-a', ['module-b'], function (b) {

			});

			define('module-b', ['module-c'], function (c) {

			});

			define('module-c', ['module-a'], function (a) {

			});
		}, /circular/i, 'has an exception been thrown?');

		console.warn = native_warn;
	});

	/**
	 * Graph:
	 *
	 * C
	 * |
	 * |
	 * B
	 * |
	 * |
	 * A
	 *
	 * Load Order:
	 *
	 * C, B, A
	 */

	QUnit.test('define() doesn\'t detect circular references when are none.', function (is) {
		QUnit.expect(2);

		define('module-c', [], function () {
			return function () {
				is.ok(false, 'this function should never be called');
			};
		});

		define('module-b', ['module-c'], function (c) {
			is.equal(typeof c, 'function', 'was the proper value returned?');

			return {
				module: 'b'
			};
		});

		define('module-a', ['module-b'], function (b) {
			is.equal(b.module, 'b', 'was the correct module returned?');

			return {
				module: 'a'
			};
		});

	});

	/**
	 * Graph:
	 *
	 *    D
	 *   / \
	 *  /   \
	 * B     C
	 *  \   /
	 *   \ /
	 *    A
	 *
	 * Load Order:
	 *
	 * D, B, A, C
	 */
	
	QUnit.test('define() can load modules after the initial setup.', function (is) {
		QUnit.expect(4);

		// mock console.warn to get spy on whats happening
		var native_warn = console.warn;

		console.warn = function () {
			is.ok(true, 'was a warning given?');
		};

		define('module-d', [], function () {
			return function () {
				is.ok(false, 'this function should never be called');
			};
		});

		define('module-b', ['module-d'], function (d) {
			is.equal(typeof d, 'function', 'was the proper value returned?');

			return {
				module: 'b'
			};
		});

		define('module-a', ['module-b', 'module-c'], function (b) {
			is.equal(b.module, 'b', 'was the correct module returned?');

			return {
				module: 'a'
			};
		});

		define('module-c', ['module-d'], function (d) {
			is.equal(typeof d, 'function', 'was the proper value returned?');

			return {
				module: 'b'
			};
		});

		console.warn = native_warn;

	});

	QUnit.module('Dule define._util', {
		setup: function () {
			this.define_state = define._util.save();

			define.module_path = '/test/modules/';
		},
		teardown: function () {
			define._util.reset(this.define_state);
		}
	});

	QUnit.test('define._util.isArray can determine if an object is an array.', function (is) {

		// these are actual arrays
		is.ok(define._util.isArray([]), 'is [] an array?');
		is.ok(define._util.isArray(new Array(10)), 'is new Array() an array?');

		// other non-array objects
		is.ok(!define._util.isArray({}), 'is {} not an array?');
		is.ok(!define._util.isArray(42), 'is 42 not an array?');
		is.ok(!define._util.isArray(false), 'is false not an array?');
		is.ok(!define._util.isArray('shark'), 'is "shark" not an array?');
		is.ok(!define._util.isArray(function () {}), 'is function () {} not an array?');

		// array-like objects should not be arrays
		is.ok(!define._util.isArray(document.getElementsByTagName('body')), 'is document.getElementsByTagName("body") not an array?');
		is.ok(!define._util.isArray(arguments), 'is arguments not an array?');

	});

	QUnit.module('Dule define.Module');

	QUnit.test('Module can track when its dependencies are completely loaded.', function (is) {
		var module = new define.Module('franken-module', {});

		module.depends_on(['lightning', 'people-parts', 'dr-frankenstein']);

		is.ok(!module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		module.dependency_loaded();

		is.ok(!module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		module.dependency_loaded();

		is.ok(!module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		module.dependency_loaded();

		is.ok(module.is_loaded(), 'the module\'s dependencies should be completely loaded.');
	});

	/**
	 * Graph:
	 *
	 * Ic   Co
	 *  \   /
	 *   \ /
	 *   Icc
	 *
	 * Load Order:
	 *
	 * Ic, Co, Icc
	 */

	QUnit.test('Module can track when its dependencies are completely loaded when it has leaf dependencies.', function (is) {
		var ice_cream = new define.Module('ice-cream', {}),
			cone = new define.Module('cone', {}),
			ice_cream_cone = new define.Module('ice-cream-cone-module', {});

		ice_cream.dependency_of(ice_cream_cone);
		cone.dependency_of(ice_cream_cone);

		ice_cream_cone.depends_on(['ice-cream', 'cone']);
		ice_cream.depends_on([]);
		cone.depends_on([]);

		is.ok(ice_cream_cone.is_loaded(), 'the module\'s dependencies should be completely loaded.');

	});


	/**
	 * Graph:
	 *
	 *    Mo   Fa  Ft
	 * Cl  \   |   /  Sl
	 *  \   \  |  /   /
	 *   \   \ | /   /
	 *   Li   DrF---Pe
	 *     \   |   /
	 *      \  |  /
	 *        FrM
	 *
	 * Load Order:
	 *
	 * Cl, Li, Sl, Mo, Fa, Ft, DrF, Pe, FrM
	 */

	QUnit.test('Module can let the modules that depend on it know that its completely loaded.', function (is) {
		var lightening = new define.Module('lightening', {}),
			people_parts = new define.Module('people-parts', {}),
			dr_frankenstein = new define.Module('dr-frankenstein', {}),
			fraken_module = new define.Module('franken-module', {});

		lightening.dependency_of(fraken_module);
		people_parts.dependency_of(fraken_module);
		dr_frankenstein.dependency_of(fraken_module);
		dr_frankenstein.dependency_of(people_parts);

		fraken_module.depends_on(['lightening', 'people-parts', 'dr-frankenstein']);
		lightening.depends_on(['clouds']);
		people_parts.depends_on(['shovel', 'dr-frankenstein']);
		dr_frankenstein.depends_on(['mother', 'father', 'too-much-free-time']);

		is.ok(!fraken_module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		// load clouds
		lightening.dependency_loaded();

		is.ok(!fraken_module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		// load shovel
		people_parts.dependency_loaded();

		is.ok(!fraken_module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		// load mother
		dr_frankenstein.dependency_loaded();

		is.ok(!fraken_module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		// load father
		dr_frankenstein.dependency_loaded();

		is.ok(!fraken_module.is_loaded(), 'the module\'s dependencies should not be loaded yet.');

		// load too-much-free-time
		dr_frankenstein.dependency_loaded();

		is.ok(fraken_module.is_loaded(), 'the module\'s dependencies should be completely loaded.');
	});

}());