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
    supporters: path.join(__dirname, '/src/js/page-supporters'),
    generic: path.join(__dirname, '/src/js/page-generic'),
    findhelp: path.join(__dirname, '/src/js/page-find-help'),
    giveHelp: path.join(__dirname, '/src/js/page-give-help'),
    category: path.join(__dirname, '/src/js/page-category'),
    categorybyday: path.join(__dirname, '/src/js/page-category-by-day'),
    categorybylocation: path.join(__dirname, '/src/js/page-category-by-location'),
    organisation: path.join(__dirname, '/src/js/page-organisation'),
    allserviceproviders: path.join(__dirname, '/src/js/page-all-service-providers'),
    giverequests: path.join(__dirname, '/src/js/pages/give-help/needs/app'),
    requestDetails: path.join(__dirname, '/src/js/pages/give-help/needs/request/app'),
    sponsor: path.join(__dirname, '/src/js/page-sponsor'),
    volunteer: path.join(__dirname, '/src/js/page-volunteer'),
    offeritems: path.join(__dirname, '/src/js/page-offer-items'),
    joinstreetsupport: path.join(__dirname, '/src/js/page-join-street-support'),
    register: path.join(__dirname, '/src/js/page-register'),
    donate: path.join(__dirname, '/src/js/page-donate'),
    bigchange: path.join(__dirname, 'src/js/pages/manchester/page-big-change'),
    leedsbigchange: path.join(__dirname, 'src/js/pages/leeds/page-big-change'),
    emergencyhelp: path.join(__dirname, 'src/js/page-emergency-help'),
    swep: path.join(__dirname, 'src/js/page-swep'),
    emergencyHelpRedirect: path.join(__dirname, 'src/js/page-emergency-help-redirect'),
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
      }
    ]
  },
  standard: {
    parser: 'babel-eslint'
  }
}
