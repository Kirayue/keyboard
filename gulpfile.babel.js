import gulp from 'gulp'
import babel from 'gulp-babel'
import rename from 'gulp-rename'
import insert from 'gulp-insert'
import chmod from 'gulp-chmod'
import express from 'express'
import path from 'path'
import fs from 'fs'
import {Do} from './do-es6' //import function
gulp.task("compile" , () => {
  return gulp.src("do-es6.js")
    .pipe(babel())
	  .pipe(insert.prepend('#!/usr/local/bin/node\n'))
	  .pipe(rename('do'))
	  .pipe(chmod(755))
	  .pipe(gulp.dest("dist"))
})
gulp.task('server', ()=>{ 
  let server = express()
  server.get('/',(req,res)=>{
     res.sendFile(path.join(__dirname+'/dist/index.html'))
  })
  server.get('/do',(req,res)=>{
     //console.log(req.body)
    // console.log(req._parsedUrl.query)
    Do(req.query,res)
    res.end()
  })
  server.use(express.static('./dist'))
  let port = parseInt(fs.readFileSync('port', {encoding: 'utf-8'}))
  server.listen(port,()=>{
     console.log(`Port:${port}`)
  })
})
gulp.task('watch',()=>{
  gulp.watch('./es6/*.js',['compile'])
})
gulp.task('default',['compile','server','watch'],()=>{
  console.log('HAHAHA')
})

// vi:et:sw=2:ts=2
