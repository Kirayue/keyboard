import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import gulpChmod from 'gulp-chmod'
import gulpInsert from 'gulp-insert'
import gulpRename from 'gulp-rename'
import gulpUtil from 'gulp-util'
import express from 'express'
import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import webpackConfig from './webpack.config.babel.js'

let dist = 'dist'

gulp.task('do', () => {
  gulp.src('do.js')
    .pipe(gulpBabel())
	  .pipe(gulpInsert.prepend('#!/usr/local/bin/node\n'))
	  .pipe(gulpRename('do'))
	  .pipe(gulpChmod(755))
	  .pipe(gulp.dest(dist))
})

gulp.task('webpack', () => {
  webpack(webpackConfig, (err, stats) => {
    if(err) throw new gulpUtil.PluginError("webpack", err)
    gulpUtil.log("[webpack]", stats.toString({colors: true}))
  })
})

gulp.task('server', () => { 
  let Do = require('./do')
  let server = express()
  server.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/dist/index.html'))
  })
  server.get('/do',(req,res)=>{
    // console.log(req.body)
    // console.log(req._parsedUrl.query)
    Do(req.query,res)
    res.end()
  })
  server.use(express.static('./dist'))
  fs.readFile('port', {encoding: 'utf-8'}, (err, port)=>{
    port = parseInt(port) || 8888
    server.listen(port,()=>{console.log(`Port:${port}`)})
  })
})

gulp.task('watch', () => {
  gulp.watch('./es6/*.js',['compile'])
})

gulp.task('default', ['do','webpack','server','watch'])

// vi:et:sw=2:ts=2
