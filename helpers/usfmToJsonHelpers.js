import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
/**
 * @description - This function outputs chapter files from an input usfm file
 * @param {String} usfmPath - Path of the usfm file
 * @param {String} outputPath - Path to store the chapter json files as output
 */
export const toChapterFiles = (usfmPath, outputPath) => {
  const usfmData = fs.readFileSync(usfmPath, 'UTF-8').toString();
  const converted = usfm.toJSON(usfmData);
  const {chapters} = converted;
  Object.keys(chapters).forEach(chapter => {
    fs.outputFileSync(path.join(outputPath, chapter + '.json'), JSON.stringify(chapters[chapter], null, 2));
  });
};
