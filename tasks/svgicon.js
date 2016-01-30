// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import glob from 'glob'
import gulpicon from 'gulpicon/tasks/gulpicon'
import svgConfig from './icons/config.js'

// Output folder
svgConfig.dest = config.paths.svgicon

// Get SVG icons
const svgFiles = glob.sync(config.paths.icons + '**/*.svg')

// Icon task
gulp.task('svgicon', gulpicon(svgFiles, svgConfig))
