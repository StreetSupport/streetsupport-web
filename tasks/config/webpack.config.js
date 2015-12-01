var argv    = require('yargs').argv;
var webpack = require('webpack');

// Create plugins array
var plugins = [
  new webpack.ProvidePlugin({
     $: "jquery",
     jQuery: "jquery"
  })
];

// Add Uglify task to plugins array if there is a production flag
if (argv.production) {
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  entry: ['./src/js/global.js', './src/js/app.js'],
  output: {
    filename: './_dist/assets/js/bundle.js',
  },
  plugins: plugins,
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'standard',
        exclude: /(node_modules|bower_components)/
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      }
    ],
  },
  standard: {
    parser: 'babel-eslint'
  }
};
