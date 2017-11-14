/**
 * bhpToJsonParse.test.js - not technically a test, but a bhp json parser/generator
 *   Remove .skip to run manually, otherwise will be skipped for unit tests
 */

import * as usfmToJsonHelpers from '../helpers/usfmToJsonHelpers';
import fs from 'fs-extra';
import path from 'path-extra';

const BHP_URL = 'https://git.door43.org/Door43/BHP/raw/master';
const usfmPath = path.join('__tests__', 'output', 'bhp-sources');

describe('ParseBHP', function() {
  it('should output BHP chapter files', function() {
    return new Promise((resolve) => {
      const book_name = '41-MAT';
      getBookUsfm(book_name, (bhpPath, bookCode) => {
        const outputPath = path.join('__tests__', 'output', 'bhp', 'v0', bookCode);
        if(fs.existsSync(outputPath)) {
          fs.removeSync(outputPath);
        }
        usfmToJsonHelpers.toChapterFiles(bhpPath, outputPath);
        resolve(true);
      });
    });
  });

  //
  // helpers
  //

  function getBookUsfm(bookName, callback) {
    const bookCode = bookName.split('-')[1].toLowerCase();
    let bhpPath = path.join(usfmPath, bookCode + ".usfm");
    if(fs.existsSync(bhpPath)) { // see if already downloaded
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
