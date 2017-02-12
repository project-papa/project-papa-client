const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: `${__dirname}/src`,
  entry: {
    main: './main',
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].[hash].js',
  },
  devtool: '#source-map',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      src: path.resolve('src'),
    },
  },
  plugins: [new HtmlWebpackPlugin({
    template: path.resolve('index.template.ejs'),
  })],
};
