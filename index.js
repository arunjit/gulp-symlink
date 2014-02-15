/* jshint node:true */

'use strict';

var map = require('map-stream'),
  path = require('path'),
  gutil = require('gulp-util'),
  mkdirp = require('mkdirp'),
  fs = require('fs');

var NAME = 'gulp-symlink';

function newError(msg) {
  return new gutil.PluginError(NAME, msg);
}

function localPath(absolutePath) {
  var cwd = process.cwd();
  return absolutePath.indexOf(cwd) === 0
      ? absolutePath.substr(cwd.length + 1)
      : absolutePath;
}

var M = gutil.colors.magenta;

module.exports = function(out, options) {
  if (!out) {
    throw newError('A destination folder is required.');
  }

  options = options || {};

  // resolve and normalize output path.
  var dest = path.resolve(process.cwd(), out);

  return map(function(file, cb) {
    var fileName = path.basename(file.path);
    var relativeSym = options.createDirs ? localPath(file.path) : fileName;
    var sym = path.join(path.resolve(file.base, dest), relativeSym);

    gutil.log(NAME, M(localPath(sym)), '->', M(localPath(file.path)));

    function createDirsThenLink(err) {
      if (err && err.code === 'ENOENT') {
        return mkdirp(path.dirname(sym), createLink);
      }
      finish(err);
    }

    function createLink(err) {
      if (err) {
        return cb(newError(err));
      }
      fs.symlink(file.path, sym, finish);
    }

    function finish(err) {
      if (err && err.code !== 'EEXIST') {
        return cb(newError(err));
      }
      cb(null, file);
    }

    fs.symlink(file.path, sym, createDirsThenLink);
  });
};
