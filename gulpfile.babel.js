import autoprefix from 'autoprefixer'
import BrowserSync from 'browser-sync'
import cssnano from 'cssnano'
import del from 'del'
import gulp, { task as Task, watch as Watch } from 'gulp'
import imagemin from 'gulp-imagemin'
import pug from 'gulp-pug'
import svgo from 'gulp-svgo'
import postcss from 'gulp-postcss'
import postScss from 'postcss-scss'
import postReporter from 'postcss-reporter'
import cache from 'gulp-cached'
import changed from 'gulp-changed'
import webpack from 'webpack'
import rename from 'gulp-rename'
import sass from '@csstools/postcss-sass'
import gIf from 'gulp-if'
import { config } from 'dotenv'

import webpackConfig from './webpack.config.babel.js'

config()
const isProd = process.env.NODE_ENV === 'production'
const { reload } = BrowserSync

Task('BrowserSync', () => {
  BrowserSync({
    server: {
      baseDir: './build'
    },
    tunnel: false,
    port: 8080,
    host: 'localhost'
  })
})

Task('jpg', () => {
  const from = './src/images/**/*.jpg'
  const to = './build/images/'
  return gulp.src(from)
    .pipe(changed(to))
    .pipe(cache('jpg'))
    .pipe(gIf(isProd, imagemin()))
    .pipe(gulp.dest(to))
    .pipe(reload({ stream: true }))
})

Task('png', () => {
  const from = './src/images/**/*.png'
  const to = './build/images/'
  return gulp.src(from)
    .pipe(changed(to))
    .pipe(cache('png'))
    .pipe(gIf(isProd, imagemin()))
    .pipe(gulp.dest(to))
    .pipe(reload({ stream: true }))
})

Task('svg', () => {
  const from = './src/images/**/*.svg'
  const to = './build/images/'
  return gulp.src(from)
    .pipe(changed(to))
    .pipe(cache('svg'))
    .pipe(svgo())
    .pipe(gulp.dest(to))
    .pipe(reload({ stream: true }))
})

Task('gif', () => {
  const from = './src/images/**/*.gif'
  const to = './build/images/'
  return gulp.src(from)
    .pipe(changed(to))
    .pipe(cache('gif'))
    .pipe(gIf(isProd, imagemin()))
    .pipe(gulp.dest(to))
    .pipe(reload({ stream: true }))
})

Task('images', gulp.parallel('jpg', 'png', 'svg', 'gif'))

Task('fonts', () => {
  const from = './src/fonts/**/*.+(ttf|woff|woff2|svg|eot)'
  const to = './build/fonts/'
  return gulp.src(from)
    .pipe(changed(to))
    .pipe(cache('fonts'))
    .pipe(gulp.dest(to))
})

Task('pug', () => {
  const from = './src/pug/**/*.pug'
  const to = './build/'
  return gulp.src(from, { sourcemaps: true })
    .pipe(changed(to))
    .pipe(cache('pug'))
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(to))
    .pipe(reload({ stream: true }))
})

Task('styles', () => {
  const from = './src/styles/**/*.scss'
  const to = './build/styles/'

  const devProcess = [
    sass(),
    autoprefix(),
    postReporter({
      clearMessage: true,
      throwError: true })
  ]
  const prodProcess = [
    sass(),
    autoprefix(),
    cssnano()
  ]

  return gulp.src(from, { sourcemaps: true })
    .pipe(changed(to))
    .pipe(cache('styles'))
    .pipe(postcss(isProd ? prodProcess : devProcess, { syntax: postScss }))
    .pipe(rename({ extname: '.css' }))
    .pipe(gulp.dest(to, { sourcemaps: '.' }))
    .pipe(reload({ stream: true }))
})

Task('scripts', () => {
  return new Promise((resolve, reject) => {
    try {
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          throw new Error(err)
        }
        console.log(stats.toString({
          chunks: false,
          colors: true
        }))
        resolve(stats)
        reload({ stream: true })
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
})

Task('clean', () => {
  return del('./build')
})

const pathToImages = './src/images/'
Watch(pathToImages + '**/*.jpg', gulp.series('jpg'))
Watch(pathToImages + '**/*.png', gulp.series('png'))
Watch(pathToImages + '**/*.svg', gulp.series('svg'))
Watch(pathToImages + '**/*.gif', gulp.series('gif'))

Watch('./src/fonts/**/*.+(ttf|woff|woff2|svg|eot)', gulp.series('fonts'))
Watch('./src/styles/**/*.scss', gulp.series('styles'))
Watch('./src/js/**/*.js', gulp.series('scripts'))
Watch('./src/pug/**/*.pug', gulp.series('pug'))

Task('build', gulp.series('clean', gulp.parallel('images', 'styles', 'scripts', 'pug', 'fonts')))

Task('default', gulp.series('build', 'BrowserSync'))
