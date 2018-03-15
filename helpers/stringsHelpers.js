export function getResourceType(resourceId) {
  switch (resourceId) {
    case 'ulb':
    case 'ult':
    case 'udb':
    case 'bhp':
    case 'ugnt':
      return 'bibles';
    case 'tn':
    case 'ta':
    case 'tw':
      return 'translationHelps';
    default:
      return undefined;
  }
}

export function getResourceId(resourceId) {
  switch (resourceId) {
    case 'ulb':
    case 'ult':
    case 'udb':
    case 'bhp':
    case 'ugnt':
      return resourceId;
    case 'tn':
      return 'translationNotes';
    case 'ta':
      return 'translationAcademy';
    case 'tw':
      return 'translationWords';
    default:
      return resourceId;
  }
}
