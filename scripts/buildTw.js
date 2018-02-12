import fs from 'fs';
import * as twHelpers from '../helpers/twHelpers';
import path from 'path';

var data = {};

function main() {
  const version = getParameter('ver');
  if(!version) {
    console.log('process.argv', process.argv);
    console.log("Invalid parameter, expect version such as: '--ver=v0'");
    return;
  }
  const lang = getParameter('lang');
  if(!lang) {
    console.log('process.argv', process.argv);
    console.log("Invalid parameter, expect lang such as: '--lang=grc'");
    return;
  }
  const bible = getParameter('bible');
  if(!bible) {
    console.log('process.argv', process.argv);
    console.log("Invalid parameter, expect bible such as: '--bible=ugnt'");
    return;
  }
  
  return new Promise((resolve) => {
    twHelpers.generateTw(lang, bible, version, resolve);
  }).then(() => {
    console.log('tw processing completed!');
  }).catch((e) => {
    console.log('Failed: ' + e);
  });

}

function getParameter(param, dflt=null) {
  const find = '--' + param + '=';
  let value = dflt;
  for(let i=2; i<process.argv.length; i++) {
    let itemN = process.argv[i].split(find);
    if (itemN.length < 2) {
      continue;
    }
    value = itemN[1];
    break;
  }
  return value;
}

main();
