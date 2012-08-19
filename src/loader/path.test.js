/*global QUnit, define */
(function () {
	'use strict';

	QUnit.module('define.loader.path', {
		setup: function () {
			// mocks
			this.define_state = define._util.save();
			define.loader = 'nop';
		},
		teardown: function () {
			define._util.reset(this.define_state);
		}
	});

	QUnit.test('define.loaders.path can resolve relative paths.', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', 'cool_stuff.js');

			is.equal(path, '/base/stuff/modules/cool_stuff.js', 'was the path resolved correctly?');
		});
	});

	QUnit.test('define.Resolve.path can resolve relative paths with folders.', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', 'hasenpfeffer/cool_stuff.js');

			is.equal(path, '/base/stuff/modules/hasenpfeffer/cool_stuff.js', 'was the path resolved correctly?');
		});
	});


	QUnit.test('define.Resolve.path can resolve relative paths with "../" .', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', '../../cool_stuff.js');

			is.equal(path, '/base/cool_stuff.js', 'was the path resolved correctly?');
		});
	});

	QUnit.test('define.Resolve.path can resolve relative paths with "./" .', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', '././cool_stuff.js');

			is.equal(path, '/base/stuff/modules/cool_stuff.js', 'was the path resolved correctly?');
		});

	});

	QUnit.test('define.Resolve.path can resolve relative paths with a mixture of parts.', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', './../scrabble/cool_stuff.js');

			is.equal(path, '/base/stuff/scrabble/cool_stuff.js', 'was the path resolved correctly?');
		});

	});


	QUnit.test('define.Resolve.path can resolve semi-relative paths that start with "//".', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', '//cdn.example.com/scrabble/cool_stuff.js');

			is.equal(path, '//cdn.example.com/scrabble/cool_stuff.js', 'was the path resolved correctly?');
		});

	});

	QUnit.test('define.Resolve.path can resolve semi-relative paths that start with "/".', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', '/scrabble/cool_stuff.js');

			is.equal(path, '/scrabble/cool_stuff.js', 'was the path resolved correctly?');
		});

	});

	QUnit.test('define.Resolve.path can resolve absolute paths that start with "http://".', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', 'http://cdn.example.com/scrabble/cool_stuff.js');

			is.equal(path, 'http://cdn.example.com/scrabble/cool_stuff.js', 'was the path resolved correctly?');
		});

	});


	QUnit.test('define.Resolve.path can resolve absolute paths that start with "https://".', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				path = loader.resolve('/base/stuff/modules/', 'https://cdn.example.com/scrabble/cool_stuff.js');

			is.equal(path, 'https://cdn.example.com/scrabble/cool_stuff.js', 'was the path resolved correctly?');
		});

	});

	/*QUnit.test('define._util.require can include scripts relative to the module path.', function (is) {

		QUnit.stop(1);
		define('test', ['loader/path'], function () {
			QUnit.start();

			var loader = new define.loaders.path(),
				script;
				
			loader.load('null');

			script = document.getElementById('module-null');

			is.equal(script.tagName, 'SCRIPT', 'was the correct tag created?');
			is.ok(/.*\/null\.js/.test(script.src), 'was the path resolved correctly?');
		});
	});*/

	QUnit.module('Dule Path loader integration tests', {
		setup: function () {
			this.define_state = define._util.save();

			define.module_path = './test/modules/';
		},
		teardown: function () {
			define._util.reset(this.define_state);
		}
	});

	QUnit.test('Dule can load and execute modules over a network connection (or from a file-system).', function (is) {
		QUnit.stop(1);

		define('test-module', ['dependent-module-a'], function (dependent_module) {
			QUnit.start();

			dependent_module.verify_property_string(is);
			dependent_module.verify_property_number(is);
			dependent_module.verify_method(is);
			dependent_module.verify_subobject(is);
		});
	});

}());