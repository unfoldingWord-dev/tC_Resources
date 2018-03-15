import fs from 'fs-extra';
import path from 'path-extra';
import * as EnglishUltHelpers from "../helpers/englishUltHelpers";

describe('englishUltHelpers', function() {
  const tempFilePath = './__tests__/output/en-ult-sources';
  const version = 'v0.0';
  const outputFilePath = path.join('.', 'resources', 'en', 'bibles', 'ult', version);

  beforeEach(() => {
    deletePath(tempFilePath);
    deletePath(outputFilePath);
  });

  afterEach(() => {
    deletePath(tempFilePath);
    deletePath(outputFilePath);
  });

  it('should output ULT chapter files', () => {
    return new Promise((resolve) => {
      const resourceinputpath = path.join('__tests__','fixtures','bible', 'en_aligned');

      const UGNTOutputPath = path.join('__tests__', 'output', 'en-ult-sources', version);
      fs.removeSync(UGNTOutputPath);
      fs.ensureDir(UGNTOutputPath);
      fs.copySync(resourceinputpath, UGNTOutputPath);

      EnglishUltHelpers.generateVersion(version, resolve, false);
    }).then(() => {
      console.log('ULT processing completed!');
    });
  }, 30000); // max timeout (should be long enough, but may need to be increased on a slow connection)

  // it('should download and output en_ULT chapter files', () => {
  //   return new Promise((resolve) => {
  //     EnglishUlTHelpers.generateVersion(version, resolve);
  //   }).then(() => {
  //     console.log('en_ulT processing completed!');
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
