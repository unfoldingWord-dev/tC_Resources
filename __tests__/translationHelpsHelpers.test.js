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

  test('getTranslationWords with valid input', () => {
    const zipFileName = 'en_tw.zip';
    const zipfilepath = path.join(tempFilePath, zipFileName);
    fs.copySync(path.join('./__tests__/fixtures/th', zipFileName), zipfilepath); // copy zip to new location since it will be deleted
    const resourceInputPath = path.join(tempFilePath, 'dummyDestinationFolder');
    if(resourceInputPath) {
      fs.removeSync(resourceInputPath);
    }
    extractZipFile(zipfilepath, resourceInputPath);

    const resourceOutputPath = path.join(tempFilePath,'dummyResourceFolder', 'en', 'translationHelps', 'translationWords');
    translationHelpsHelpers.getTranslationWords(path.join(resourceInputPath, 'en_tw'), resourceOutputPath);
    const expectedExistingFile = path.join(resourceOutputPath, 'v8', 'kt', 'articles', 'inchrist.md');
    expect(fs.existsSync(expectedExistingFile)).toBeTruthy();
  });

  test('getTranslationWords with invalid input', () => {
    let exception = true;
    try {
      translationHelpsHelpers.getTranslationWords(null, null);
      exception = false;
    } catch (e) {
      console.log("failure: " + e);
      exception = true;
    }
    expect(exception).toEqual(true);
  });

  test('getTranslationAcademy with valid input', () => {
    const zipFileName = 'en_ta.zip';
    const zipfilepath = path.join(tempFilePath, zipFileName);
    fs.copySync(path.join('./__tests__/fixtures/th', zipFileName), zipfilepath); // copy zip to new location since it will be deleted
    const resourceInputPath = path.join(tempFilePath,'dummyDestinationFolder');
    if(resourceInputPath) {
      fs.removeSync(resourceInputPath);
    }
    extractZipFile(zipfilepath, resourceInputPath);

    const resourceOutputPath = path.join(tempFilePath,'dummyResourceFolder', 'en', 'translationHelps', 'translationAcademy');
    translationHelpsHelpers.getTranslationAcademy(path.join(resourceInputPath,'en_ta'), resourceOutputPath);
    const expectedExistingFile = path.join(resourceOutputPath, 'v9', 'translate', 'translate-names.md');
    expect(fs.existsSync(expectedExistingFile)).toBeTruthy();
  });

  test('getTranslationAcademy with invalid input', () => {
    let exception = true;
    try {
      translationHelpsHelpers.getTranslationAcademy(null, null);
      exception = false;
    } catch (e) {
      console.log("failure: " + e);
      exception = true;
    }
    expect(exception).toEqual(true);
  });
});

describe('translationHelpsHelpers.compareByFirstUniqueWord() tests', () => {
  test('Compare two strings with first word the same', ()=>{
    const aString = {name:'god, gods'};
    const bString = {name:'god, false gods'};
    const expectedResult = 1;
    expect(translationHelpsHelpers.compareByFirstUniqueWord(aString, bString)).toEqual(expectedResult);
  });

  test('Compare two strings with first word different', ()=>{
    const aString = {name:'faith, faithful'};
    const bString = {name:'god, false gods'};
    const expectedResult = -1;
    expect(translationHelpsHelpers.compareByFirstUniqueWord(aString, bString)).toEqual(expectedResult);
  });

  test('Compare two strings with one having only one word', ()=>{
    const aString = {name:'god, father god'};
    const bString = {name:'god'};
    const expectedResult = 1;
    expect(translationHelpsHelpers.compareByFirstUniqueWord(aString, bString)).toEqual(expectedResult);
  });

  test('Compare where both strings are the same', ()=>{
    const aString = {name:'hour, hours'};
    const bString = {name:'hour, hours'};
    const expectedResult = 0;
    expect(translationHelpsHelpers.compareByFirstUniqueWord(aString, bString)).toEqual(expectedResult);
  });

  test('Test that case does not matter', ()=>{
    const aString = {name:'Zebra'};
    const bString = {name:'ant'};
    const expectedResult = 1;
    expect(translationHelpsHelpers.compareByFirstUniqueWord(aString, bString)).toEqual(expectedResult);
  });
});
