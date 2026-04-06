const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',  // точка входа
  output: {
    filename: 'bundle.[contenthash].js',  // пока bundle.js
    path: path.resolve(__dirname, 'build'),  // абсолютный путь к папке build
    clean: true,  // очистка папки перед сборкой
  },
  devtool: 'source-map',  // генерация source maps
    module: {
    rules: [
      {
        test: /\.js$/,  // применяем к файлам .js
        exclude: /node_modules/,  // исключаем node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // путь к вашему HTML-шаблону
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: 'build',
          globOptions: {
            ignore: ['**/index.html'],  // исключаем index.html из копирования (его создаёт HtmlWebpackPlugin)
        },
        },
      ],
    }),
  ],
};