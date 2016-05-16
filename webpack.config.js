var argv = require('yargs').argv
var path = require('path')
var webpack = require('webpack')
var CommonsChunkPlugin = require(path.join(__dirname, '/node_modules/webpack/lib/optimize/CommonsChunkPlugin'))

// Create plugins array
var plugins = [
  new CommonsChunkPlugin('commons.js')
]

// Add Uglify task to plugins array if there is a production flag
if (argv.production) {
  plugins.push(new webpack.optimize.UglifyJsPlugin())
}

module.exports = {
  entry: {
    home: path.join(__dirname, '/src/js/page-generic'),
    generic: path.join(__dirname, '/src/js/page-generic'),
    findhelp: path.join(__dirname, '/src/js/page-find-help'),
    category: path.join(__dirname, '/src/js/page-category'),
    categorybyday: path.join(__dirname, '/src/js/page-category-by-day'),
    organisation: path.join(__dirname, '/src/js/page-organisation'),
    allserviceproviders: path.join(__dirname, '/src/js/page-all-service-providers'),
    giverequests: path.join(__dirname, '/src/js/page-give-requests'),
    sponsor: path.join(__dirname, '/src/js/page-sponsor'),
    volunteer: path.join(__dirname, '/src/js/page-volunteer'),
    joinstreetsupport: path.join(__dirname, '/src/js/page-join-street-support')
  },
  output: {
    path: path.join(__dirname, '/_dist/assets/js/'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    publicPath: 'assets/js/'
  },
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  standard: {
    parser: 'babel-eslint'
  }
}
