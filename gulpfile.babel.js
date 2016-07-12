import gulp from 'gulp'
import babel from 'gulp-babel'
import rename from 'gulp-rename'
import insert from 'gulp-insert'
import chmod from 'gulp-chmod'
import {Server} from './es6/server-es6.js'
gulp.task("compile" , () => {
  return gulp.src("es6/do-es6.js")
    .pipe(babel())
	  .pipe(insert.prepend('#!/usr/local/bin/node\n'))
	  .pipe(rename('do'))
	  .pipe(chmod(755))
	  .pipe(gulp.dest("dist"))
})
gulp.task('server', ()=>{
  Server()
})
gulp.task('watch',()=>{
  gulp.watch('./es6/*.js',['compile'])
})
gulp.task('default',['compile','server','watch'],()=>{
  console.log('HAHAHA')
})

// vi:et:ts=2
