const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const glob = require('glob');
const path = require('path');


module.exports = {
    entry: glob.sync('./src/js/*.js').concat(glob.sync('./src/ts/*.ts')).reduce(
      (map, filePath) => {
         map[path.basename(filePath, path.extname(filePath))] = filePath;
         return map;
      },
      {}
    ),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/,
                    /ts-test-project/,
                ]
            }
        ]
    },
    output: {
        filename: '[name].js',
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'options.html',
            template: 'src/html/options.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: 'src/html/popup.html'
        }),
        new CopyPlugin([
            { from: 'src/manifest.json', to: 'manifest.json' }
        ]),
        new WriteFilePlugin()
    ]
};
