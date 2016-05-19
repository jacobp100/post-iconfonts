module.exports = {
  context: __dirname,
  entry: './webapp/index',
  devtool: 'source-map',
  output: {
    filename: 'dist/index.js',
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
};
