import fs from 'fs-extra';
import path from 'path-extra';
import { extractZipFile } from "../helpers/zipHelpers";
import * as biblesHelpers from "../helpers/biblesHelpers";

describe('Bible Helpers', () => {
  const tempFilePath = './__tests__/output';

  afterEach(() => {
    if (tempFilePath) {
      fs.removeSync(tempFilePath);
    }
  });

  test('generateBibles with good input', () => {
    const zipFileName = 'en_ulb.zip';
    const zipfilepath = path.join(tempFilePath, zipFileName);
    fs.copySync(path.join('./__tests__/fixtures/bible', zipFileName), zipfilepath); // copy zip to new location since it will be deleted
    const resourceinputpath = path.join(tempFilePath,'dummyDestinationFolder');
    if(resourceinputpath) {
      fs.removeSync(resourceinputpath);
    }
    extractZipFile(zipfilepath, resourceinputpath);

    const resourceOutputPath = path.join(tempFilePath,'dummyResourceFolder');
    biblesHelpers.generateBibles(['41-MAT.usfm'], path.join(resourceinputpath,'en_ulb'), resourceOutputPath);
  });

  test('generateBibles with bad input', () => {
    let exception = true;
    try {
      biblesHelpers.generateBibles(['41-MAT.usfm'], null, null);
      exception = false;
    } catch (e) {
      console.log("failure: " + e);
      exception = true;
    }
    expect(exception).toEqual(true);
  });
});
