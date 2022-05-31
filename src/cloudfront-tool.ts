import AWS from 'aws-sdk';
import log from 'fancy-log';

import { CloudfrontTool, CloudfrontToolConfig } from './interface';


const tool: (options: CloudfrontToolConfig) => CloudfrontTool = (options) => {
  const cloudfront = new AWS.CloudFront({
    accessKeyId: options.key,
    secretAccessKey: options.secret,
    sessionToken: options.sessionToken,
  });

  const updateDefaultRootObject = (defaultRootObject: string) => {
    return new Promise((resolve, reject) => {
      cloudfront.getDistribution({ Id: options.distributionId }, function(err, data) {
        if (err) {
          reject(err);
          return;
        } else {
          const DistributionConfig = data.Distribution.DistributionConfig;

          const defaultRootObjectNoSlash = defaultRootObject.substring(1);

          if (DistributionConfig.DefaultRootObject === defaultRootObjectNoSlash) {
            log('gulp-cloudfront:', "DefaultRootObject hasn't changed, not updating.");
            return resolve(undefined);
          }

          DistributionConfig.DefaultRootObject = defaultRootObjectNoSlash;

          cloudfront.updateDistribution({
            IfMatch: data.ETag,
            Id: options.distributionId,
            DistributionConfig: DistributionConfig,
          }, (err) => {
            if (err) {
              reject(err);
            } else {
              log('gulp-cloudfront:', 'DefaultRootObject updated to [' + defaultRootObjectNoSlash + '].');
              resolve(undefined);
            }
          });
        }
      });
    });
  };

  return {
    updateDefaultRootObject,
  };
};

export default tool;
