/**
 * usfmParseHelpers.js - share methods for downloading and processing USFM files to verseObjects
 */

import * as usfmToJsonHelpers from './usfmToJsonHelpers';
import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';
import assert from 'assert';

let ugntVersion = null;
let usfmCachePath = null;
let verseObjectsOutputPath = null;

/**
 * @description - reads UGNT for each book from github and split into chapters.  Calls itself until all books done.
 * @param {string} sourceUrl - source for download of resources
 * @param {string} version - string number to use
 * @param {Array} books of the bible to download in format '41-MAT'
 * @param {string} tempID - folder identifier for temp files
 * @param {string} outputPath - destination folders for generated resources.
 * @param {function} callback
 */
export function parseUsfmToChapters(sourceUrl, version, books, tempID, outputPath, callback) {
  if(!books.length) { // if no more books
    callback();
    return;
  }

  ugntVersion = version;
  usfmCachePath = path.join('__tests__', 'output', tempID);
  verseObjectsOutputPath = outputPath;
  let book_name = books.pop();
  getBookUsfm(sourceUrl, book_name, (ugntPath, bookCode) => {
    console.log("Parsing: " + book_name);

    const outputPath_ = path.join(outputPath, ugntVersion, bookCode);
    if(fs.existsSync(outputPath_)) {
      fs.removeSync(outputPath_);
    }
    usfmToJsonHelpers.toChapterFiles(ugntPath, outputPath_);
    const firstChapter = path.join(outputPath_, '1.json');
    assert.deepEqual(fs.existsSync(firstChapter),true);

    setTimeout( () => {
      parseUsfmToChapters(sourceUrl, version, books, tempID, outputPath, callback); // start next book
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
 * @param {string} sourceUrl - source for download of resources
 * @param {string} bookName book in format '41-MAT'
 * @param {function} callback
 */
function getBookUsfm(sourceUrl, bookName, callback) {
  const bookCode = getBookCode(bookName);
  const ugntFolder = path.join(usfmCachePath, ugntVersion);
  const ugntFilePath = path.join(ugntFolder, bookCode + ".usfm");
  if(fs.existsSync(ugntFilePath)) { // if already downloaded, just do callback
    console.log("file already downloaded: " + ugntFilePath);
    callback(ugntFilePath, bookCode);
    return;
  }

  const url = `${sourceUrl}/${bookName}.usfm`;
  console.log("Downloading: " + url);
  getUsfm(url, (data) => {
    assert.deepEqual(!!data,true);
    fs.mkdirsSync(ugntFolder);
    fs.outputFileSync(ugntFilePath, data, 'UTF-8');
    callback(ugntFilePath,bookCode);
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
  const bookPath = path.join(verseObjectsOutputPath, ugntVersion, bookCode);
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
    const ugntChapter = JSON.parse(fs.readFileSync(chapterPath));
    const ugntVerses = Object.keys(ugntChapter);
    let frontPos = ugntVerses.indexOf("front");
    if (frontPos >= 0) { // remove chapter front matter
      ugntVerses.splice(frontPos, 1); // remove front item
    }
    console.log(`${bookCode} - in chapter ${chapter}, found ${ugntVerses.length} verses`);
    if (ugntVerses.length !== expectedVerseCount) {
      console.warn(`WARNING: ${bookCode} - in chapter ${chapter}, found ${ugntVerses.length} verses but should be ${expectedVerseCount} verses`);
    }

    // add verses
    for (let verse of ugntVerses) {
      let words = ugntChapter[verse];
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
  const indexPath = path.join(verseObjectsOutputPath, ugntVersion, 'index.json');
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
export function generateIndex(books) {
  let index = {};
  for (let book of books) {
    const bookCode = getBookCode(book);
    indexBook(index, bookCode);
  }
  saveIndex(index);
  const ugntResultsPath = path.join(verseObjectsOutputPath, ugntVersion);
  console.log(`Updated UGNT files are in: "${ugntResultsPath}"`);
}

