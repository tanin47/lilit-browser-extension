const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack');

module.exports = merge(common, {
  entry: {
    'hot-reload': './src/js/hot-reload.js'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist/dev'
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'dev')
  },
  plugins: [
    new webpack.DefinePlugin({
      __HOST__: JSON.stringify('http://localhost:9000')
    })
  ]
});
