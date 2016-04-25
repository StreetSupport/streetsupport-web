# StreetSupport Website

The website codebase for streetsupport.net.

## Git Branching

Please work in the develop branch first, and use feature branches for significant pieces of work. Only merge to staging when ready, tested and signed off. Travis CI automatically builds on each commit to develop, staging and release. The release branch automatically builds to: [http://streetsupport.net](http://streetsupport.net).

## Build Status

* develop - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=develop)](https://travis-ci.org/StreetSupport/streetsupport-web)
* staging - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=staging)](https://travis-ci.org/StreetSupport/streetsupport-web)
* release - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=release)](https://travis-ci.org/StreetSupport/streetsupport-web)

## Install

* Install Node 4 LTS,
* (Recommended) Run in Terminal: `npm i npm -g` (Update NPM to latest version),
* Run in Terminal: `npm i gulp-cli -g` (Gulp does not need to be installed globally),
* Navigate to the workflow folder in command line Terminal,
* Run: `npm i`.

See [https://github.com/fephil/foley](https://github.com/fephil/foley) for more information about the workflow. This project uses version 0.4.3.

### Optional Installs

In your editor of choice, the following plugins are recommended but not required. Note the plugin names might be slightly different depending on your editor.

* editorconfig,
* tabs-to-spaces,
* linter,
* linter-handlebars,
* linter-js-standard,
* linter-stylelint.

## Usage

Run these tasks in your command line Terminal:

`gulp [--production] [--debug]`

`gulp deploy [--production] [--debug]`

`gulp auditcode`

* The `gulp` task builds the website, watches for changes and starts up a sever,
* The `gulp deploy` task builds the website without watching for changes or running the server,
* The `gulp auditcode` task runs various linting on the project source files,
* The `gulp visualtest` task builds the website, starts up a sever and runs visual regression tests,
* The `gulp jsdev` task only checks and builds javascript with associated tests,
* The `--production` flag builds minified assets with no sourcemaps,
* The `--debug` flag shows the files being created in each task (if the task has a pipe).
* The `gulp test` task builds the website, starts up a sever and runs visual regression tests.

## Frontend Conventions

Happy to discuss any of this:

* SCSS styling uses BEM and mobile first,
* Try to modularise & reuse style components (if possible),
* Webpack is used, so try and follow the ES2015 module structure,
* Vanilla JavaScript is in use with minimal libraries. Try to install framework/modules only when needed,
* ES2015 code is fully supported in the workflow as Babel is used to transpile,
* Client side templating (Hogan.js/mustache) is in use but do any logic in the API/JavaScript. Use templating for rendering output only,
* To use client side templating in a page, you must use a \ before each statement.
