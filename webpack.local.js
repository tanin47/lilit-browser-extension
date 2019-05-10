const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path')
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const env = 'local'

const jsSourceDir = './target/generated-js-source/' + env;

module.exports = merge(common, {
  entry: {
    background: path.resolve(jsSourceDir, 'background.js'),
    content: path.resolve(jsSourceDir, 'content.js'),
    popup: path.resolve(jsSourceDir, 'popup.js'),
    'modify-path': path.resolve(jsSourceDir, 'modify-path.js')
  },
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'target', env)
  },
});