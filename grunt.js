/*global module:false*/
module.exports = function (grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= pkg.license %> */'
		},
		lint: {
			files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
		qunit: {
			files: ['index.html']
		},
		concat: {
			dist: {
				src: ['<banner:meta.banner>', '<file_strip_banner:src/module.js>', 'src/loader/path.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint qunit'
		},
		server: {
			port: 8080,
			base: '.'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				trailing: true,
				strict: true,
				smarttabs: true,
				white: true,
				onevar: true,
				devel: true,
				indent: 4
			},
			globals: {}
		},
		uglify: {
			mangle: {
				defines: {
					NON_ESSENTIAL: ['name', 'false']
				}
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'server lint qunit concat min');

};
