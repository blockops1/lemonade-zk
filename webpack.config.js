const path = require('path');

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
  devtool: 'source-map'
}; 