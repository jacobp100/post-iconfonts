const webpack = require('webpack');
const { join } = require('path');

module.exports = {
  context: __dirname,
  entry: join(__dirname, 'app/index.js'),
  devtool: 'source-map',
  output: {
    filename: join(__dirname, 'dist/index.js'),
    library: 'post-iconfonts',
    libraryTarget: 'umd',
  },
  externals: {
    fs: 'var', // postcss wants fs, but doesn't actually use it
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
  ],
};
