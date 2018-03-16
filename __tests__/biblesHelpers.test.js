import fs from 'fs-extra';
import path from 'path-extra';
import { extractZipFile } from "../helpers/zipHelpers";
import * as biblesHelpers from "../helpers/biblesHelpers";

describe('Bible Helpers', () => {
  const tempFilePath = path.join('.', '__tests__', 'output', 'bible_help');

  afterEach(() => {
    if (tempFilePath) {
      fs.removeSync(tempFilePath);
    }
  });

  test('generateBibles with good input', () => {
    // TODO: Update ulb to ult once it is updated in the catalog.
    const zipFileName = 'en_ulb.zip';
    const zipfilepath = path.join(tempFilePath, zipFileName);
    fs.copySync(path.join('.', '__tests__', 'fixtures', 'bible', zipFileName), zipfilepath); // copy zip to new location since it will be deleted
    const resourceinputpath = path.join(tempFilePath,'dummyDestinationFolder');
    if(resourceinputpath) {
      fs.removeSync(resourceinputpath);
    }
    extractZipFile(zipfilepath, resourceinputpath);

    const resourceOutputPath = path.join(tempFilePath,'dummyResourceFolder');
    biblesHelpers.generateBibles(['41-MAT.usfm'], path.join(resourceinputpath,'en_ulb'), resourceOutputPath);
  });

  test('generateBibles with bad input', () => {
    function generateBiblesFails() {
      biblesHelpers.generateBibles(['41-MAT.usfm'], null, null);
    }
    expect(generateBiblesFails).toThrowError('The "path" argument must be of type string');
  });
});
