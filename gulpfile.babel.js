/* eslint-disable no-console */
import fs from 'fs'
import gulp from 'gulp'
import gulpChmod from 'gulp-chmod'
import gulpInsert from 'gulp-insert'
import gulpRename from 'gulp-rename'
import gulpUtil from 'gulp-util'
import webpack from 'webpack'
import webpackConfig from './webpack.config.babel.js'
let dist = 'dist'

gulp.task('do', () => {
  return gulp.src('do.js')
    .pipe(require('gulp-babel')())
    .pipe(gulpInsert.prepend('#!/usr/local/bin/node\n'))
    .pipe(gulpRename('do'))
    .pipe(gulpChmod(755))
    .pipe(gulp.dest(dist))
})

gulp.task('server', ['do', 'webpack'], () => { 
  let Do = require('./do')
  let express = require('express')
  let bodyParser = require('body-parser')
  let server = express()
  server.use(bodyParser.urlencoded({extended:false}))
  server.use(bodyParser.json())
  server.post('/do', (req, res) => {
    //console.log(req.body.trial)
    Do(req.body, res)
    res.end()
  })
  server.use(express.static(dist))
  fs.readFile('port', {encoding: 'utf-8'}, (err, port) => {
    port = parseInt(port) || 8080
    server.listen(port, () => { console.log('Port: '+port) })
  })
})

gulp.task('watch', () => {
  gulp.watch('app/*', ['webpack'])
})

gulp.task('webpack', (cb) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) throw new gulpUtil.PluginError('webpack', err)
    gulpUtil.log('[webpack]', stats.toString({colors: true}))
    cb()
  })
})

gulp.task('default', ['server','watch'])

// vi:et:sw=2:ts=2
