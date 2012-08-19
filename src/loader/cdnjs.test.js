//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js

/*global define */

define('loader/cdnjs', function () {
	'use strict';

	/**
	 * @class Loader plugin for loading modules from Google's CDN. There are not
	 * currently any modules in the CDN that use vanilla AMD.
	 *
	 * Consider this module non-functional for now.
	 */
	define.loaders['cdnjs'] = function () {

	};

	var module_path = '//cdnjs.cloudflare.com/ajax/libs/',
		Path = define.loaders.path,
		Cdnjs = define.loaders['google-cdn'];

	// extend path loader
	Cdnjs.prototype = new Path();

	/**
	 * Resolve a relative id to an absolute one. In the simplest situation
	 * this method just concatenates the relative onto the absolute one.
	 * Implement this method to override how modules are resolved.
	 *
	 * @param  {String} root     Not used.
	 * @param  {String} relative The relative id that should be resolved.
	 * @return {String}
	 */
	Cdnjs.prototype.resolve = function (root, relative) {
		return Path.prototype.resolve(module_path, relative);
	};
});