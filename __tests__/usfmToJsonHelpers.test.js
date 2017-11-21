import * as usfmToJsonHelpers from '../helpers/usfmToJsonHelpers';
import fs from 'fs-extra';
import path from 'path-extra';

const usfmPath = path.join('__tests__', 'fixtures', 'bhp-tit.usfm');
describe('usfmToJsonHelpers.toChapterFiles', function() {
  it('should output chapter files', function() {
    const outputPath = path.join('__tests__', 'output', 'bhp', 'v0', 'tit');
    usfmToJsonHelpers.toChapterFiles(usfmPath, outputPath);
    const chapterFiles = fs.readdirSync(outputPath).filter(file => {
      return file;
    });
    const expected = ['1.json', '2.json', '3.json'];
    expect(chapterFiles).toEqual(expected);
  });
});
