import fs from 'fs-extra';
import path from 'path-extra';
import * as twHelpers from '../helpers/twHelpers';

describe('Test tw Helpers', function() {
  const tempFilePath = path.join('.', '__tests__', 'tw_helpers_test_temp');

  beforeEach(() => {
    if(fs.existsSync(tempFilePath)) {
      fs.removeSync(tempFilePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(tempFilePath)) {
      fs.removeSync(tempFilePath);
    }
  });

  it('should output tW from the UGNT bible verse objects', () => {
    const lang = 'grc';
    const resource = 'ugnt';
    const version = 'v0';
    const origUgntBibleDir = path.join('.', 'resources', lang, 'bibles', resource, version);
    const tempUgntBibleDir = path.join(tempFilePath, 'resources', lang, 'bibles', resource, version);
    const twOutputPath = path.join(tempFilePath, 'resources', lang, 'translationHelps', 'translationWords', version);
    const inChristJsonFile = path.join(twOutputPath, 'kt', 'groups', 'phm', 'inchrist.json');
    fs.copySync(origUgntBibleDir, tempUgntBibleDir);
    twHelpers.generateTw(lang, resource, version, tempFilePath);
    expect(fs.existsSync(inChristJsonFile)).toBeTruthy();
    const json = JSON.parse(fs.readFileSync(inChristJsonFile));
    expect(json).toMatchSnapshot();
  });
});
