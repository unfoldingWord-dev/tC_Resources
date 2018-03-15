/**
 * englishUltHelpers.js - this is the code called by englishUltParse.js to download and convert english ULT resources
 */

import path from 'path-extra';
import * as bible from '../scripts/bible';
import * as UsfmParseHelpers from './usfmParseHelpers';

//TODO: EN_ULT_URL path is a temporary repo, needs to be updated to final location.
const EN_ULT_URL = 'https://git.door43.org/photonomad0/AlignedUlb_en/raw/master';

const ugntOutputPath = path.join('resources', 'en', 'bibles', 'ult');

const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates UGNT for each book from github and split into chapters and saves under version.
 * @param {string} version
 * @param {function} resolve - callback when finished
 * @param {boolean} index - if false indexing is skipped
 */
export function generateVersion(version, resolve, index=true) {
  console.log(`Using version: '${version}'`);
  let books = ['57-TIT']; // TODO add other books as completed
  UsfmParseHelpers.parseUsfmToChapters(EN_ULT_URL, version, books, 'en-ult-sources', ugntOutputPath, () => {
    if (index) {
      UsfmParseHelpers.generateIndex(SOURCE, version);
    }
    resolve(true);
  });
}
