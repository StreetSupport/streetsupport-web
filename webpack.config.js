var argv = require('yargs').argv
var path = require('path')
var webpack = require('webpack')
var CommonsChunkPlugin = require(path.join(__dirname, '/node_modules/webpack/lib/optimize/CommonsChunkPlugin'))
let theSourcemap

// Create plugins array
var plugins = [
  new CommonsChunkPlugin('commons.js')
]

// Add Uglify task to plugins array if there is a production flag
// If not production, generate sourcemap
if (argv.production) {
  plugins.push(new webpack.optimize.UglifyJsPlugin())
  theSourcemap = ''
}
else {
  theSourcemap = 'source-map'
}

module.exports = {
  entry: {
    home: path.join(__dirname, '/src/js/page-home'),
    generic: path.join(__dirname, '/src/js/page-generic'),
    findhelp: path.join(__dirname, '/src/js/page-find-help'),
    giveHelp: path.join(__dirname, '/src/js/page-give-help'),
    category: path.join(__dirname, '/src/js/page-category'),
    categorybyday: path.join(__dirname, '/src/js/page-category-by-day'),
    organisation: path.join(__dirname, '/src/js/page-organisation'),
    allserviceproviders: path.join(__dirname, '/src/js/page-all-service-providers'),
    giverequests: path.join(__dirname, '/src/js/page-give-requests'),
    sponsor: path.join(__dirname, '/src/js/page-sponsor'),
    volunteer: path.join(__dirname, '/src/js/page-volunteer'),
    offeritems: path.join(__dirname, '/src/js/page-offer-items'),
    joinstreetsupport: path.join(__dirname, '/src/js/page-join-street-support'),
    register: path.join(__dirname, '/src/js/page-register'),
    donate: path.join(__dirname, '/src/js/page-donate'),
    bigchange: path.join(__dirname, 'src/js/pages/manchester/page-big-change'),
    leedsbigchange: path.join(__dirname, 'src/js/pages/leeds/page-big-change'),
    emergencyhelp: path.join(__dirname, 'src/js/page-emergency-help'),
    emergencyHelpRedirect: path.join(__dirname, 'src/js/page-emergency-help-redirect')
  },
  output: {
    path: path.join(__dirname, '/_dist/assets/js/'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/assets/js/'
  },
  devtool: theSourcemap,
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
