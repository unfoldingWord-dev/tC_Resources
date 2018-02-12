/**
 * twHelpers.js - this is the code called by scripts/buildTw.js to generate the tW from a given language, bible and version.
 */

import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';

let biblePath = null;
let twOutputPath = null;

const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates the tW
 * @param lang
 * @param resource
 * @param version
 */
export function generateTw(lang, resource, version) {
  biblePath = path.join('resources', lang, 'bibles', resource, version);
  twOutputPath = path.join('resources', lang, 'translationHelps', 'translationWords', version);
  let books = SOURCE.slice(0);
  books.forEach( (bookName) => {
    const bookId = getbookId(bookName);
    let tw = {};
    const bookFolder = path.join(biblePath, bookId);
    const chapters = Object.keys(bible.BOOK_CHAPTER_VERSES[bookId]).length;
    for(let chapter = 1; chapter <= chapters; chapter++) {
      const chapterFile = path.join(bookFolder, chapter+'.json');
      const json = JSON.parse(fs.readFileSync(chapterFile));
      for (let verse in json) {
        json[verse].verseObjects.forEach( (verseObject) => {
          let groups = {};
          getTextData(groups, verseObject);
          for(let category in groups) {
            if( ! tw[category] ) {
              tw[category] = [];
            }
            for(let groupId in groups[category]) {
              if( ! tw[category][groupId] ) {
                tw[category][groupId] = [];
              }
              let occurrences = {};
              groups[category][groupId].forEach( (item) => {
                if(! occurrences[item.quote]) {
                  occurrences[item.quote] = 1;
                }
                tw[category][groupId].push({
                  "priority": 1,
                  "comments": false,
                  "reminders": false,
                  "selections": false,
                  "verseEdits": false,
                  "contextId": {
                    "reference": {"bookId": bookId, "chapter": chapter, "verse": parseInt(verse)},
                    "tool": "translationWords",
                    "groupId": groupId,
                    "quote": item.quote,
                    "strong": item.strong,
                    "occurrence": occurrences[item.quote]++
                  }
                });
              });
            }
          }
        });
      }
    }
    for(let category in tw){
      for(let groupId in tw[category]){
        let groupPath = path.join(twOutputPath, category, "groups", bookId, groupId+".json");
        fs.outputFileSync(groupPath, JSON.stringify(tw[category][groupId], null, 2));
      }
    }
  });
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
function getTextData(groups, verseObject, milestone=null) {
  var myData = {
    quote: [],
    strong: []
  };
  if(verseObject.type == 'milestone' || (verseObject.type == 'word' && (verseObject.tw || milestone))) {
    if(verseObject.type == 'milestone') {
      if(verseObject.text) {
        myData.text.push(verseObject.text);
      }
      verseObject.children.forEach((childVerseObject) => {
        let childData = getTextData(groups, childVerseObject, true);
        if(childData) {
          myData.quote = myData.quote.concat(childData.quote);
          myData.strong = myData.strong.concat(childData.strong);
        }
      });
    } else if(verseObject.type == 'word') {
      myData.quote.push(verseObject.text);
      myData.strong.push(verseObject.strong);
    }
    if (myData.quote.length) {
      if(verseObject.tw) {
        const twLinkItems = verseObject.tw.split('/');
        const groupId = twLinkItems.pop();
        const category = twLinkItems.pop();
        if(! groups[category]) {
          groups[category] = {};
        }
        if(! groups[category][groupId]) {
          groups[category][groupId] = [];
        }
        groups[category][groupId].push({
          quote: myData.quote.join(' '),
          strong: myData.strong
        });
      }
    }
  }
  return myData;
}

/**
 * @description - split book code out of book name, for example 'mat' from '41-MAT'
 * @param {string} bookName book in format '41-MAT'
 * @return {string}
 */
function getbookId(bookName) {
  return bookName.split('-')[1].toLowerCase();
}

