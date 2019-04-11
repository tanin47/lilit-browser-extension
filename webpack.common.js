const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './src/ts/background.ts',
        options: './src/ts/options.ts',
        popup: './src/ts/popup.ts',
    },
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
            { from: 'manifest.json', to: 'manifest.json' }
        ])
    ]
};
