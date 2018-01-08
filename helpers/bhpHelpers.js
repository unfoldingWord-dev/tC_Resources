/**
 * bhpHelpers.js - this is the code called by bhpParse.js to download and convert greek resources (was BHP and now
 *                  UGNT.
 */

import * as usfmToJsonHelpers from './usfmToJsonHelpers';
import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';
import assert from 'assert';

const BHP_URL = 'https://git.door43.org/Door43/UGNT/raw/master';

let bhpVersion = null;
const bhpUsfmCachePath = path.join('__tests__', 'output', 'bhp-sources');
const bhpOutputPath = path.join('resources', 'grc', 'bibles', 'bhp');

const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates BHP for each book from github and split into chapters and saves under version.
 * @param version
 * @param resolve
 */
export function generateBhpVersion(version, resolve) {
  console.log(`Using version: '${version}'`);
  bhpVersion = version;
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

    const outputPath = path.join(bhpOutputPath, bhpVersion, bookCode);
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
  return bookName.split('-')[1].toLowerCase();
}

/**
 * @description - downloads book usfm if it has not already been downloaded.
 * @param {string} bookName book in format '41-MAT'
 * @param callback
 */
function getBookUsfm(bookName, callback) {
  const bookCode = getBookCode(bookName);
  const bhpFolder = path.join(bhpUsfmCachePath, bhpVersion);
  const bhpFilePath = path.join(bhpFolder, bookCode + ".usfm");
  if(fs.existsSync(bhpFilePath)) { // if already downloaded, just do callback
    console.log("file already downloaded: " + bhpFilePath);
    callback(bhpFilePath, bookCode);
    return;
  }

  const url = `${BHP_URL}/${bookName}.usfm`;
  console.log("Downloading: " + url);
  getUsfm(url, (data) => {
    assert.deepEqual(!!data,true);
    fs.mkdirsSync(bhpFolder);
    fs.outputFileSync(bhpFilePath, data, 'UTF-8');
    callback(bhpFilePath,bookCode);
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
  const bookPath = path.join(bhpOutputPath, bhpVersion, bookCode);
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
      let words = bhpChapter[verse];
      if (words.verseObjects) { // check for new verse objects support
        words = words.verseObjects;
      }
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
  const indexPath = path.join(bhpOutputPath, bhpVersion, 'index.json');
  if (fs.existsSync(indexPath)) {
    fs.removeSync(indexPath);
  }
  const indexStr = JSON.stringify(index, null, 2);
  fs.outputFileSync(indexPath, indexStr, 'UTF-8');
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
  const bhpResultsPath = path.join(bhpOutputPath, bhpVersion);
  console.log(`Updated BHP files are in: "${bhpResultsPath}"`);
}

