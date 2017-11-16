import { getResourceType, getResourceId } from "../helpers/stringsHelpers";

describe('Strings Helpers', () => {
    describe('getResourceType', () => {
      test('with valid id', () => {
        const resourceId = 'ulb';
        const expectedResType = 'bibles';
        expect(getResourceType(resourceId)).toEqual(expectedResType);
      });

      test('with valid id helps', () => {
        const resourceId = 'tn';
        const expectedResType = resourceId;
        expect(getResourceType(resourceId)).toEqual(expectedResType);
      });

      test('with invalid id', () => {
        const resourceId = 'cheeze';
        const expectedResType = undefined;
        expect(getResourceType(resourceId)).toEqual(expectedResType);
      });
    });

    describe('getResourceId', () => {
      test('with valid id', () => {
        const resourceId = 'ulb';
        const expectedResID = resourceId;
        expect(getResourceId(resourceId)).toEqual(expectedResID);
      });

      test('with valid id tn', () => {
        const resourceId = 'tn';
        const expectedResID = 'translationNotes';
        expect(getResourceId(resourceId)).toEqual(expectedResID);
      });

      test('with valid id ta', () => {
        const resourceId = 'ta';
        const expectedResID = 'translationAcademy';
        expect(getResourceId(resourceId)).toEqual(expectedResID);
      });

      test('with valid id tw', () => {
        const resourceId = 'tw';
        const expectedResID = 'translationWords';
        expect(getResourceId(resourceId)).toEqual(expectedResID);
      });

      test('with invalid id', () => {
        const resourceId = 'cheeze';
        const expectedResID = resourceId;
        expect(getResourceId(resourceId)).toEqual(expectedResID);
        });
    });
});
