import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
import yaml from 'yamljs';

/**
 * Generates tC compatible bible data structure.
 * @param {array} bibles
 * @param {String} extractedFilePath
 * @param {String} RESOURCE_OUTPUT_PATH
 */
export function generateBibles(bibles, extractedFilePath, RESOURCE_OUTPUT_PATH) {
  try {
    console.log(
      '\x1b[33m%s\x1b[0m',
      'Generating tC compatible bible resource data structure ...',
    );
    bibles.forEach(bible => {
      const pathToUsfmFile = path.join(extractedFilePath, bible);
      let oldManifest = getResourceManifestFromYaml(extractedFilePath);
      let bibleVersion = 'v' + oldManifest.dublin_core.version;
      generateBibleManifest(oldManifest, bibleVersion, RESOURCE_OUTPUT_PATH);

      let usfmBibleBook = fs.readFileSync(pathToUsfmFile).toString('utf8');
      fs.outputJsonSync(extractedFilePath + '/aa.json', usfm.toJSON(usfmBibleBook));
      let jsonBibleBook = usfm.toJSON(usfmBibleBook);

      // get parsed book
      const chapters = Object.keys(jsonBibleBook.chapters);
      chapters.forEach(chapterNumber => {
        let arrayValue = parseInt(chapterNumber, 10);
        // only allow chapter numbers to generate bible (no strings)
        if (typeof arrayValue === 'number' && !isNaN(arrayValue)) {

          let fileName = chapterNumber + '.json';
          const toc3Header = jsonBibleBook.headers.find((header) => header.tag === 'toc3');
          let bibleId = toc3Header.content.toLowerCase().replace(' ', '');
          console.log('\x1b[33m%s\x1b[0m', `bibleId:${bibleId}`);
          let savePath = path.join(
            RESOURCE_OUTPUT_PATH,
            bibleVersion,
            bibleId,
            fileName,
          );
          fs.outputJsonSync(savePath, jsonBibleBook[chapterNumber]);
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param {String} extractedFilePath
 */
export function getResourceManifestFromYaml(extractedFilePath) {
  try {
    const filePath = path.join(extractedFilePath, 'manifest.yaml');
    const yamlManifest = fs.readFileSync(filePath, 'utf8');
    return yaml.parse(yamlManifest);
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param {object} oldManifest
 * @param {String} bibleVersion
 * @param {String} RESOURCE_OUTPUT_PATH
 */
function generateBibleManifest(oldManifest, bibleVersion, RESOURCE_OUTPUT_PATH) {
  let newManifest = {};
  newManifest.language_id = oldManifest.dublin_core.language.identifier;
  newManifest.language_name = oldManifest.dublin_core.language.title;
  newManifest.direction = oldManifest.dublin_core.language.direction;
  newManifest.subject = oldManifest.dublin_core.subject;
  newManifest.resource_id = oldManifest.dublin_core.identifier;
  newManifest.resource_title = oldManifest.dublin_core.title;
  const oldMainfestIdentifier = oldManifest.dublin_core.identifier.toLowerCase();
  newManifest.description =
  oldMainfestIdentifier === 'ult' || oldMainfestIdentifier === 'udb' || oldMainfestIdentifier === 'ult'
      ? 'Gateway Language'
      : 'Original Language';

  let savePath = path.join(RESOURCE_OUTPUT_PATH, bibleVersion, 'manifest.json');

  fs.outputJsonSync(savePath, newManifest);
}
