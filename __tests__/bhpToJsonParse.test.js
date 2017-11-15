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
  it('should output BHP chapter files', () => {
    return new Promise((resolve) => {
      let books = BIBLE_LIST_NT.slice(0).reverse(); // make a reversed copy so we pop in book order
      parseBhpToChapters(books, () => {
        resolve(true);
      });
    });
  }, 100000); // max timeout (should be long enough, but may need to be increased on a slow connection)

  //
  // helpers
  //

  /**
   * @description - reads BHP for each book from github and split into chapters.
   * @param books {Array} books of the bible to download in format '41-MAT'
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
      expect(fs.existsSync(firstChapter)).toBeTruthy();

      setTimeout( () => {
        parseBhpToChapters(books, callback); // start next book
      }, 100);
    });
  }

  /**
   * @description - downloads book usfm if it has not already been downloaded.
   * @param bookName {String} book in format '41-MAT'
   * @param callback
   */
  function getBookUsfm(bookName, callback) {
    const bookCode = bookName.split('-')[1].toLowerCase();
    let bhpPath = path.join(usfmPath, bookCode + ".usfm");
    if(fs.existsSync(bhpPath)) { // if already downloaded, just do callback
      console.log("file already downloaded: " + bhpPath);
      callback(bhpPath, bookCode);
      return;
    }

    const url = `${BHP_URL}/${bookName}.usfm`;
    console.log("Downloading: " + url);
    getUsfm(url, (data) => {
      expect(data).not.toBeNull();
      fs.mkdirsSync(usfmPath);
      fs.outputFileSync(bhpPath, data, 'UTF-8');
      callback(bhpPath,bookCode);
    });
  }

  /**
   * @description - downloads usfm file
   * @param url {String} url to download
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
});
