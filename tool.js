var gutil = require('gulp-util');
var AWS = require('aws-sdk');

module.exports = function(options) {
  var cloudfront = new AWS.CloudFront({
    accessKeyId: options.key,
    secretAccessKey: options.secret,
    sessionToken: options.sessionToken,
  });

  var updateDefaultRootObject = function (defaultRootObject) {
    return new Promise((resolve, reject) => {
      // Get the existing distribution id
      cloudfront.getDistribution({ Id: options.distributionId }, function(err, data) {
        if (err) {
          reject(err);
        } else {
          if (data.DistributionConfig.DefaultRootObject === defaultRootObject.substr(1)) {
            gutil.log('gulp-cloudfront:', "DefaultRootObject hasn't changed, not updating.");
            return resolve();
          }

          // Update the distribution with the new default root object (trim the precedeing slash)
          data.DistributionConfig.DefaultRootObject = defaultRootObject.substr(1);

          cloudfront.updateDistribution({
            IfMatch: data.ETag,
            Id: options.distributionId,
            DistributionConfig: data.DistributionConfig
          }, function(err, data) {
            if (err) {
              reject(err);
            } else {
              gutil.log('gulp-cloudfront:', 'DefaultRootObject updated to [' + defaultRootObject.substr(1) + '].');
              resolve();
            }
          });
        }
      });
    });
  };

  return {
    updateDefaultRootObject: updateDefaultRootObject
  };

};
