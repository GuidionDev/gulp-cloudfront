import { readFileSync } from 'fs';
import { join } from 'path';
import glob from 'glob';
import File from 'vinyl';
import log from 'fancy-log';

import cloundfront from '../src/index';
import cloudfrontToolFactory from '../src/cloudfront-tool';
import { CloudfrontTool, CloudfrontToolConfig } from '../src/interface';

jest.mock('../src/cloudfront-tool');
jest.mock('fancy-log');

describe('gulp-cloudfront', function () {
  let stream;

  const writeFile = function(globPath) {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should identify default index pattern', function(done) {
    const mockUpdateDefaultRootObject = jest.fn().mockResolvedValue(undefined);
    (cloudfrontToolFactory as jest.Mock).mockImplementation(() => ({
      updateDefaultRootObject: mockUpdateDefaultRootObject,
    }));
    const dirRoot = '__tests__/fixtures/config1';

    const config: CloudfrontToolConfig = {
      key: 'key',
      secret: 'secret',
      distributionId: 'distributionId'
    };

    stream = cloundfront(config);
    stream.on('data', function (file) {
      // none
    });
    stream.on('end', function () {
      expect(mockUpdateDefaultRootObject).toBeCalledWith('/index.abcd1234.html');
      done();
    });

    writeFile(dirRoot);
  });

  it('should identify default index pattern when gzipped', function(done) {
    const dirRoot = '__tests__/fixtures/gzip';

    const updateDefaultRootObject = jest.fn().mockResolvedValue(undefined);

    const tool: CloudfrontTool = {
      updateDefaultRootObject
    };
    const config: CloudfrontToolConfig = {
      tool,
      key: 'key',
      secret: 'secret',
      distributionId: 'distributionId'
    };

    stream = cloundfront(config);
    stream.on('data', function (file) {
      // none
    });
    stream.on('end', function () {
      expect(updateDefaultRootObject).toBeCalledWith('/index.abcd1234.html');
      done();
    });

    writeFile(dirRoot);
  });

  it('should identify custom pattern', function(done) {
    const dirRoot = '__tests__/fixtures/config1';

    const updateDefaultRootObject = jest.fn().mockResolvedValue(undefined);

    const tool: CloudfrontTool = {
      updateDefaultRootObject
    };
    const config: CloudfrontToolConfig = {
      tool,
      patternIndex: /^\/custom\.[a-f0-9]{4}\.html$/gi,
      key: 'key',
      secret: 'secret',
      distributionId: 'distributionId'
    };

    stream = cloundfront(config);
    stream.on('data', function (file) {
      // none
    });
    stream.on('end', function () {
      expect(updateDefaultRootObject).toBeCalledWith('/custom.a1b2.html');
      done();
    });

    writeFile(dirRoot);
  });

  it('should log error when failed', function(done) {
    const mockUpdateDefaultRootObject = jest.fn().mockRejectedValue(new Error('cannot update'));
    (cloudfrontToolFactory as jest.Mock).mockImplementation(() => ({
      updateDefaultRootObject: mockUpdateDefaultRootObject,
    }));
    const dirRoot = '__tests__/fixtures/config1';

    const config: CloudfrontToolConfig = {
      key: 'key',
      secret: 'secret',
      distributionId: 'distributionId'
    };

    stream = cloundfront(config);
    stream.on('data', function (file) {
      // none
    });
    stream.on('end', function () {
      expect(log).toBeCalledWith(expect.any(Error));
      done();
    });

    writeFile(dirRoot);
  });
});
