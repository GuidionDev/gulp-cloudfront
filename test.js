import cloundfront from './index';
import toolFactory from './tool';
import should from 'should';
import gulp from 'gulp';
import es from 'event-stream';
import { readFileSync } from 'fs';
import util from 'util';
import Stream from 'stream';
import assert from 'assert';
import { join } from 'path';
import { File } from 'gulp-util';
import glob from 'glob';
import { mock } from 'sinon';

import 'mocha';

describe('gulp-cloudfront', function () {

  var stream;
  var writeFile = function(globPath) {
    //write all files to stream
    glob(globPath + '/**/*.*', {}, function (er, fileNames) {
      fileNames.forEach(function (fileName) {
        stream.write(new File({
          path: join(__dirname, fileName),
          contents: readFileSync(fileName),
          base: join(__dirname, globPath)
        }));
      });

      stream.end();
    });
  };

  it('should identify default index pattern', function(done) {

    var dirRoot = 'test/fixtures/config1';
    var callback = mock().withArgs('/index.abcd1234.html').once().returns({
      then: function (success, error) {
        success();
      }
    });

    var tool = {
      updateDefaultRootObject: callback
    };

    stream = cloundfront({
      tool: tool
    });
    stream.on('data', function (file) {});
    stream.on('end', function () {
      callback.verify();
      done();
    });

    writeFile(dirRoot);

  });


  it('should identify default index pattern gzipped', function(done) {

    var dirRoot = 'test/fixtures/gzip';
    var callback = mock().withArgs('/index.abcd1234.html').once().returns({
      then: function (success, error) {
        success();
      }
    });

    var tool = {
      updateDefaultRootObject: callback
    };

    stream = cloundfront({
      tool: tool
    });
    stream.on('data', function (file) {});
    stream.on('end', function () {
      callback.verify();
      done();
    });

    writeFile(dirRoot);

  });

  it('should identify custom pattern', function(done) {

    var dirRoot = 'test/fixtures/config1';
    var callback = mock().withArgs('/custom.a1b2.html').once().returns({
      then: function (success, error) {
        success();
      }
    });

    var tool = {
      updateDefaultRootObject: callback
    };

    stream = cloundfront({
      patternIndex: /^\/custom\.[a-f0-9]{4}\.html$/gi,
      tool: tool
    });
    stream.on('data', function (file) {});
    stream.on('end', function () {
      callback.verify();
      done();
    });

    writeFile(dirRoot);
  });


});
