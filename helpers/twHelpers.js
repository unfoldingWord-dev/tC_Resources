/**
 * twHelpers.js - this is the code called by scripts/buildTw.js to generate the tW from a given language, bible and version.
 */

import fs from 'fs-extra';
import path from 'path-extra';
import * as bible from '../scripts/bible';

let biblePath = null;
let twOutputPath = null;
let twData = null;
let groupData = null;

const SOURCE = bible.BIBLE_LIST_NT;

/**
 * @description - generates the tW
 * @param lang
 * @param resource
 * @param version
 */
export function generateTw(lang, resource, version, resolve, baseDir='.') {
  biblePath = path.join(baseDir, 'resources', lang, 'bibles', resource, version);
  twOutputPath = path.join(baseDir, 'resources', lang, 'translationHelps', 'translationWords', version);
  let books = SOURCE.slice(0);
  books.forEach( (bookName) => {
    convertBookVerseObjectsToTwData(bookName);
  });
  resolve(true);
}

function convertBookVerseObjectsToTwData(bookName) {
  const bookId = getbookId(bookName);
  twData = {};
  const bookFolder = path.join(biblePath, bookId);
  const chapters = Object.keys(bible.BOOK_CHAPTER_VERSES[bookId]).length;
  for(let chapter = 1; chapter <= chapters; chapter++) {
    const chapterFile = path.join(bookFolder, chapter+'.json');
    const json = JSON.parse(fs.readFileSync(chapterFile));
    for (let verse in json) {
      json[verse].verseObjects.forEach( (verseObject) => {
        groupData = [];
        populateGroupDataFromVerseObject(verseObject);
        populateTwDataFromGroupData(bookId, chapter, verse);
      });
    }
  }
  for(let category in twData){
    for(let groupId in twData[category]){
      let groupPath = path.join(twOutputPath, category, "groups", bookId, groupId+".json");
      fs.outputFileSync(groupPath, JSON.stringify(twData[category][groupId], null, 2));
    }
  }
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
function populateGroupDataFromVerseObject(verseObject, isMilestone=false) {
  var myGroupData = {
    quote: [],
    strong: []
  };
  if(verseObject.type == 'milestone' || (verseObject.type == 'word' && (verseObject.tw || isMilestone))) {
    if(verseObject.type == 'milestone') {
      if(verseObject.text) {
        myGroupData.text.push(verseObject.text);
      }
      verseObject.children.forEach((childVerseObject) => {
        let childGroupData = populateGroupDataFromVerseObject(childVerseObject, true);
        if(childGroupData) {
          myGroupData.quote = myGroupData.quote.concat(childGroupData.quote);
          myGroupData.strong = myGroupData.strong.concat(childGroupData.strong);
        }
      });
    } else if(verseObject.type == 'word') {
      myGroupData.quote.push(verseObject.text);
      myGroupData.strong.push(verseObject.strong);
    }
    if (myGroupData.quote.length) {
      if(verseObject.tw) {
        const twLinkItems = verseObject.tw.split('/');
        const groupId = twLinkItems.pop();
        const category = twLinkItems.pop();
        if(! groupData[category]) {
          groupData[category] = {};
        }
        if(! groupData[category][groupId]) {
          groupData[category][groupId] = [];
        }
        groupData[category][groupId].push({
          quote: myGroupData.quote.join(' '),
          strong: myGroupData.strong
        });
      }
    }
  }
  return myGroupData;
}

function populateTwDataFromGroupData(bookId, chapter, verse) {
  for(let category in groupData) {
    if( ! twData[category] ) {
      twData[category] = [];
    }
    for(let groupId in groupData[category]) {
      if( ! twData[category][groupId] ) {
        twData[category][groupId] = [];
      }
      let occurrences = {};
      groupData[category][groupId].forEach( (item) => {
        if(! occurrences[item.quote]) {
          occurrences[item.quote] = 1;
        }
        twData[category][groupId].push({
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
}

/**
 * @description - split book code out of book name, for example 'mat' from '41-MAT'
 * @param {string} bookName book in format '41-MAT'
 * @return {string}
 */
function getbookId(bookName) {
  return bookName.split('-')[1].toLowerCase();
}
