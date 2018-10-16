# StreetSupport Website

This repository is for the Street Support website, found at https://streetsupport.net. The website helps people facing homelessness find services in their area, as as well as sign-posting people wanting to help, to where it is needed. The site acts as a gateway into Street Support's broader remit of helping connect organisations, people with lived experience, policy-makers, and businesses to co-produce lasting solutions.

## Contributing

I will be adding any updates we receive from our users as issues on Github. Please fork and work in the `develop` branch. Once the update is completed, submit a pull request into `develop`. Travis CI automatically builds on each commit to `develop`, `uat` and `prod`.

I would also appreciate any issues/PRs for bugs you may come across, and general fixes/refactorings. Where possible, please write a test that covers your code change.

## Build Status

* develop: https://ssn-web-dev.azurewebsites.net/ - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=develop)](https://travis-ci.org/StreetSupport/streetsupport-web)
* uat: https://ssn-web-uat.azurewebsites.net/ - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=uat)](https://travis-ci.org/StreetSupport/streetsupport-web)
* release: https://streetsupport.net - [![Build Status](https://travis-ci.org/StreetSupport/streetsupport-web.svg?branch=release)](https://travis-ci.org/StreetSupport/streetsupport-web)

## Install

* Install the latest stable Node version,
* Run in Terminal: `npm i gulp-cli -g` (Gulp does not need to be installed globally),
* In your command line terminal, navigate to the street support project folder,
* Run: `npm i` 
  * if you are on the Code Wifi network, you may have an issue installing modules around CriticalCSS/Phantom; you might need to tether to your mobile phone to get these downloaded.)
  * if this throws errors around Snyk (most likely Windows), see [https://support.snyk.io/snyk-cli/snyk-protect-requires-the-patch-binary].

See Installation Troubleshooting section if Installation fails

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
* jsBundle: the js bundle that will be loaded into the page. Bundles are defined in `/webpack.config.js` and each one points to a js file in `/src/js/`. For basic pages, use `generic`.
* section: the top level navigation item this page belongs to. See `/src/scss/modules/_variables.scss` for list of sections
* page: the navigation item for this page. See `/src/scss/modules/_variables.scss` for list of pages

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

### Installation troubleshooting

#### Gulp Native Code Crashes

````
gulp[62193]: ../src/node_contextify.cc:631:static void node::contextify::ContextifyScript::New(const FunctionCallbackInfo<v8::Value> &): Assertion `args[1]->IsString()' failed.
````

Caused by: One of gulp's dependencies are out of date

Solution: Uninstall and reinstall Node Modules

```
rm -rf node_modules
npm i
```

#### Node Sass

```
ERROR in Missing binding <PROJECT_DIR>/node_modules/node-sass/vendor/darwin-x64-11/binding.node
Node Sass could not find a binding for your current environment: <ENVIRONMENT> with Node <NODE_VERSION>
```

Caused by: switching node versions

Solution: Rebuild Project

```
npm rebuild
```

#### Cannot download PhantomJS

Caused by: network blocking download

Solution: use an alternative network (best to run `npm i` before attending)

#### Others

If there are problems that aren't mentioned here, post in the slack channel so we can help out and upate these docs.

## Supported by

![Browser Stack](/src/img/browser-stack.png)
