/* jshint node: true */
/* jshint expr: true */
/* global describe, it, after */

'use strict';

var expect = require('chai').expect,
  gutil = require('gulp-util'),
  symlink = require('./index'),
  path = require('path'),
  fs = require('fs.extra');

// silence the log, maybe there's a better way?
gutil.log = function() {};

describe('gulp-symlink', function() {

  it('should throw if no directory was specified', function() {
    try {
      symlink();
    } catch (e) {
      expect(e.toString()).to.contain.string('A destination folder is required.');
    }
  });

  function test(testDir) {
    var fileName = 'somefile.js';

    function newFile() {
      return new gutil.File({
        path: path.join(process.cwd(), path.join('testdata', 'somefile.js'))
      });
    }

    it('should create symlinks', function(cb) {
      var testSym = path.join(testDir, fileName);

      var stream = symlink(testDir);

      stream.on('data', function() {
        expect(fs.existsSync(testSym)).to.be.true;
        expect(fs.lstatSync(testSym).isSymbolicLink()).to.be.true;
        cb();
      });

      stream.write(newFile());
    });

    it('should create symlinks with nested directories', function(cb) {
      var nestedDir = path.join(testDir, 'sub');
      var testSym = path.join(nestedDir, fileName);

      var stream = symlink(nestedDir);

      stream.on('data', function() {
        expect(fs.existsSync(testSym)).to.be.true;
        expect(fs.lstatSync(testSym).isSymbolicLink()).to.be.true;
        cb();
      });

      stream.write(newFile());
    });

    it('should create directories for nested symlinks', function(cb) {
      var nestedDir = path.join(testDir, 'testdata');
      var testSym = path.join(nestedDir, fileName);

      var stream = symlink(testDir, {createDirs: true});

      stream.on('data', function() {
        expect(fs.existsSync(testSym)).to.be.true;
        expect(fs.lstatSync(testSym).isSymbolicLink()).to.be.true;
        cb();
      });

      stream.write(newFile());
    });

    after(function() {
      fs.rmrfSync(testDir);
    });
  }

  describe('using relative path', function() {
    test('test');
  });

  describe('using full path', function() {
    test(__dirname + '/test');
  });
});
