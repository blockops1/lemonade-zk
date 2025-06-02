const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/game/game.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    compress: true,
    port: 9001,
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      overlay: true,
      progress: true
    }
  },
  devtool: 'source-map',
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "fs": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ]
}; 