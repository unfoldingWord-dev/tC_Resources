import fs from 'fs-extra';
import path from 'path-extra';
import * as twHelpers from '../helpers/twHelpers';

describe('Test tw Helpers', function() {
  const lang = 'grc';
  const resource = 'ugnt';
  const version = 'v0';
  const tempFilePath = path.join('.', '__tests__', 'tw_helpers_test_temp');
  const twOutputPath = path.join(tempFilePath, 'resources', lang, 'translationHelps', 'translationWords', version);
  const origUgntBibleDir = path.join('.', 'resources', lang, 'bibles', resource, version);
  const tempUgntBibleDir = path.join(tempFilePath, 'resources', lang, 'bibles', resource, version);

  beforeEach(() => {
    if(fs.existsSync(tempFilePath)) {
      fs.removeSync(tempFilePath);
    }
    fs.copySync(origUgntBibleDir, tempUgntBibleDir);
    twHelpers.generateTw(lang, resource, version, tempFilePath);
  });

  afterEach(() => {
    if (fs.existsSync(tempFilePath)) {
      fs.removeSync(tempFilePath);
    }
  });

  it('Test that milestones are properly constructed using inchrist for phm', () => {
    const jsonFile = path.join(twOutputPath, 'kt', 'groups', 'phm', 'inchrist.json');
    expect(fs.existsSync(jsonFile)).toBeTruthy();
    const data = JSON.parse(fs.readFileSync(jsonFile));
    expect(data).toMatchSnapshot();
    const expectedItems = 5;
    expect(data.length).toEqual(expectedItems);
  });

  it('Test that occurrence of God is correct in Titus 1:1', () => {
    const jsonFile = path.join(twOutputPath, 'kt', 'groups', 'tit', 'god.json');
    expect(fs.existsSync(jsonFile)).toBeTruthy();
    const data = JSON.parse(fs.readFileSync(jsonFile));
    const expectedOccurrence = 2;
    expect(data[1].contextId.occurrence).toEqual(expectedOccurrence);
  });
});
