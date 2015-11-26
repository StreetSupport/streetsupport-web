# foley

[![Build Status](https://travis-ci.org/PJL101/foley.svg?branch=master)](https://travis-ci.org/PJL101/foley)
[![devDependency Status](https://david-dm.org/PJL101/foley/dev-status.svg)](https://david-dm.org/PJL101/foley#info=devDependencies)
[![Dependency Status](https://david-dm.org/PJL101/foley.svg)](https://david-dm.org/PJL101/foley)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

**A modern, opinionated frontend workflow for building a static website.**

Version: 0.0.2

* Author: [Phil Lennon](http://iampjl.co.uk)
* Source: [github.com/PJL101/foley](http://github.com/PJL101/foley)
* Issues and Suggestions: [github.com/PJL101/foley](http://github.com/PJL101/foley/issues)
* Twitter: [@PJL101](http://twitter.com/pjl101)
* Email: [enquiry@iampjl.co.uk](mailto:enquiry@iampjl.co.uk)

-

**Note:** This is in heavy development and is not ready for production use. Please wait for version 0.1.0

## About

This workflow contains:

* Easy to use with configuration from global files,
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

Use foley as a base to tailor to your specific needs.

Comments, suggestions & pull requests are always welcome. See the [issues list](https://github.com/PJL101/foley/issues) for more information about future enhancements and changes.

## Install

Download the latest stable release from [GitHub](https://github.com/PJL101/foley/releases). Once this has been done:

* Install Node 4 LTS or 5 stable. Other versions may work but this has not been tested,
* run `npm i gulp -g`,
* Navigate to the workflow folder in command line terminal,
* run `npm i`.

## Usage

`gulp [--production] [--debug]`

`gulp deploy [--production] [--debug]`

* The `gulp` task builds the website, watches for changes and starts up a sever,
* The `gulp deploy` task builds the website without watching for changes or running the server,
* The `--production` flag builds minified assets with no sourcemaps,
* The `--debug` flag shows the files being created in each task (if the task has a pipe).

## Known issues

* Gulpicon assets are not automatically copied into website,
* Blog support with Markdown, permalinks, etc is not available,
* Example JS files do not adhere to standardjs or ES2015,
* Task logging needs to be improved,
* No proper documentation,
* No proper example code.

## Credit

* Sample images from Unsplash.
* Sample icons from gulpicon.

**Have a nice day!**
