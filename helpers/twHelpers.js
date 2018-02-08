/**
 * twHelpers.js - this is the code called by twGenerate.js to generate the tW from a given language, bible and version.
 */

import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';
import assert from 'assert';

let bibleVersion = null;
const biblePath = null;
const twOutputPath = null;

const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates the tW
 * @param lang
 * @param bible
 * @param version
 */
export function generateTw(lang, bible, version) {
  bibleVersion = version;
  console.log(`Using version: '${version}'`);
  biblePath = path.join('resources', lang, 'bibles', bible, version);
  twOutputPath = path.join('resources', 'grc', 'translationHelps', 'translationWords', version);
  let books = SOURCE.slice(0).reverse(); // make a reversed copy so we pop in book order
  generateTwFromBible(books);
}

/**
 * @description - reads the verseObjects for the book of the Bible given
 * @param {Array} books of the bible to download in format '41-MAT'
 */
function generateTwFromBible(books) {
  books.forEach( (bookName) => {
    const bookCode = getBookCode(bookName);
    const bookFolder = path.join(biblePath, bookCode);
    console.log(bookCode);
    console.log(bookFolder);
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
 * @description - load book verseObjects.
 * @param {string} bookName book in format '41-MAT'
 * @param callback
 */
function getBookVerseObjects(bookName, callback) {
  const bookCode = getBookCode(bookName);
  const bookFolder = path.join(biblePath, bookCode);
  if(! fs.existsSync(bookFolder)) { 
    console.log("Book does not exist: " + bookCode);
    callback(bookFolder, bookCode);
    return;
  }
  callback(bookFolder,bookCode);
}

/**
 * @description - update index with chapter/verse/words for specified book code
 * @param {Object} index
 * @param {string} bookCode
 */
function indexBook(index, bookCode) {
  console.log("Indexing " + bookCode);
  const expectedChapters = bible.BOOK_CHAPTER_VERSES[bookCode];
  const bookPath = path.join(ugntOutputPath, ugntVersion, bookCode);
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
  const indexPath = path.join(ugntOutputPath, ugntVersion, 'index.json');
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
  const ugntResultsPath = path.join(ugntOutputPath, ugntVersion);
  console.log(`Updated UGNT files are in: "${ugntResultsPath}"`);
}

