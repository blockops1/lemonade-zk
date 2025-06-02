const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
    warnings: true,
    assets: true,
    performance: true,
    timings: true,
  },
  infrastructureLogging: {
    level: 'warn',
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  },
  performance: {
    hints: false
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      watch: {
        ignored: [
          '**/node_modules',
          '**/public/wasm',
          '**/dist',
          '**/.git'
        ]
      }
    },
    historyApiFallback: true,
    port: 9000,
    hot: false, // Disable HMR for WASM
    liveReload: false, // Disable live reload for WASM
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
    },
    compress: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000,
  }
}); 