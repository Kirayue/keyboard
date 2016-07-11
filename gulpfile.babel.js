import gulp from 'gulp'
import babel from 'gulp-babel'
import rename from 'gulp-rename'
import {Server} from './es6/server-es6.js'
gulp.task("compile",['server'] , () => {
  return gulp.src("es6/do-es6.js")
      .pipe(babel())
	  .pipe(rename('do.js'))
	  .pipe(gulp.dest("dist"))
})
gulp.task('server', function(){
    Server()
})
gulp.task('default',()=>{
    console.log('HAHAHA')
})
