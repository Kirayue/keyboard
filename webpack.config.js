var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: {
    contentBase: 'dist',
    host: '0.0.0.0',
    inline: true,
    stats: {chunkModules: false, colors: true},
  },
  entry:'./index.js',
	output: {
	  filename: 'app.js',
    path: 'dist',
	},
	module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
			{ test: /\.(jpg|png)$/, loader: 'url?limit=8192' },
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.sass$/, loader: 'style!css!sass' },
		],
	},
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
  ]
};

// vi:et:sw=2:ts=2
