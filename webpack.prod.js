const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    devtool: '',
    output: {
        path: path.resolve(__dirname, 'dist', 'production')
    }
});
