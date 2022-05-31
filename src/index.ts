import gutil from 'gulp-util';
import through from 'through2';

import { CloudfrontToolConfig } from './interface';
import cloundfrontToolFactory from './cloudfront-tool';

const handler = (options: CloudfrontToolConfig) => {
  options.patternIndex = options.patternIndex || /^\/index\.[a-f0-9]{8}\.html(\.gz)*$/gi;
  const tool = options.tool || cloundfrontToolFactory(options);
  let first = true;

  return through.obj((file, enc, callback) => {
    if (first) {
      options.dirRoot = options.dirRoot || file.base.replace(/\/$/, '');
      gutil.log('gulp-cloudfront:', 'Root directory [', options.dirRoot, ']');
      first = !first;
    }

    // Update the default root object once we've found the index.html file
    let filename = file.path.substr(options.dirRoot.length);

    if (filename.match(options.patternIndex)) {
      gutil.log('gulp-cloudfront:', 'Identified index [', filename, ']');

      // Trim the '.gz' if gzipped
      if (filename.substr(filename.length - 3) === '.gz') {
        filename = filename.substr(0, filename.length - 3);
      }

      tool.updateDefaultRootObject(filename)
        .then(() => {
          return callback(null, file);
        }, (err) => {
          gutil.log(new gutil.PluginError('gulp-cloudfront', err));
          callback(null, file);
        });
    } else {
      return callback(null, file);
    }
  });
};

export default handler;
