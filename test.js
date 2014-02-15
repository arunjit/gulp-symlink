/* jshint node: true */
/* jshint expr: true */
/* global describe, it, before, after */

'use strict';

var expect = require('chai').expect,
  gutil = require('gulp-util'),
  symlink = require('./index'),
  path = require('path'),
  fs = require('fs');

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
    var cleanup;
    var fileName = 'somefile.js';

    function newFile() {
      return new gutil.File({
        path: path.join(process.cwd(), path.join('testdata', 'somefile.js'))
      });
    }

    before(function() {
      cleanup = null;
    });

    it('should create symlinks', function(cb) {
      var testSym = path.join(testDir, fileName);
      cleanup = function() {
        fs.unlinkSync(testSym);
        console.log(testSym, 'unlinked');
      };
      console.log('creating', testSym);

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
      cleanup = function() {
        fs.unlinkSync(testSym);
        console.log(testSym, 'unlinked');
        fs.rmdirSync(nestedDir);
        console.log(nestedDir, 'rmdir');
      };
      console.log('creating', testSym, 'in', nestedDir);

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
      cleanup = function() {
        fs.unlinkSync(testSym);
        console.log(testSym, 'unlinked');
        fs.rmdirSync(nestedDir);
        console.log(nestedDir, 'rmdir');
      };
      console.log('creating', testSym, 'in', nestedDir);

      var stream = symlink(testDir, {createDirs: true});

      stream.on('data', function() {
        expect(fs.existsSync(testSym)).to.be.true;
        expect(fs.lstatSync(testSym).isSymbolicLink()).to.be.true;
        cb();
      });

      stream.write(newFile());
    });

    after(function() {
      (cleanup && cleanup()) || console.log('no cleanup');
      fs.rmdirSync(testDir);
    });
  }

  describe('using relative path', function() {
    test('test');
  });

  describe('using full path', function() {
    test(__dirname + '/test');
  });
});
