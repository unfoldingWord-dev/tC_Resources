/**
 * bhpToJsonParse.test.js - this is a script to parse bhp USFM on git.door43.org and generate the json files
 *    used by tC. Leave `.skip` on describe when committing so this will be skipped for unit testing.
 *
 *    To run script:
 *    * remove `.skip` on describe
 *    * update value for `version`
 *    * verify url for bhp in `BHP_URL`
 *    * Run `npm install` inside tC_resources path to install node_modules
 *    * Run `jest __tests__/bhpToJsonParse.test.js` to download and generate bhp json files
 *    * copy directories from __tests__/output/bhp/<version>/ to resources/grc/bibles/bhp/<version>/
 */

import * as usfmToJsonHelpers from '../helpers/usfmToJsonHelpers';
import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';
import assert from 'assert';

const BHP_URL = 'https://git.door43.org/Door43/BHP/raw/master';

const version = 'v0';
const usfmPath = path.join('__tests__', 'output', 'bhp-sources', version);
const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates BHP for each book from github and split into chapters and saves under version.
 * @param version
 * @param resolve
 */
export function generateBhpVersion(version, resolve) {
  console.log(`Using version: '${version}'`);
  let books = SOURCE.slice(0).reverse(); // make a reversed copy so we pop in book order
  parseBhpToChapters(books, () => {
    generateIndex(SOURCE, version);
    resolve(true);
  });
}

/**
 * @description - reads BHP for each book from github and split into chapters.
 * @param {Array} books of the bible to download in format '41-MAT'
 * @param callback
 */
function parseBhpToChapters(books, callback) {
  if(!books.length) { // if no more books
    callback();
    return;
  }

  let book_name = books.pop();

  getBookUsfm(book_name, (bhpPath, bookCode) => {
    console.log("Parsing: " + book_name);

    const outputPath = path.join('__tests__', 'output', 'bhp', version, bookCode);
    if(fs.existsSync(outputPath)) {
      fs.removeSync(outputPath);
    }
    usfmToJsonHelpers.toChapterFiles(bhpPath, outputPath);
    const firstChapter = path.join(outputPath, '1.json');
    assert.deepEqual(fs.existsSync(firstChapter),true);

    setTimeout( () => {
      parseBhpToChapters(books, callback); // start next book
    }, 100);
  });
}

/**
 * @description - split book code out of book name, for example 'mat' from '41-MAT'
 * @param {string} bookName book in format '41-MAT'
 * @return {string}
 */
function getBookCode(bookName) {
  const bookCode = bookName.split('-')[1].toLowerCase();
  return bookCode;
}

/**
 * @description - downloads book usfm if it has not already been downloaded.
 * @param {string} bookName book in format '41-MAT'
 * @param callback
 */
function getBookUsfm(bookName, callback) {
  const bookCode = getBookCode(bookName);
  let bhpPath = path.join(usfmPath, bookCode + ".usfm");
  if(fs.existsSync(bhpPath)) { // if already downloaded, just do callback
    console.log("file already downloaded: " + bhpPath);
    callback(bhpPath, bookCode);
    return;
  }

  const url = `${BHP_URL}/${bookName}.usfm`;
  console.log("Downloading: " + url);
  getUsfm(url, (data) => {
    assert.deepEqual(!!data,true);
    fs.mkdirsSync(usfmPath);
    fs.outputFileSync(bhpPath, data, 'UTF-8');
    callback(bhpPath,bookCode);
  });
}

/**
 * @description - downloads usfm file
 * @param {string} url url to download
 * @param callback
 */
function getUsfm(url, callback) {
  let request = require('request');
  request.get({
    url: url,
    json: false
  }, (err, res, data) => {
    if(err) {
      callback(null);
    } else {
      callback(data);
    }
  });
}

/**
 * @description - update index with chapter/verse/words for specified book code
 * @param {Object} index
 * @param {string} bookCode
 */
function indexBook(index, bookCode) {
  console.log("Indexing " + bookCode);
  const expectedChapters = bible.BOOK_CHAPTER_VERSES[bookCode];
  const bookPath = path.join('__tests__', 'output', 'bhp', version, bookCode);
  const files = fs.readdirSync(bookPath);
  const chapterCount = Object.keys(expectedChapters).length;
  console.log(`${bookCode} - found ${chapterCount} chapters`);
  assert.deepEqual(files.length,chapterCount);
  const bookIndex = {};
  index[bookCode] = bookIndex;

  // add chapters
  for (let chapter of Object.keys(expectedChapters)) {
    const chapterIndex = {};
    bookIndex[chapter] = chapterIndex;
    const expectedVerseCount = parseInt(expectedChapters[chapter]);
    const chapterPath = path.join(bookPath, chapter + ".json");
    const bhpChapter = JSON.parse(fs.readFileSync(chapterPath));
    const bhpVerses = Object.keys(bhpChapter);
    console.log(`${bookCode} - in chapter ${chapter}, found ${bhpVerses.length} verses`);
    if (bhpVerses.length !== expectedVerseCount) {
      console.warn(`WARNING: ${bookCode} - in chapter ${chapter}, found ${bhpVerses.length} verses but should be ${expectedVerseCount} verses`);
    }

    // add verses
    for (let verse of bhpVerses) {
      const words = bhpChapter[verse];
      const wordCount = words.length;
      chapterIndex[verse] = wordCount;
    }
  }
}

/**
 * @description save index to index.json
 * @param index
 */
function saveIndex(index) {
  const indexPath = path.join('__tests__', 'output', 'bhp', version, 'index.json');
  if (fs.existsSync(indexPath)) {
    fs.removeSync(indexPath);
  }
  const indexStr = JSON.stringify(index, null, 2);
  fs.outputFileSync(indexPath, indexStr, 'UTF-8');
  console.log(indexStr);
}

/**
 * @description - make index of all the books
 * @param {Array} books to index
 */
function generateIndex(books) {
  let index = {};
  for (let book of books) {
    const bookCode = getBookCode(book);
    indexBook(index, bookCode);
  }
  saveIndex(index);
}

