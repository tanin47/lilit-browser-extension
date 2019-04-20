const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  entry: {
    background: './target/generated-dev/background.js',
    content: './target/generated-dev/content.js',
    popup: './target/generated-dev/popup.js'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './target/dev'
  },
  output: {
    path: path.resolve(__dirname, 'target', 'dev')
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/main/resources/config_dev.json', to: 'config.json' }
    ])
  ]
});