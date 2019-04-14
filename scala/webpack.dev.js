const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './target/dev'
  },
  output: {
    path: path.resolve(__dirname, 'target', 'dev')
  },
  plugins: [
    new webpack.DefinePlugin({
      __HOST__: JSON.stringify('http://localhost:9000')
    })
  ]
});