# StreetSupport Website

The Frontend codebase for beta.streetsupport.net.

## Build Status

* Beta (master) - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=master)](https://travis-ci.org/StreetSupport/streetsupport-web)
* Dev (develop) - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=develop)](https://travis-ci.org/StreetSupport/streetsupport-web)

## Domains

Please work in the develop branch first and only merge to master when ready and tested. Travis CI automatically builds on each commit to develop and master.

* The master branch automatically builds to: [http://beta.streetsupport.net](http://beta.streetsupport.net).
* The develop branch automatically builds to: [http://dev.streetsupport.net](http://dev.streetsupport.net).

## Install

* Optional: Install PhantomJS, using Homebrew or similar package manager,
* Install Node 4 LTS or 5 stable (preferred),
* Run in Terminal: `npm i gulp-cli -g` (Gulp does not need to be installed globally),
* Navigate to the workflow folder in command line Terminal,
* Run: `npm i`.

See [https://github.com/PJL101/foley](https://github.com/PJL101/foley) for more information about the workflow. This project uses version 0.2.2.

## Optional Installs

The following plugins for Atom are recommended but not required:

* editorconfig,
* linter,
* linter-handlebars,
* linter-js-standard,
* linter-stylelint,
* tabs-to-spaces.

## Usage

Run these tasks in your command line Terminal:

`gulp [--production] [--debug]`

`gulp deploy [--production] [--debug]`

`gulp auditcode`

* The `gulp` task builds the website, watches for changes and starts up a sever,
* The `gulp deploy` task builds the website without watching for changes or running the server,
* The `gulp auditcode` task runs various linting on the project source files.
* The `--production` flag builds minified assets with no sourcemaps,
* The `--debug` flag shows the files being created in each task (if the task has a pipe).

## Frontend Conventions

Happy to discuss any of this:

* The SCSS uses BEM and mobile first,
* Try to modularise & reuse style components (if possible),
* Add each new component to _components.hbs,
* Webpack is used, so try and follow the ES2015 module structure,
* Vanilla JavaScript is in use with minimal libraries, try to install framework/modules only when needed,
* No Angular or similar please (for now!),
* ES2015 is fully supported in the workflow,
* Client side templating (Hogan.js/mustache) is in use but do any logic in the API/JavaScript. Use templating for rendering output only.
