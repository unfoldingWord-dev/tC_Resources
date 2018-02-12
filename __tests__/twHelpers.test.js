import fs from 'fs-extra';
import path from 'path-extra';
import { extractZipFile } from "../helpers/zipHelpers";
import * as twHelpers from '../helpers/twHelpers';

describe('Test tw Helpers', function() {
  const tempFilePath = path.join('.', '__tests__', 'tw_helpers_test_temp');

  beforeEach(() => {
    if(fs.existsSync(tempFilePath)) {
      fs.removeSync(tempFilePath);
    }
  });

  afterEach(() => {
    if (tempFilePath) {
      fs.removeSync(tempFilePath);
    }
  });

  it('should output tW from the UGNT bible verse objects', () => {
    const lang = 'grc';
    const resource = 'ugnt';
    const version = 'v0';
    const zipFileName = 'resources.zip';
    const origZipFilePath = path.join('.', '__tests__', 'fixtures', 'tw_ugnt_test', zipFileName);
    const zipFilePath = path.join(tempFilePath, zipFileName);
    const dummyBaseDir = path.join(tempFilePath, 'dummyResourcesDir');

    return new Promise((resolve) => {
      // copy zip to new location since it will be deleted
      fs.copySync(origZipFilePath, zipFilePath);
      // extract zipped files, so new files are not downloaded
      extractZipFile(zipFilePath, dummyBaseDir);
      twHelpers.generateTw(lang, resource, version, resolve, dummyBaseDir);
    }).then(() => {
      const twOutputPath = path.join(dummyBaseDir, 'resources', lang, 'translationHelps', 'translationWords', version);
      const inChristJsonFile = path.join(twOutputPath, 'kt', 'groups', 'phm', 'inchrist.json');
      expect(fs.existsSync(inChristJsonFile)).toBeTruthy();
      const json = JSON.parse(fs.readFileSync(inChristJsonFile));
      expect(json).toMatchSnapshot();
      console.log('tW processing completed!');
    });
  });
});
