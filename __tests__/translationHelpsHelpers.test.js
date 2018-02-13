import fs from 'fs-extra';
import path from 'path-extra';
import * as translationHelpsHelpers from "../helpers/translationHelpsHelpers";
import { extractZipFile } from "../helpers/zipHelpers";


describe('Translation Helps Helpers', () => {
  const tempFilePath = path.join('.', '__tests__', 'output', 'trans_help');

  afterEach(() => {
    if (tempFilePath) {
      fs.removeSync(tempFilePath);
    }
  });

  test('getTranslationHelps with valid input', () => {
    const zipFileName = 'en_tw.zip';
    const zipfilepath = path.join(tempFilePath, zipFileName);
    fs.copySync(path.join('./__tests__/fixtures/th', zipFileName), zipfilepath); // copy zip to new location since it will be deleted
    const resourceinputpath = path.join(tempFilePath,'dummyDestinationFolder');
    if(resourceinputpath) {
      fs.removeSync(resourceinputpath);
    }
    extractZipFile(zipfilepath, resourceinputpath);

    const resourceOutputPath = path.join(tempFilePath,'dummyResourceFolder');
    translationHelpsHelpers.getTranslationHelps(path.join(resourceinputpath,'en_tw'), resourceOutputPath);
  });

  test('getTranslationHelps with invalid input', () => {
    let exception = true;
    try {
      translationHelpsHelpers.getTranslationHelps(null, null);
      exception = false;
    } catch (e) {
      console.log("failure: " + e);
      exception = true;
    }
    expect(exception).toEqual(true);
  });

});
