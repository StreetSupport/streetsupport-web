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
    'find-help-by-category-v2': path.join(__dirname, '/src/js/pages/find-help/by-category/app'),
    'find-help-by-day-v2': path.join(__dirname, '/src/js/pages/find-help/by-day/app'),
    'find-help-by-location-v2': path.join(__dirname, '/src/js/pages/find-help/by-location/app'),
    organisation: path.join(__dirname, '/src/js/page-organisation'),
    'donate-v2': path.join(__dirname, '/src/js/pages/donate/app'),
    'all-organisations-v2': path.join(__dirname, '/src/js/pages/all-organisations/app'),
    'all-organisations-v2-map': path.join(__dirname, '/src/js/pages/all-organisations/map/app'),
    'find-help-by-client-group': path.join(__dirname, '/src/js/pages/find-help/by-client-group/app'),
    'find-help-by-client-group-map': path.join(__dirname, '/src/js/pages/find-help/by-client-group/by-location/app'),
    'find-help-by-client-group-timetable': path.join(__dirname, '/src/js/pages/find-help/by-client-group/by-day/app'),
    'families-landing-page': path.join(__dirname, '/src/js/pages/families/app'),
    'families-guides': path.join(__dirname, '/src/js/pages/families/guides/app'),
    'families-advice-result': path.join(__dirname, '/src/js/pages/families/advice/result/app'),
    'families-advice': path.join(__dirname, '/src/js/pages/families/advice/app'),
    'give-help': path.join(__dirname, '/src/js/pages/give-help/index/app'),
    giverequests: path.join(__dirname, '/src/js/pages/give-help/needs/app'),
    'giverequests-by-client-group': path.join(__dirname, '/src/js/pages/give-help/by-client-group/needs/app'),
    requestDetails: path.join(__dirname, '/src/js/pages/give-help/needs/request/app'),
    sponsor: path.join(__dirname, '/src/js/page-sponsor'),
    volunteer: path.join(__dirname, '/src/js/page-volunteer'),
    offeritems: path.join(__dirname, '/src/js/pages/give-help/offer-items/app'),
    joinstreetsupport: path.join(__dirname, '/src/js/page-join-street-support'),
    register: path.join(__dirname, '/src/js/page-register'),
    'location-home-page': path.join(__dirname, 'src/js/pages/locations/app'),
    emergencyhelp: path.join(__dirname, 'src/js/page-advice'),
    adviceV2: path.join(__dirname, 'src/js/page-advice-faqs'),
    swep: path.join(__dirname, 'src/js/page-swep'),
    swepRedirect: path.join(__dirname, 'src/js/page-swep-redirect'),
    impact: path.join(__dirname, 'src/js/page-impact'),
    bestpracticeawardsapply: path.join(__dirname, 'src/js/pages/best-practice/awards/page-apply'),
    bestpracticeenquiries: path.join(__dirname, 'src/js/pages/best-practice/page-enquiries'),
    contact: path.join(__dirname, 'src/js/pages/contact/app'),
    accomAdvice: path.join(__dirname, 'src/js/pages/accommodation/advice/app'),
    accomListing: path.join(__dirname, 'src/js/pages/accommodation/listing/app'),
    accomMap: path.join(__dirname, 'src/js/pages/accommodation/map/app'),
    accomDetails: path.join(__dirname, 'src/js/pages/accommodation/details/app'),
    'general-advice': path.join(__dirname, 'src/js/pages/advice/app'),
    'west-mids': path.join(__dirname, 'src/js/pages/west-mids/app'),
    'vol-for-good': path.join(__dirname, 'src/js/pages/vol-for-good/app'),
    'gm': path.join(__dirname, 'src/js/pages/gm/app'),
    'gm-info': path.join(__dirname, 'src/js/pages/gm/info'),
    'gm-offer-items': path.join(__dirname, 'src/js/pages/gm/offer-items')
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
