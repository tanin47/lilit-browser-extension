const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  entry: {
    background: './target/generated-prod/background.js',
    content: './target/generated-prod/content.js',
    popup: './target/generated-prod/popup.js'
  },
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'target', 'prod')
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/main/resources/config_prod.json', to: 'config.json' },
      { from: 'src/main/resources/manifest_prod.json', to: 'manifest.json' }
    ])
  ]
});