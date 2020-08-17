const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path')


module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.js'
    },
    output: {
        publicPath: '.'
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'createElement' }]]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './publish/index.html',
            filename: 'index.html'
        })
    ]
    
}