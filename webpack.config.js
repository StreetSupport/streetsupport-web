var argv = require('yargs').argv
var path = require('path')
var webpack = require('webpack')
var CommonsChunkPlugin = require(path.join(__dirname, '/node_modules/webpack/lib/optimize/CommonsChunkPlugin'))
let theSourcemap

// Create plugins array
var plugins = [
  new CommonsChunkPlugin({
    name: 'common',
    filename: 'commons.js',
    minChunks: 2
  })
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
    hub: path.join(__dirname, '/src/js/page-hub'),
    supporters: path.join(__dirname, '/src/js/page-supporters'),
    generic: path.join(__dirname, '/src/js/page-generic'),
    findhelp: path.join(__dirname, '/src/js/page-find-help'),
    category: path.join(__dirname, '/src/js/page-category'),
    categorybyday: path.join(__dirname, '/src/js/page-category-by-day'),
    categorybylocation: path.join(__dirname, '/src/js/page-category-by-location'),
    organisation: path.join(__dirname, '/src/js/page-organisation'),
    'donate-v2': path.join(__dirname, '/src/js/pages/donate/app'),
    'all-organisations-v2': path.join(__dirname, '/src/js/pages/all-organisations/app'),
    'all-organisations-v2-map': path.join(__dirname, '/src/js/pages/all-organisations/map/app'),
    giverequests: path.join(__dirname, '/src/js/pages/give-help/needs/app'),
    requestDetails: path.join(__dirname, '/src/js/pages/give-help/needs/request/app'),
    sponsor: path.join(__dirname, '/src/js/page-sponsor'),
    volunteer: path.join(__dirname, '/src/js/page-volunteer'),
    offeritems: path.join(__dirname, '/src/js/pages/give-help/offer-items/app'),
    joinstreetsupport: path.join(__dirname, '/src/js/page-join-street-support'),
    register: path.join(__dirname, '/src/js/page-register'),
    'location-home-page': path.join(__dirname, 'src/js/pages/locations/app'),
    emergencyhelp: path.join(__dirname, 'src/js/page-advice'),
    swep: path.join(__dirname, 'src/js/page-swep'),
    emergencyHelpRedirect: path.join(__dirname, 'src/js/page-advice-redirect'),
    swepRedirect: path.join(__dirname, 'src/js/page-swep-redirect'),
    impact: path.join(__dirname, 'src/js/page-impact'),
    bestpracticeawardsapply: path.join(__dirname, 'src/js/pages/best-practice/awards/page-apply'),
    bestpracticeenquiries: path.join(__dirname, 'src/js/pages/best-practice/page-enquiries'),
    contact: path.join(__dirname, 'src/js/pages/contact/app'),
    accomAdvice: path.join(__dirname, 'src/js/pages/accommodation/advice/app'),
    accomListing: path.join(__dirname, 'src/js/pages/accommodation/listing/app'),
    accomMap: path.join(__dirname, 'src/js/pages/accommodation/map/app'),
    accomDetails: path.join(__dirname, 'src/js/pages/accommodation/details/app')
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
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  standard: {
    parser: 'babel-eslint'
  }
}
