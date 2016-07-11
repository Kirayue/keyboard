import gulp from 'gulp'

/*gulp.task('server', function(){
  var express, expressServer;
  express = require('express');
  expressServer = express();
  expressServer.get('/do', function(req, res){
    Do(req._parsedUrl.query, res);
  });
  expressServer.use(express['static'](paths.dest));
  expressServer.listen(opt.port);
  gulpUtil.log("Listening on port: " + opt.port);
});*/
gulp.task('other',()=>{
    console.log('Second!!');
});
gulp.task('default',()=>{
    console.log('HAHAHA');
});
