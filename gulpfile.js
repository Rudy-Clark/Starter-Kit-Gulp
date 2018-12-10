// import packages;
const autoprefixer = require('gulp-autoprefixer');
const BrowserSync = require('browser-sync');
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const g_if = require('gulp-if');
const minifyCss = require('gulp-clean-css');
const pug = require('gulp-pug');
const pngquant = require('imagemin-pngquant');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

//reference to reload method BrowserSync
const reload = BrowserSync.reload;

// sass compiler
sass.compiler = require('node-sass');

const PATH = {
    build: {
        html: './build/',
        js: './build/js/',
        css: './build/css/',
        img: './build/images/',
        font: './build/fonts/'
    },
    src: {
        pug: './src/pug/**/*.pug',
        img: './src/images/*.+(jpg|png|svg)',
        js: './src/js/**/*.js',
        sass: './src/styles/**/*.scss',
        font: './src/fonts/*.+(ttf|woff|woff2|svg|eot)'
    },
    clean: {
        build: './build'
    }
}


const isProd = false;
const useBabel = false;

const {src, dest, series, parallel, watch} = gulp;

// development server 
function Serve(cb){
    BrowserSync({
        server: {
            baseDir: './build'
        },
        tunnel: false,
        port: 8080,
        logPrefix: 'Rent-Cars',
        host: 'localhost'
    });
}

// sass styles compilation to css3
function Sass(cb){
    return src(PATH.src.sass, {sourcemaps: true})
        .pipe(sass({
            includePaths: require('node-reset-scss').includePath,
            includePaths: require('node-normalize-scss').includePaths
        }))
        .pipe(autoprefixer('last 5 versions', 'firefox', '> 1%', 'ie 9'))
        .pipe(g_if(isProd, minifyCss()
        ))
        .pipe(g_if(isProd,rename({extname: '.min.css'})))
        .pipe(dest(PATH.build.css, {sourcemaps: '.'}))
        .pipe(reload({stream: true}));
}

// pug
function Html(cb){
    return src(PATH.src.pug, {sourcemaps: true})
        .pipe(pug({pretty: true}))
        .pipe(dest(PATH.build.html))
        .pipe(reload({stream: true}))
}

// minify images
function Image(cb){
    return src(PATH.src.img)
        .pipe(imagemin({ 
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()],
            interlaced: true
            })
        )
        .pipe(dest(PATH.build.img))
        .pipe(reload({stream: true}));
}

//minify js
function Babel(cb){
    return src(PATH.src.js, {sourcemaps: true})
        .pipe(g_if(useBabel, babel()))
        .pipe(concat('bundle.js'))
        .pipe(g_if(isProd, uglify()))
        .pipe(rename({extname: '.min.js'}))
        .pipe(dest(PATH.build.js, {sourcemaps: '.'}))
        .pipe(reload({stream: true}));
}

//fonts
function Fonts(cb){
    return src(PATH.src.font)
        .pipe(dest(PATH.build.font))
        .pipe(reload({stream: true}));
}

// clean build dir
function Clean(cb){
    return del(PATH.clean.build)
}

// watchers for build task
watch(PATH.src.pug, Html);
watch(PATH.src.js, Babel);
watch(PATH.src.sass, Sass);
watch(PATH.src.img, Image);
watch(PATH.src.font, Fonts);

exports.default = series(Clean, parallel(Babel, Sass, Html, Image, Fonts), Serve);
exports.serve = Serve;
exports.clean = Clean;