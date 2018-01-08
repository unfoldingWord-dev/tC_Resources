/**
 * ugntParse.js - this is a script to parse ugnt USFM on git.door43.org and generate the json files
 *    used by tC.
 *
 *    To run script:
 *    * update value for parameter `ver` in script `ugnt-parse` in package.json
 *    * verify url for ugnt sources in `ugntHelpers.UGNT_URL`
 *    * Run `npm install` inside tC_resources path to install node_modules
 *    * Run `npm run ugnt-parse` to download and generate ugnt json files
 *    * json output will be in ./resources/grc/bibles/[version]/
 */

import * as ugntHelpers from '../helpers/ugntHelpers';

function main() {
  let version = getParameter('ver');
  if(!version) {
    console.log('process.argv', process.argv);
    console.log("Invalid parameter, expect version such as: '--ver=v0'");
    return;
  }

  return new Promise((resolve) => {
    ugntHelpers.generateUgntVersion(version, resolve);
  }).then(() => {
    console.log('ugnt processing completed!');
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
