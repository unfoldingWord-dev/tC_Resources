/**
 * bhpToJsonParse.test.js - not technically a test, but a bhp json parser/generator
 *   Remove .skip to run manually, intended to be skipped for unit tests
 */

import * as usfmToJsonHelpers from '../helpers/usfmToJsonHelpers';
import fs from 'fs-extra';
import path from 'path-extra';

const BHP_URL = 'https://git.door43.org/Door43/BHP/raw/master';
const BIBLE_LIST_NT = ["41-MAT", "42-MRK", "43-LUK", "44-JHN", "45-ACT", "46-ROM", "47-1CO", "48-2CO", "49-GAL", "50-EPH",
  "51-PHP", "52-COL", "53-1TH", "54-2TH", "55-1TI", "56-2TI", "57-TIT", "58-PHM", "59-HEB", "60-JAS",
  "61-1PE", "62-2PE", "63-1JN", "64-2JN", "65-3JN", "66-JUD", "67-REV"];
const version = 'v0';
const usfmPath = path.join('__tests__', 'output', 'bhp-sources', version);

describe.skip('ParseBHP', function() {
  it('should output BHP chapter files', function() {
    return new Promise((resolve) => {
      let books = BIBLE_LIST_NT.slice(0).reverse();
      parseBhpToChapters(books, () => {
        resolve(true);
      });
    });
  });

  //
  // helpers
  //

  /**
   * @description - reads BHP for each book from github and split into chapters.  Note this is a recursive function
   *    due to async nature of url downloads
   * @param books
   * @param callback
   */
  function parseBhpToChapters(books, callback) {
    if(!books.length) { // if no more books
      callback();
      return;
    }

    let book_name = books.pop();

    getBookUsfm(book_name, (bhpPath, bookCode) => {
      const outputPath = path.join('__tests__', 'output', 'bhp', version, bookCode);
      if(fs.existsSync(outputPath)) {
        fs.removeSync(outputPath);
      }
      usfmToJsonHelpers.toChapterFiles(bhpPath, outputPath);
      const firstChapter = path.join(outputPath, '1.json');
      expect(fs.existsSync(firstChapter)).toBeTruthy();
      parseBhpToChapters(books, callback); // start next book
    });
  }

  /**
   * @description - downloads book usfm if it has not already been downloaded.
   * @param bookName
   * @param callback
   */
  function getBookUsfm(bookName, callback) {
    const bookCode = bookName.split('-')[1].toLowerCase();
    let bhpPath = path.join(usfmPath, bookCode + ".usfm");
    if(fs.existsSync(bhpPath)) { // if already downloaded, just do callback
      callback(bhpPath, bookCode);
      return;
    }

    const url = `${BHP_URL}/${bookName}.usfm`;
    getUsfm(url, (data) => {
      if(data) {
        fs.mkdirsSync(usfmPath);
        fs.outputFileSync(bhpPath, data, 'UTF-8');
      } else {
        bhpPath = null;
      }
      callback(bhpPath,bookCode);
    });
  }

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
});
