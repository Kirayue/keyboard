import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  devServer: {
    contentBase: 'dist',
    host: '0.0.0.0',
    inline: true,
    stats: { chunkModules: false, colors: true },
  },
  entry:'./app/app.js',
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css') },
      { test: /\.(jpg|png)$/, loader: 'url?limit=8192' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: { presets: ['es2015'] } },
      { test: /\.sass$/, loader: ExtractTextPlugin.extract('style', 'css!sass') },
      { test: /\.pug$/, loader:'pug-html-loader'}
    ],
    noParse: /jquery/,
  },
  output: {
    filename: 'app.js',
    path: 'dist',
  },
  plugins: [
    new ExtractTextPlugin('app.css'),
    new HtmlWebpackPlugin({ template: './app/index.pug' }),
  ]
}

// vi:et:ts=2
