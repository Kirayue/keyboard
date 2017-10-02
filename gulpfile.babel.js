/* eslint new-cap:['error',{capIsNewExceptions:[Do]}], no-console:0,
   arrow-body-style:0, global-require:0 */
import fs from 'fs'
import gulp from 'gulp'
import gulpChmod from 'gulp-chmod'
import gulpInsert from 'gulp-insert'
import gulpRename from 'gulp-rename'
import gulpUtil from 'gulp-util'
import webpack from 'webpack'
import webpackConfig from './webpack.config.babel.js'
const dist = 'dist'

gulp.task('do', () => {
  return gulp.src('do2.js')
    .pipe(require('gulp-babel')())
    .pipe(gulpInsert.prepend('#!/usr/local/bin/node\n'))
    .pipe(gulpRename('do2.njs'))
    .pipe(gulpChmod(755))
    .pipe(gulp.dest(dist))
})

gulp.task('server', ['do', 'webpack'], () => {
  const Do = require('./do2')
  const express = require('express')
  const bodyParser = require('body-parser')
  const server = express()
  server.use(bodyParser.urlencoded({ extended: false }))
  server.use(bodyParser.json())
  server.post('/do2.njs', (req, res) => {
    // console.log(req.body.trial)
    Do(req.body, res)
    res.end()
  })
  server.use(express.static(dist))
  fs.readFile('port', { encoding: 'utf-8' }, (err, _port = 8080) => {
    const port = parseInt(_port, 10)
    server.listen(port, () => {
      console.log(`Express Server Port:${port}`)
    })
  })
})

gulp.task('watch', () => {
  gulp.watch('app/*', ['webpack'])
})

gulp.task('webpack', (cb) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) throw new gulpUtil.PluginError('webpack', err)
    gulpUtil.log('[webpack]', stats.toString({ colors: true }))
    cb()
  })
})

gulp.task('default', ['server', 'watch'])

// vi:et:sw=2:ts=2
