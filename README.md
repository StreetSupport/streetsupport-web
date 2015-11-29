# Street Support Website

## To Do

* Menu styling,
* Menu opacity,
* SVG header logo,
* Form styling.

## Install

* Install Node 4 LTS or 5 stable. Other versions may work but this has not been tested,
* run `npm i gulp -g`,
* Navigate to the cloned folder in command line terminal,
* run `npm i`,
* run 'gulp'.

See [https://github.com/PJL101/foley](https://github.com/PJL101/foley) for more information on the workflow. This project uses version 0.0.3.

## Usage

`gulp [--production] [--debug]`

`gulp deploy [--production] [--debug]`

* The `gulp` task builds the website, watches for changes and starts up a sever,
* The `gulp deploy` task builds the website without watching for changes or running the server,
* The `--production` flag builds minified assets with no sourcemaps,
* The `--debug` flag shows the files being created in each task (if the task has a pipe).

## Frontend Conventions

Opinionated! Happy to discuss.

* The SCSS uses BEM, mobile first,
* Try to modularise & reuse everything (if possible),
* Add each component to component.html,
* Each component has been designed to be as interchangeable as possible. For example to change a standard block to image block, you just need to add the .block__image div and the content reflows,
* Webpack is used, so try and follow the require module structure,
* jQuery 2 has been included as a global, meaning you can use it as you normally would in any module,
* Try to install framework/modules as a last resort or only when needed,
* No Angular or similar please (for now!),
* ES2015 is fully supported but I'm still using ES4 for now,
* Speak to Phil about fonts, I'm using my Typekit account for now,
* Add any new components to the components webpage.

## Workflow Features

The workflow contains:

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
