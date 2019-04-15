const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  entry: {
    background: './target/generated/background.js',
    content: './target/generated/content.js',
    popup: './target/generated/popup.js'
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    extensions: [ '.js' ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/main/html/popup.html',
      inject: false
    }),
    new CopyPlugin([
      { from: 'src/main/resources/manifest.json', to: 'manifest.json' }
    ]),
    new WriteFilePlugin()
  ]
};