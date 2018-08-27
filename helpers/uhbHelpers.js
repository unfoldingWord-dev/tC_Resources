/**
 * ugntHelpers.js - this is the code called by ugntParse.js to download and convert greek resources (was BHP and now
 *                  UGNT.
 */

import path from 'path-extra';
import * as bible from '../scripts/bible';
import * as UsfmParseHelpers from './usfmParseHelpers';

const UHB_URL = 'https://git.door43.org/unfoldingWord/UHB/raw/master';

const uhbOutputPath = path.join('resources', 'he', 'bibles', 'uhb');

const SOURCE = bible.BIBLE_LIST_OT;

/**
 * @description - generates UGNT for each book from github and split into chapters and saves under version.
 * @param {string} version
 * @param {function} resolve - callback when finished
 */
export function generateUhbVersion(version, resolve) {
  console.log(`Using version: '${version}'`);
  let books = SOURCE.slice(0).reverse(); // make a reversed copy so we pop in book order
  books.push('manifest.yaml');
  UsfmParseHelpers.parseUsfmToChapters(UHB_URL, version, books, 'uhb-sources', uhbOutputPath, () => {
    UsfmParseHelpers.generateIndex(SOURCE, version);
    resolve(true);
  });
}

