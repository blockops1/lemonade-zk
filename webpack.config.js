const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: '/',
    assetModuleFilename: (pathData) => {
      const filepath = path.dirname(pathData.filename).split('/').slice(1).join('/');
      return `${filepath}/[name].[hash][ext]`;
    },
    globalObject: 'this',
    chunkFilename: '[name].[contenthash].js'
  },
  devtool: process.env.NODE_ENV === 'production' 
    ? 'hidden-source-map'  // Production: separate file, less detailed
    : 'eval-cheap-module-source-map',  // Development: faster builds, less detailed
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      minSize: 20000,
      maxSize: 50000,
      cacheGroups: {
        wasm: {
          test: /\.wasm$/,
          type: 'asset/resource',
          priority: 40,
          filename: 'wasm/[name].[contenthash][ext]',
          maxSize: 2000000 // 2MB max size for WASM chunks
        },
        noir: {
          test: /[\\/]node_modules[\\/](@noir-lang)[\\/]/,
          name: 'noir-vendor',
          chunks: 'all',
          priority: 20,
          enforce: true,
          maxSize: 5000000 // 5MB max size for Noir chunks
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          maxSize: 1000000 // 1MB max size for vendor chunks
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/resource',
        generator: {
          filename: 'wasm/[name].[hash][ext]'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true,
            sourceType: 'unambiguous'
          }
        },
        type: 'javascript/auto'
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]'
        }
      }
    ]
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
    topLevelAwait: true
  },
  resolve: {
    extensions: ['.js', '.wasm'],
    fallback: {
      crypto: false,
      path: false,
      fs: false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inject: true,
      filename: 'index.html',
      minify: process.env.NODE_ENV === 'production' ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      } : false
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      watch: true,
      staticOptions: {
        contentType: 'application/javascript'
      }
    },
    devMiddleware: {
      writeToDisk: true,
    },
    historyApiFallback: true,
    port: 9000,
    hot: true,
    compress: true,
    client: {
      overlay: true,
      progress: true
    }
  },
  stats: {
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  },
  performance: {
    maxAssetSize: 10000000, // 10MB
    maxEntrypointSize: 10000000, // 10MB
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false
  }
}; 