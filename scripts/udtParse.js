import path from 'path-extra';
// helpers
import * as UsfmParseHelpers from '../helpers/usfmParseHelpers';

if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
  const message = 'You did not pass any process arguments. Therefore, "en" will be use as language id, "udt" as bible id and "v10" as bible version.';
  console.log('\x1b[36m%s\x1b[0m', message);
  console.log('\x1b[36m%s\x1b[0m', 'This script can be run as follow to download English UDT:');
  console.log('\x1b[35m%s\x1b[0m', 'npm run update-aligned-udt "en" "udt" "v10" ');
}

// constants
const languageId = process.argv[2] || 'en';
const bibleId = process.argv[3] || 'udt';
const bibleVersion = process.argv[4] || 'v10';
const BIBLE_URL = `https://git.door43.org/manny_colon/AlignedUdt_${languageId}/raw/master`; // temp repo until it is in catalog
const bibleOutputPath = path.join('resources', languageId, 'bibles', bibleId);

export const generateUdtBible = () => {
  return new Promise((resolve, reject) => {
    try {
      const books = ['57-TIT'];
      const tempId = `${languageId}-${bibleId}-sources`;
      UsfmParseHelpers.parseUsfmToChapters(BIBLE_URL, bibleVersion, books, tempId, bibleOutputPath, () => resolve(true));
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

generateUdtBible();
