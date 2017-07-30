'use strict';

const webpack = require('webpack');
const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader')
const NunjucksPreprocessPlugin = require('./webpack-plugins/nunjucks-preprocessor');
const WatchIgnorePlugin = require('watch-ignore-webpack-plugin');
const FileWatcherPlugin = require("file-watcher-webpack-plugin");

const clientPath = __dirname
const buildPath = `${clientPath}/www/scripts/`

module.exports = {
  devtool: 'source-map',
  entry: {
    app: [
      `${clientPath}/src/index.tsx`
      ]
  },
  output: {
    path: `${buildPath}/`,
    publicPath: 'scripts/',
    filename: '[name].js',
  },
  plugins: [
    new CheckerPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1
      },
    }),
    new NunjucksPreprocessPlugin(),
    new WatchIgnorePlugin([
        path.resolve(__dirname, './src/game/defs.ts'),
    ]),
    new FileWatcherPlugin({
        root: path.resolve(__dirname, './src/game/components/'),
        files: ['*.component']
    })
    ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: 'source-map-loader',
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: 'source-map-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: `${clientPath}/tsconfig.json`,
        },
      },
      {
        test: /\.js$/,
        exclude: path.join(__dirname, 'node_modules'),
        loaders: ['babel']
      },
      {
        test: /\.json$/,
        include: path.join(__dirname, 'node_modules', 'pixi.js'),
        loader: 'json'
      },
      {
        enforce: 'post',
        loader: 'transform-loader?brfs'
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules', 'src'],
  },
};