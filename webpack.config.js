var webpack = require('webpack');

module.exports = {
    entry:'./index.js',
	output:{
	      filename:'bundle.js'
	},
	module:{
	    loaders:[
		     {test:/\.css/,loader:'style-loader!css-loader'},
			 {test:/\.js/,exclude:/node_modules/,loader:'babel-loader'},
			 {test:/\.(png|jpg)$/,loader:'url-loader?limit=8192'}
		]
	},
/*	plugins:[
	  new webpack.ProvidePlugin({
	      $:'jquery',
		  jQuery:'jquery',
		  "window.jQuery":'jquery'
	  })
	]*/
};
