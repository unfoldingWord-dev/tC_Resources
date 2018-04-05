[![Build Status](https://travis-ci.org/translationCoreApps/tC_Resources.svg?branch=master)](https://travis-ci.org/translationCoreApps/tC_Resources)
[![codecov](https://codecov.io/gh/translationCoreApps/tC_Resources/branch/master/graph/badge.svg)](https://codecov.io/gh/translationCoreApps/tC_Resources)

# tC Resources

Helper methods and static resources for [translationCore].

## Usage

This repository should be included as a sub-module in [translationCore].

## Scripts

To update resources, run `npm run update-resource <args>` _(instructions given in `./index.js`)_.  
_*** Note: we are still transitioning from ULB to ULT (and UDB to UDT), so for now will have to manually move the output file until the source files are renamed.  Also for now we need
 to run the scripts `npm run update-aligned-ult` and `npm run update-aligned-udt` until aligned data is integrated in._

To update UGNT resources, run `npm run ugnt-parse` _(instructions given in `./script/ugntParse.js`)_.

And after updating UGNT resources, you need update TW resources, run `npm run build-ugnt-tw` _(instructions given in `./script/ugntParse.js`)_.


[translationCore]:https://github.com/unfoldingWord-dev/translationCore
