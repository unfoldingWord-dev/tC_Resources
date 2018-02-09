/**
 * twHelpers.js - this is the code called by twGenerate.js to generate the tW from a given language, bible and version.
 */

import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';
import assert from 'assert';
import util from 'util';

let bibleVersion = null;
let biblePath = null;
let twOutputPath = null;
let tw = {};

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
    const bookId = getbookId(bookName);
    tw[bookId] = {};
    const bookFolder = path.join(biblePath, bookId);
    const chapters = Object.keys(bible.BOOK_CHAPTER_VERSES[bookId]).length;
    for(let chapter = 1; chapter <= chapters; chapter++) {
      const chapterFile = path.join(bookFolder, chapter+'.json');
      const json = JSON.parse(fs.readFileSync(chapterFile));
      for (let verse in json) {
        json[verse].verseObjects.forEach( (verseObject) => {
          let groups = {};
          getQuotes(groups, verseObject);
          for(let groupId in groups) {
            if( ! tw[bookId][groupId] ) {
              tw[bookId][groupId] = [];
            }
            let occurrences = {};
            groups[groupId].forEach( (quote) => {
              if(! occurrences[quote]) {
                occurrences[quote] = 1;
              }
              tw[bookId][groupId].push({
                "priority": 1,
                "comments": false,
                "reminders": false,
                "selections": false,
                "verseEdits": false,
                "contextId": {
                  "reference": {"bookId": bookId, "chapter": chapter, "verse": verse},
                  "tool": "translationWords",
                  "groupId": groupId,
                  "quote": quote,
                  "occurrence": occurrences[quote]++
                }
              });
            });
          }
        });
      }
    }
  });
  console.log(util.inspect(tw, {showHidden: false, depth: null}));
}

/**
 * 
 * @param verseObjects 
 * @param book
 * @param chapter
 * @param verse 
 * @param text
 * @returns string
 */
function getQuotes(groups, verseObject, milestone=null) {
  var quote = '';
  if(verseObject['type'] == 'milestone' || (verseObject['type'] == 'word' && (verseObject['tw'] || milestone))) {
    if(verseObject['type'] == 'milestone') {
      if(verseObject['text']) {
        quote = verseObject['text'];
      }
      verseObject.children.forEach((childVerseObject) => {
        quote += (quote?' ':'')+getQuotes(groups, childVerseObject, true);
      });
    } else if(verseObject['type'] == 'word') {
      quote = verseObject['text'];
    }
    if (quote) {
      if(verseObject['tw']) {
        const groupId = verseObject['tw'].split('/').pop();
        if(! groups[groupId]) {
          groups[groupId] = [];
        }
        groups[groupId].push(quote);
      }
    }
    return quote;
  }
}

/**
 * @description - split book code out of book name, for example 'mat' from '41-MAT'
 * @param {string} bookName book in format '41-MAT'
 * @return {string}
 */
function getbookId(bookName) {
  return bookName.split('-')[1].toLowerCase();
}

