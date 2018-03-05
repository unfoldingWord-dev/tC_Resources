import fs from 'fs-extra';
import path from 'path-extra';
import * as EnglishUlbHelpers from "../helpers/englishUlbHelpers";

describe('englishUlbHelpers', function() {
  const tempFilePath = './__tests__/output/en-ulb-sources';
  const version = 'v0.0';
  const outputFilePath = path.join('.', 'resources', 'en', 'bibles', 'ulb', version);

  beforeEach(() => {
    deletePath(tempFilePath);
    deletePath(outputFilePath);
  });

  afterEach(() => {
    deletePath(tempFilePath);
    deletePath(outputFilePath);
  });

  it('should output ULB chapter files', () => {
    return new Promise((resolve) => {
      const resourceinputpath = path.join('__tests__','fixtures','bible', 'en_aligned');

      const UGNTOutputPath = path.join('__tests__', 'output', 'en-ulb-sources', version);
      fs.removeSync(UGNTOutputPath);
      fs.ensureDir(UGNTOutputPath);
      fs.copySync(resourceinputpath, UGNTOutputPath);

      EnglishUlbHelpers.generateVersion(version, resolve, false);
    }).then(() => {
      console.log('ULB processing completed!');
    });
  }, 30000); // max timeout (should be long enough, but may need to be increased on a slow connection)

  // it('should download and output en_ULB chapter files', () => {
  //   return new Promise((resolve) => {
  //     EnglishUlbHelpers.generateVersion(version, resolve);
  //   }).then(() => {
  //     console.log('en_ulb processing completed!');
  //   });
  // }, 300000); // max timeout (should be long enough, but may need to be increased on a slow connection)

});

//
// helpers
//
function deletePath(filePath) {
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
}
