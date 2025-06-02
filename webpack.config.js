const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
    clean: true
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(@aztec\/bb\.js|@noir-lang\/backend_barretenberg))/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions']
                }
              }]
            ],
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
        generator: {
          filename: 'wasm/[hash][ext][query]'
        }
      },
      {
        test: /\.json$/,
        type: 'json'
      }
    ]
  },
  externals: {
    '@noir-lang/noir_wasm': 'NoirWasm'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      watch: true
    },
    port: 9000,
    host: 'localhost',
    hot: true,
    liveReload: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true,
      reconnect: true
    },
    watchFiles: ['src/**/*', 'public/**/*'],
    open: true
  },
  resolve: {
    extensions: ['.js', '.wasm', '.mjs', '.json'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),
      "process": require.resolve("process/browser.js"),
      "path": require.resolve("path-browserify"),
      "worker_threads": false,
      "fs": false
    },
    alias: {
      '@aztec/bb.js': path.resolve(__dirname, 'node_modules/@aztec/bb.js/dest/browser/index.js'),
      'process': 'process/browser.js',
      'circuit.json': path.resolve(__dirname, 'zk-proof/lemonade_proof/target/lemonade_proof.json')
    }
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ['console']
    }),
    new webpack.ProvidePlugin({
      process: ['process/browser.js'],
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.browser': true,
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
      'process.env': JSON.stringify(process.env)
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '' },
        {
          from: path.resolve(__dirname, 'node_modules/@noir-lang/noir_wasm/dist/web'),
          to: 'noir_wasm'
        }
      ]
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  stats: {
    colors: true,
    modules: true,
    reasons: true,
    errorDetails: true
  }
}; 