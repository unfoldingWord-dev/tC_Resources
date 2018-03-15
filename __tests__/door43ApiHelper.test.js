import * as door43ApiHelper from "../helpers/door43ApiHelper";
import fs from 'fs-extra';
import path from 'path-extra';

describe('Door43 API Helper', () => {
  test('getUrl with valid url', () => {
      return new Promise((resolve, reject) => {

        const mock_get = () => {
          return new Promise(resolve => {
            let catalog = fs.readFileSync(path.join('.', '__tests__', 'fixtures', 'catalog.json'));
            catalog = JSON.parse(catalog);
            resolve({
              data: catalog
            });
          });
        };

        // using ulb here until ult is added to the catalog
        door43ApiHelper
          .getUrl('en', 'ulb', mock_get)
          .then(url => {
            expect(url).not.toBeNull();
            resolve();
          })
          .catch(err => {
            console.error(err);
            reject();
          });
      });
    }, 10000); // max timeout
});
