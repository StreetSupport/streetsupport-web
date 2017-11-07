# StreetSupport Website

The website codebase for streetsupport.net.
Kindly supported by ![Browser Stack](/src/img/browser-stack.png)

## Submitting Updates

Please fork and work in the `develop` branch. Once the update is completed, submit a pull request into `develop`. Travis CI automatically builds on each commit to `develop`, `uat` and `prod`. The `prod` branch automatically builds to: [http://streetsupport.net](http://streetsupport.net).

## Build Status

* develop - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=develop)](https://travis-ci.org/StreetSupport/streetsupport-web)
* staging - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=uat)](https://travis-ci.org/StreetSupport/streetsupport-web)
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

### Environments

There are three API environments: CI, UAT and LIVE. You can alter the API your local instance is running from by editing [/blob/develop/src/js/env.js](/blob/develop/src/js/env.js):

* 0: locally running API instance
* 1: CI
* 2: UAT
* 3: LIVE

Day-to-day development should point at CI.

## Development

### Workflow

On running the default `gulp` task from the terminal, it will run tests and linting, build the site into the `/_dist/` directory, and then launch in your default browser. As you edit files in the `/src/` directory, the site will refresh automatically.

### Pages

Each page of the site is found under the `/pages/` directory. Each page is represented by a handlebars file `index.hbs`, in a directory named after the page's url. In each `.hbs` file, meta data is entered to define the page:

* title: the page's title tag
* description: the page's meta description
* layout: the master layout file (found in `/layouts/`)
* permalink: ???
* jsBundle: the js bundle that will be loaded into the page. Bundles are defined in `/webpack.config.js` and each one points to a js file in `/src/js/`
* section: the top level navigation item this page belongs to. See `/src/scss/modules/_variables.scss` for list of sections
* page: the navigation item for this page. See `/src/scss/modules/_variables.scss` for list of pages
* nosubnav: {true|false} if `true`, hide the sub navigation on the page

Page templating is done using [Hogan](http://twitter.github.io/hogan.js/). Note: template parts need to be escaped eg:

``` \{{myVariable}} ```

[Knockout](http://knockoutjs.com/) data-binding is also used in some pages.

### Javascript

Page code-behinds are written in plain ol' Javascript, or use [Knockout](http://knockoutjs.com/). Knockout view models are found in `/js/models/` are mostly tested. [ES2015](https://babeljs.io/learn-es2015/) syntax is transpiled using [Babel](https://babeljs.io/).

### Testing

Tests reside in the `/spec` directory, and are written using [Jasmine](https://jasmine.github.io/) and [Sinon](http://sinonjs.org/). Please ensure any features submitted via pull request are covered by tests.

A number of happy paths are covered by automated browsers tests at: [https://github.com/StreetSupport/web-automated-testing](https://github.com/StreetSupport/web-automated-testing).

### Styling

CSS styling is written in SCSS, based on [Susy](http://susy.oddbird.net/), in the [BEM](http://getbem.com/introduction/) style, and is auto-prefixed. Build with a mobile-first approach, using [sass-mq](https://github.com/sass-mq/sass-mq) for media queries.
Each component's styles should reside in its own file. Avoid nesting of elements and modifiers (although there are many cases of nesting at the moment!).
