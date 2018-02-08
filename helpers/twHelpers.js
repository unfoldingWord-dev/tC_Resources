/**
 * twHelpers.js - this is the code called by twGenerate.js to generate the tW from a given language, bible and version.
 */

import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';
import assert from 'assert';

let bibleVersion = null;
let biblePath = null;
let twOutputPath = null;
let quotes = {};

const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates the tW
 * @param lang
 * @param resource
 * @param version
 */
export function generateTw(lang, resource, version) {
  bibleVersion = version;
  console.log(`Using version: '${version}'`);
  biblePath = path.join('resources', lang, 'bibles', resource, version);
  twOutputPath = path.join('resources', 'grc', 'translationHelps', 'translationWords', version);
  let books = SOURCE.slice(0);
  books.forEach( (bookName) => {
    const bookCode = getBookCode(bookName);
    const bookFolder = path.join(biblePath, bookCode);
    const chapters = Object.keys(bible.BOOK_CHAPTER_VERSES[bookCode]).length;
    let terms = {};
    for(let i = 1; i <= chapters; i++) {
      const chapterFile = path.join(bookFolder, i+'.json');
      const json = JSON.parse(fs.readFileSync(chapterFile));
      for (let verse in json) {
        json[verse].verseObjects.forEach( (verseObject) => {
          populateFromVerseObject(verseObject);
        });
      }
    }
  });
  console.log(quotes);
}

/**
 * 
 * @param {*} verseObjects 
 * @param {*} terms 
 * @returns string
 */
function populateFromVerseObject(verseObject) {
  if(verseObject['tw'] !== undefined && (verseObject['text'] !== undefined || verseObject['children'] != undefined)) {
    let tw = verseObject['tw'];
    let text = verseObject['text'];
    if( text === undefined && verseObject['children'] !== undefined) {
      let words = [];
      verseObject.children.forEach((child) => {
        words.push(populateFromVerseObject(child));
      });
      text = words.join(' ');
    }
    if ( text !== undefined ) {
      if( typeof(quotes[tw]) === 'undefined') {
        quotes[tw] = [];
      }
      if(quotes[tw].indexOf(text) < 0) {
        quotes[tw].push(text);
        quotes[tw].sort();
      }
      return text;
    }
  }
}

/**
 * @description - split book code out of book name, for example 'mat' from '41-MAT'
 * @param {string} bookName book in format '41-MAT'
 * @return {string}
 */
function getBookCode(bookName) {
  return bookName.split('-')[1].toLowerCase();
}

