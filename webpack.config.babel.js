import { config } from 'dotenv'
import path from 'path'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'

config()
const entry = process.env.JS ? `./src/js/${process.env.JS}` : './src/js/main'

export default {
  mode: process.env.NODE_ENV,
  entry,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin()
    ]
  }
}
