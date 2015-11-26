# Street Support Website

## Install

* Install Node 4 LTS or 5 stable. Other versions may work but this has not been tested,
* run `npm i gulp -g`,
* Navigate to the cloned folder in command line terminal,
* run `npm i`,
* run 'gulp'.

## Usage

`gulp [--production] [--debug]`

`gulp deploy [--production] [--debug]`

* The `gulp` task builds the website, watches for changes and starts up a sever,
* The `gulp deploy` task builds the website without watching for changes or running the server,
* The `--production` flag builds minified assets with no sourcemaps,
* The `--debug` flag shows the files being created in each task (if the task has a pipe).
