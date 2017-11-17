import fs from 'fs-extra';
import * as zipHelpers from "../helpers/zipHelpers";

describe('Zip Helpers', () => {
  let zipfilepath = null;
  let resourceinputpath = null;

  beforeEach(() => {
    zipfilepath = null;
    resourceinputpath = null;
  });

  afterEach(() => {
    if (resourceinputpath) {
      fs.removeSync(resourceinputpath);
    }
  });

  test('extractZipFile with valid input', () => {
    const zipFileName = 'bhp-tit.usfm.zip';
    zipfilepath = './__tests__/output/' + zipFileName;
    fs.copySync('./__tests__/fixtures/' + zipFileName, zipfilepath); // copy zip to new location since it will be deleted
    resourceinputpath = './__tests__/output/dummyDestinationFolder';
    const expectException = false;
    const expectedOutputFile = resourceinputpath + '/bhp-tit.usfm';

    runExtractZipFile(zipfilepath, resourceinputpath, expectException);
    expect(fs.existsSync(expectedOutputFile)).toBeTruthy();
  });

  test('extractZipFile with dummy names', () => {
    zipfilepath = './dummySource.zip';
    const resourceinputpath = './__tests__/output/dummyDestinationFolder';
    const expectException = true;

    runExtractZipFile(zipfilepath, resourceinputpath, expectException);
  });

  test('extractZipFile with invalid input', () => {
    zipfilepath = null;
    resourceinputpath = null;
    const expectException = true;

    runExtractZipFile(zipfilepath, resourceinputpath, expectException);
  });

  //
  // helpers
  //
  function runExtractZipFile(zipfilepath, resourceinputpath, expectException) {
    let exception = true;
    try {
      if(resourceinputpath) {
        fs.removeSync(resourceinputpath);
      }
      zipHelpers.extractZipFile(zipfilepath, resourceinputpath);
      exception = false;
    } catch (e) {
      console.log("failure: " + e);
      exception = true;
    }
    expect(exception).toEqual(expectException);
  }

  });
