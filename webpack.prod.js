const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'production',
    devtool: '',
    output: {
        path: path.resolve(__dirname, 'dist', 'prod')
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new webpack.DefinePlugin({
            __HOST__: JSON.stringify('https://sorceress-staging.herokuapp.com')
        })
    ]
});
