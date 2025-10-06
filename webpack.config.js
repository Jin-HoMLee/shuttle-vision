const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      background: path.join(__dirname, 'src', 'background', 'background.ts'),
      content: path.join(__dirname, 'src', 'content', 'content.ts'),
      popup: path.join(__dirname, 'src', 'popup', 'popup.ts'),
      options: path.join(__dirname, 'src', 'options', 'options.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name]/[name].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name]/[name].css',
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'popup', 'popup.html'),
        filename: path.join('popup', 'popup.html'),
        chunks: ['popup'],
        inject: 'body',
        scriptLoading: 'defer',
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'options', 'options.html'),
        filename: path.join('options', 'options.html'),
        chunks: ['options'],
        inject: 'body',
        scriptLoading: 'defer',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'src', 'manifest.json'),
            to: 'manifest.json',
          },
          {
            from: path.join(__dirname, 'src', 'assets'),
            to: 'assets',
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    devtool: isProduction ? false : 'inline-source-map',
    mode: isProduction ? 'production' : 'development',
    optimization: {
      minimize: isProduction,
    },
  };
};
