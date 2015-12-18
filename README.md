# StreetSupport Website

The Frontend codebase for streetsupport.net.

## Build Status

* Beta (master) - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=master)](https://travis-ci.org/StreetSupport/streetsupport-web)
* Dev (develop) - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=develop)](https://travis-ci.org/StreetSupport/streetsupport-web)

## Domains

Please work in the develop branch first and only merge to master when ready and tested. Travis CI automatically builds on each commit to develop and master.

* The master branch automatically builds to: [http://beta.streetsupport.net](http://beta.streetsupport.net).
* The develop branch automatically builds to: [http://dev.streetsupport.net](http://dev.streetsupport.net).

## Install

* Install Node.js 5 stable. Other versions may work but this has not been tested,
* run `npm i gulp -g`,
* Navigate to the cloned folder in command line terminal,
* run `npm i`,
* run 'gulp'.

See [https://github.com/PJL101/foley](https://github.com/PJL101/foley) for more information about the workflow. This project uses version 0.0.3.

## Usage

`gulp [--production] [--debug]`

`gulp deploy [--production] [--debug]`

* The `gulp` task builds the website, watches for changes and starts up a sever,
* The `gulp deploy` task builds the website without watching for changes or running the server,
* The `--production` flag builds minified assets with no sourcemaps,
* The `--debug` flag shows the files being created in each task (if the task has a pipe).

## Frontend Conventions

Happy to discuss any of this:

* The SCSS uses BEM and mobile first,
* Try to modularise & reuse components (if possible),
* Add each new component to component.html,
* Webpack is used, so try and follow the require module structure,
* Vanilla JavaScript is in use with minimal libraries,
* Try to install framework/modules as a last resort or only when needed,
* No Angular or similar please (for now!),
* ES2015 is fully supported in the workflow but I'm still using ES5 for now,
* Client side templating (Hogan.js/mustache) is in use but do any logic in the API/JavaScript. Use it for output only.
