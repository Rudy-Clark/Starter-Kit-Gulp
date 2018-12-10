// import packages;
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
import precss from 'precss'
import cache from 'gulp-cached'
import changed from 'gulp-changed'
import webpack from 'webpack'
import rename from 'gulp-rename'

import webpackConfig from './webpack.config.babel.js'

const projectName = 'Gulp-configs'
const { reload } = BrowserSync
const browsers = [
    'last 4 version',
    'not ie <= 11'
]

Task('BrowserSync', () => {
    BrowserSync({
        server: {
            baseDir: './build'
        },
        tunnel: false,
        port: 8080,
        logPrefix: projectName,
        host: 'localhost'
    })
})

Task('jpg', () => {
    const from = './src/images/**/*.jpg'
    const to = './build/images/'
    return gulp.src(from)
        .pipe(changed(to))
        .pipe(cache('jpg'))
        .pipe(imagemin())
        .pipe(gulp.dest(to))
        .pipe(reload({ stream: true }))
})

Task('png', () => {
    const from = './src/images/**/*.png'
    const to = './build/images/'
    return gulp.src(from)
        .pipe(changed(to))
        .pipe(cache('png'))
        .pipe(imagemin())
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
        .pipe(imagemin())
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
    const process = [
        precss(),
        autoprefix({ browsers }),
        cssnano(),
        postReporter({
            clearMessage: true,
            throwError: true })
    ]
    return gulp.src(from, { sourcemaps: true })
        .pipe(changed(to))
        .pipe(cache('styles'))
        .pipe(postcss(process, { syntax: postScss }))
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

Task('build', gulp.parallel('clean', 'images', 'styles', 'scripts'))

Task('watch', gulp.series('build', () => {
    const pathToImages = './src/images/'

    Watch(pathToImages + '**/*.jpg', gulp.series('jpg'))
    Watch(pathToImages + '**/*.png', gulp.series('png'))
    Watch(pathToImages + '**/*.svg', gulp.series('svg'))
    Watch(pathToImages + '**/*.gif', gulp.series('gif'))

    Watch('./src/fonts/**/*.+(ttf|woff|woff2|svg|eot)', gulp.series('fonts'))
    Watch('./src/styles/**/*.scss', gulp.series('styles'))
    Watch('./src/js/**/*.js', gulp.series('scripts'))
    Watch('./src/pug/**/*.pug', gulp.series('pug'))
}))

Task('default', gulp.series('watch', 'BrowserSync'))
// // watchers for build task
// watch(PATH.src.pug, Html);
// watch(PATH.src.js, Babel);
// watch(PATH.src.sass, Sass);
// watch(PATH.src.img, Image);
// watch(PATH.src.font, Fonts);

// exports.default = series(Clean, parallel(Babel, Sass, Html, Image, Fonts), Serve)
// exports.serve = Serve
// exports.clean = Clean
