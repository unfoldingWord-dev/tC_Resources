import fs from 'fs-extra';
import path from 'path-extra';
import { extractZipFile } from "../helpers/zipHelpers";
import * as ugntHelpers from '../helpers/ugntHelpers';

describe('ugntHelpers', function() {
  const tempFilePath = path.join('.', '__tests__', 'output', 'ugnt_help');
  const version = 'v0.0';
  const outputFilePath = path.join('.', 'resources', 'grc', 'bibles', 'ugnt', version);

  beforeEach(() => {
    deletePath(tempFilePath);
    deletePath(outputFilePath);
  });

  afterEach(() => {
    deletePath(tempFilePath);
    deletePath(outputFilePath);
  });

  it('should output UGNT chapter files', () => {
    return new Promise((resolve) => {
      const zipFileName = 'ugnt.zip';
      const zipfilepath = path.join(tempFilePath, zipFileName);
      fs.copySync(path.join('.', '__tests__', 'fixtures', 'ugnt', zipFileName), zipfilepath); // copy zip to new location since it will be deleted
      const resourceinputpath = path.join(tempFilePath,'dummyDestinationFolder');
      if(resourceinputpath) {
        fs.removeSync(resourceinputpath);
      }

      // extract zipped files, so new files are not downloaded
      extractZipFile(zipfilepath, resourceinputpath);

      const testVersionFolder = path.join(resourceinputpath, 'ugnt', version);
      const UGNTOutputPath = path.join('__tests__', 'output', 'ugnt-sources', version);
      fs.removeSync(UGNTOutputPath);
      fs.moveSync(testVersionFolder, UGNTOutputPath);

      ugntHelpers.generateUgntVersion(version, resolve);
    }).then(() => {
      console.log('UGNT processing completed!');
    });
  }, 30000); // max timeout (should be long enough, but may need to be increased on a slow connection)

  // for debugging
  // it('should download and output UGNT chapter files', () => {
  //   return new Promise((resolve) => {
  //     ugntHelpers.generateUgntVersion(version, resolve);
  //   }).then(() => {
  //     console.log('UGNT processing completed!');
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
