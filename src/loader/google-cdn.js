//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js

/*global define */

define('loader/google-cdn', function () {
	'use strict';

	/**
	 * @class Loader plugin for loading modules from Google's CDN. There are not
	 * currently any modules in the CDN that use vanilla AMD.
	 *
	 * Consider this module non-functional for now.
	 */
	define.loaders['google-cdn'] = function () {

	};

	var module_path = '//ajax.googleapis.com/ajax/libs/',
		Path = define.loaders.path,
		Gcdn = define.loaders['google-cdn'];

	// extend path loader
	Gcdn.prototype = new Path();

	/**
	 * Resolve a relative id to an absolute one. In the simplest situation
	 * this method just concatenates the relative onto the absolute one.
	 * Implement this method to override how modules are resolved.
	 *
	 * @param  {String} root     Not used.
	 * @param  {String} relative The relative id that should be resolved.
	 * @return {String}
	 */
	Gcdn.prototype.resolve = function (root, relative) {
		return Path.prototype.resolve(module_path, relative);
	};
});