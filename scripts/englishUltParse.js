/**
 * englishUltParse.js - this is a script to parse english ULT on git.door43.org and generate the json files
 *    used by tC.
 *
 *    To run script:
 *    * update value for parameter `ver` in script `en-ult-parse` in package.json
 *    * verify url for ugnt sources in `englishUltHelpers.UGNT_URL`
 *    * Run `npm install` inside tC_resources path to install node_modules
 *    * Run `npm run en-ult-parse` to download and generate english ULT json files
 *    * json output will be in ./resources/en/bibles/ult/[version]/
 */

import * as EnglishUltHelpers from '../helpers/englishUltHelpers';

function main() {
  let version = getParameter('ver');
  if(!version) {
    console.log('process.argv', process.argv);
    console.log("Invalid parameter, expect version such as: '--ver=v0'");
    return;
  }

  return new Promise((resolve) => {
    EnglishUltHelpers.generateVersion(version, resolve);
  }).then(() => {
    console.log('en_ult processing completed!');
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
