/**
 * ugntHelpers.js - this is the code called by ugntParse.js to download and convert greek resources (was BHP and now
 *                  UGNT.
 */

import path from 'path-extra';
import * as bible from '../scripts/bible';
import * as UsfmParseHelpers from './usfmParseHelpers';

const UGNT_URL = 'https://git.door43.org/Door43/UGNT/raw/master';

const ugntOutputPath = path.join('resources', 'grc', 'bibles', 'ugnt');

const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates UGNT for each book from github and split into chapters and saves under version.
 * @param {string} version
 * @param {function} resolve - callback when finished
 */
export function generateUgntVersion(version, resolve) {
  console.log(`Using version: '${version}'`);
  let books = SOURCE.slice(0).reverse(); // make a reversed copy so we pop in book order
  books.push('manifest.yaml');
  UsfmParseHelpers.parseUsfmToChapters(UGNT_URL, version, books, 'ugnt-sources', ugntOutputPath, () => {
    UsfmParseHelpers.generateIndex(SOURCE, version);
    resolve(true);
  });
}

