import fs from 'fs-extra';
import path from 'path-extra';
import * as hindiUlbHelpers from "../helpers/hindiUlbHelpers";

describe('ParseUGNT', function() {
  const tempFilePath = './__tests__/output/hi-ulb-sources';

  afterEach(() => {
    if (tempFilePath) {
      fs.removeSync(tempFilePath);
    }
  });

  it('should output ULB chapter files', () => {
    return new Promise((resolve) => {
      const version = 'v0.0';
      const resourceinputpath = path.join('__tests__','fixtures','bible', 'hi_aligned');

      const UGNTOutputPath = path.join('__tests__', 'output', 'hi-ulb-sources', version);
      fs.removeSync(UGNTOutputPath);
      fs.ensureDir(UGNTOutputPath);
      fs.copySync(resourceinputpath, UGNTOutputPath);

      hindiUlbHelpers.generateVersion(version, resolve, false);
    }).then(() => {
      console.log('ULB processing completed!');
    });
  }, 30000); // max timeout (should be long enough, but may need to be increased on a slow connection)

  // it('should download and output en_ULB chapter files', () => {
  //   return new Promise((resolve) => {
  //     const version = 'v0.0';
  //     hindiUlbHelpers.generateVersion(version, resolve);
  //   }).then(() => {
  //     console.log('hi_ulb processing completed!');
  //   });
  // }, 300000); // max timeout (should be long enough, but may need to be increased on a slow connection)

});
