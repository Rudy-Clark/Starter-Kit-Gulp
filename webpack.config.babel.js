
import path from 'path'
import webpack from 'webpack'

import { browsers } from './gulpfile.babel'

const stats = {
    hash: false,
    version: false,
    timings: false,
    assets: true,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: true,
    errorDetails: true,
    warnings: true,
    publicPath: false
}

export default {
    devtool: 'source-map',
    entry: './src/js/main.js',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/js/'),
        publicPath: './build/js/',
        sourceMapFilename: '[name].map.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: [['env', {
                    modules: false,
                    targets: { browsers }
                }]]
            }
        }]
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src/js/')
        }
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            mangle: false,
            compressor: {
                warnings: false,
                screw_ie8: true
            },
            output: {
                comments: false
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],
    stats
}
