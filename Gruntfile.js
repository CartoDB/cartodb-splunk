module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        "Gruntfile.js",
        "appserver/static/cartodb/**/*.js",
        "test/integration/web/**/*.js",
        "bin/**/*.js"
      ],
      options: {
        jshintrc: ".jshintrc"
      }
    },
    inlinelint: {
      html: ["default/data/ui/html/**/*.html"]
    },
    casper : {
      options: {
        test: true,
        includes: "test/integration/web/include.js",
        post: "test/integration/web/post.js",
        pre:"test/integration/web/pre.js",
        parallel : false
      },
      test : {
        src: ['test/integration/web/*_test.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false,
          captureFile: 'results.txt', // Optionally capture the reporter output to a file
        },
        src: ['test/integration/search/**/*.js']
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lint-inline');
  grunt.loadNpmTasks('grunt-casper');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', ['jshint','inlinelint']);
  grunt.registerTask('default', ['test']);
};
