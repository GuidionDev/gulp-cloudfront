import gutil from 'gulp-util';
import AWS from 'aws-sdk';

import cloudfrontToolFactory from '../src/cloudfront-tool';

jest.mock('aws-sdk');
jest.mock('gulp-util');

describe('cloudfront-tool', () => {
  let mockCloudfront: any;
  let mockData: AWS.CloudFront.GetDistributionResult;

  beforeEach(() => {
    mockData = {
      Distribution: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        DistributionConfig: {
          DefaultRootObject: 'index-old.html',
        },
      },
      ETag: 'ifMatch',
    };
    mockCloudfront = {
      getDistribution: jest.fn((
        params,
        callback: (error?: AWS.AWSError, data?: AWS.CloudFront.GetDistributionResult) => void) => {

        callback(null, mockData);
      }),
      updateDistribution: jest.fn((
        request: AWS.CloudFront.UpdateDistributionRequest,
        callback: (error?: AWS.AWSError, data?: AWS.CloudFront.GetDistributionResult) => void) => {
        callback();
      }),
    };
    (AWS.CloudFront as unknown as jest.Mock).mockImplementation(() => mockCloudfront);

  });

  it('updates distribution', async () => {
    const tool = cloudfrontToolFactory({
      key: 'key',
      secret: 'secret',
      sessionToken: 'session',
      distributionId: 'distributionId-123'
    });

    await tool.updateDefaultRootObject('/index-123.html');

    expect(AWS.CloudFront).toBeCalledWith({
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      sessionToken: 'session',
    });

    expect(mockCloudfront.getDistribution).toBeCalledWith({ Id: 'distributionId-123' }, expect.any(Function));
    expect(mockCloudfront.updateDistribution).toBeCalledWith({
      Id: 'distributionId-123',
      IfMatch: 'ifMatch',
      DistributionConfig: {
        DefaultRootObject: 'index-123.html',
      },
    }, expect.any(Function));
  });

  it('does not update distribution if default object is the same', async () => {

    mockData.Distribution.DistributionConfig.DefaultRootObject = 'index-123.html';

    const tool = cloudfrontToolFactory({
      key: 'key',
      secret: 'secret',
      sessionToken: 'session',
      distributionId: 'distributionId-123'
    });

    await tool.updateDefaultRootObject('/index-123.html');

    expect(gutil.log).toBeCalledWith('gulp-cloudfront:', "DefaultRootObject hasn't changed, not updating.");
    expect(mockCloudfront.updateDistribution).not.toBeCalled();
  });

  it('rejects if getDistribution fails', async () => {
    (mockCloudfront.getDistribution as jest.Mock).mockImplementation((_, callback) => {
      callback(new Error('GET FAILED'));
    });

    const tool = cloudfrontToolFactory({
      key: 'key',
      secret: 'secret',
      sessionToken: 'session',
      distributionId: 'distributionId-123'
    });

    expect(() => tool.updateDefaultRootObject('/index-123.html')).rejects.toThrowError();
  });

  it('rejects if updateDistribution fails', async () => {
    (mockCloudfront.updateDistribution as jest.Mock).mockImplementation((_, callback) => {
      callback(new Error('UPDATE FAILED'));
    });

    const tool = cloudfrontToolFactory({
      key: 'key',
      secret: 'secret',
      sessionToken: 'session',
      distributionId: 'distributionId-123'
    });

    expect(() => tool.updateDefaultRootObject('/index-123.html')).rejects.toThrowError();
  });
});
