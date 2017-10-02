import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  devServer: {
    contentBase: 'beta',
    host: '0.0.0.0',
    inline: true,
    stats: { chunkModules: false, colors: true },
  },
  entry: { 
    app: './app/app.js',
    app2: './app/app2.js'
    },
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css') },
      { test: /\.(jpg|png)$/, loader: 'url?limit=8192' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: { presets: ['es2015'] } },
      { test: /\.sass$/, loader: ExtractTextPlugin.extract('style', 'css!sass') },
      { test: /\.pug$/, loader: 'pug-loader'},
    ],
    noParse: /^jquery$/,
  },
  output: {
    filename: '[name].js',
    path: 'dist',
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({ 
      template: './app/index.pug',
      inject: false
      }),
    new HtmlWebpackPlugin({ 
      filename: 'mode2.html',
      template: './app/mode2.pug',
      inject:false
    }),
  ]
}

// vi:et:ts=2
