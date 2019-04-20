const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
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
      { from: 'src/main/images', to: 'images' }
    ])
  ]
};