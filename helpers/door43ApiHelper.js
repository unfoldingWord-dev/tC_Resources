import axios from 'axios';

/**
 * @description - does a lookup to find the URL for specified resource
 * @param languageId
 * @param resourceId
 * @param get - optional get method to call (for testing)
 * @return {Promise.<*>}
 */
export const getUrl = async (languageId, resourceId, get=axios.get) => {
  let response = await get('https://api.door43.org/v3/catalog.json');
  let url;
  let languageResources = response.data.languages.filter(language => {
    // filter languages to match languageId
    return language.identifier === languageId;
  });

  let resource = languageResources[0].resources.filter(resource => {
    // filter resources to match resourceId
    return resource.identifier === resourceId;
  });

  if (resourceId !== 'tw') {
    url = resource[0].formats[0].url;
  } else {
    url = resource[0].projects[0].formats[0].url;
  }

  return url;
};
