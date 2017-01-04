# StreetSupport Website

The website codebase for streetsupport.net.

## Git Branching

Please work in the develop branch first, and use feature branches for significant pieces of work. Only merge to staging when ready, tested and signed off. Travis CI automatically builds on each commit to develop, staging and release. The release branch automatically builds to: [http://streetsupport.net](http://streetsupport.net).

## Build Status

* develop - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=develop)](https://travis-ci.org/StreetSupport/streetsupport-web) [![Browser Tests](https://travis-ci.org/StreetSupport/web-automated-testing.svg?branch=master)](https://travis-ci.org/StreetSupport/web-automated-testing)
* staging - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=staging)](https://travis-ci.org/StreetSupport/streetsupport-web)
* release - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=release)](https://travis-ci.org/StreetSupport/streetsupport-web)

## Install

* Install Node 6 LTS,
* Run in Terminal: `npm i gulp-cli -g` (Gulp does not need to be installed globally),
* In your command line terminal, navigate to the street support project folder,
* Run: `npm i`.

See [https://github.com/fephil/garrus](https://github.com/fephil/garrus) for more information about the Frontend workflow.

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
* The `gulp jsdev` task only checks and builds javascript with associated tests,
* The `--production` flag builds minified assets with no sourcemaps,
* The `--debug` flag shows the files being created in each task (if the task has a pipe).
