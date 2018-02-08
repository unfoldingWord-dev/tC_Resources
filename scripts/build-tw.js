import fs from 'fs';
import * as twHelpers from '../helpers/twHelpers';
import path from 'path';

var ugntPath = 'resources/grc/bibles/ugnt/v0/';

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
  twHelpers.generateTw(lang, bible, version);
  getData(ugntPath);
}

function getData(dir){
  fs.readdir( dir, function( err, files ) {
    if( err ) {
      console.error( "Could not list the directory.", err );
      process.exit( 1 );
    }
    files.forEach( function(file, index) {
      var filePath = path.join( dir, file );
      fs.stat( filePath, function( error, stat ) {
        if( error ) {
          console.error( "Error stating file.", error );
          return;
        }
        if( stat.isFile() ) {
          console.log( "'%s' is a file.", filePath );
        }
        else if( stat.isDirectory() ) {
          console.log( "'%s' is a directory.", filePath );
          getData(filePath);
        }
      });
    });
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
