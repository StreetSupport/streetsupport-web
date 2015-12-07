# StreetSupport Website

* Beta Build Status (master) - [![Build Status - beta](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=master)](https://travis-ci.org/StreetSupport/streetsupport-web)
* Dev Build Status (develop) - [![Build Status - dev](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=develop)](https://travis-ci.org/StreetSupport/streetsupport-web)

## Domains

Please work in the develop branch and only merge to master when ready and tested. Travis CI automatically builds on each commit to develop and master. Pull requests are not built and have to be merged.

* The master branch automatically builds to: [http://beta.streetsupport.web](http://beta.streetsupport.web).
* The develop branch automatically builds to: [http://dev.streetsupport.web](http://dev.streetsupport.web).

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

Opinionated! Happy to discuss.

* The SCSS uses BEM and mobile first,
* Try to modularise & reuse components (if possible),
* Add each new component to component.html,
* Each component has been designed to be as interchangeable as possible. For example to change a standard block to image block, you just need to add the .block__image div and the content reflows,
* Webpack is used, so try and follow the require module structure,
* Vanilla JavaScript is in use with minimal libraries,
* Try to install framework/modules as a last resort or only when needed,
* No Angular or similar please (for now!),
* ES2015 is fully supported but I'm still using ES5 for now.

## Workflow Features

The workflow contains:

* Easy to use with configuration from global files (/tasks/config/),
* Gulp,
* Metalsmith (static website and blog generator),
* Handlebars & Handlebars Layouts integration,
* Webpack with jQuery integration,
* Babel (ES2015 support),
* Standardjs linting,
* Sass & PostCSS,
* Sass-mq & Susy grid system,
* Image minification,
* Gulpicon,
* HTML minification.
