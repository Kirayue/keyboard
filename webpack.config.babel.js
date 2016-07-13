import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from "extract-text-webpack-plugin"
export default {
  devServer: {
    contentBase: 'dist',
    host: '0.0.0.0',
    inline: true,
    stats: { chunkModules: false, colors: true },
  },
  entry:'./app/app.js',
	output: {
	  filename: 'app.js',
    path: 'dist',
	},
	module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
			{ test: /\.(jpg|png)$/, loader: 'url?limit=8192' },
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: { presets: ['es2015'] } },
      { test: /\.sass$/, loader: 'style!css!sass' },
      { test: /\.pug$/, loader:'pug-html-loader'}
		],
	},
  plugins: [
    new ExtractTextPlugin("[name].css"),
    new HtmlWebpackPlugin({ template: './app/index.pug' }),
  ]
};

// vi:et:sw=2:ts=2
