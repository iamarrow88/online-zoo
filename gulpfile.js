const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');


function styles() {
  return src('app/scss/**/*.scss', { 'allowEmpty': true })
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src('app/js/index.js', { 'allowEmpty': true })
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function cleanDist() {
  return src('dist', { read: false, 'allowEmpty': true })
    .pipe(clean())
}

function images() {
  return src([
    'app/images/src/*.*',
    '!app/images/src/*.svg'
  ])
    .pipe(newer('app/images'))
    .pipe(avif({ quality: 50 }))
    .pipe(src([
      'app/images/src/*.*',
      '!app/images/src/*.svg'
    ]))
    .pipe(newer('app/images'))
    .pipe(webp())
    .pipe(src([
      'app/images/src/*.*',
      '!app/images/src/*.svg'
    ]))
    .pipe(newer('app/images'))
    .pipe(imagemin())
    .pipe(dest('app/images'))
}

function toWebp() {
  return src([
    'app/images/src/*.*',
    '!app/images/src/*.svg'
  ])
    .pipe(webp())
    .pipe(dest('app/images/dist'))
}

function sprite() {
  return src('app/images/src/*.svg', { 'allowEmpty': true })
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('app/images'))
}

function fonts() {
  return src('app/fonts/src/*.*', { 'allowEmpty': true })
    .pipe(fonter({
      formats: ['woff', 'ttf']
    }))
    .pipe(src('app/fonts/*.ttf'), { 'allowEmpty': true })
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'), { 'allowEmpty': true })
}

function pages() {
  return src('app/pages/*.html', { 'allowEmpty': true })
    .pipe(include({
      includePaths: 'app/components'
    }))
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}

function watching() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
    port: 8080,
  });
  watch(['app/scss/style.scss'], styles)
  watch(['app/images/src'], images)
  watch(['app/js/index.js'], scripts)
  watch(['app/components/*', 'app/pages/*'], pages)
  watch(['app/*.html']).on('change', browserSync.reload) // app/**/*.html - все файлы html, не только в корне */
}

function building() {
  return src([
    /* 'app/css/style.min.css',
    'app/images/*.*',
    '!app/images/*.svg',
    'app/images/sprite.svg',
    'app/fonts/*.*',
    'app/js/index.min.js',*/
    'app/**/*.*',
    '!app/components/**/*.html',
    '!app/fonts/src/*.*',
    '!app/images/src/*.*',
    '!app/images/**/*.svg',
    'app/images/sprite.svg',
    '!app/js/index.js',
    '!app/scss/**/*.*s',

  ], { 'allowEmpty': true }, { base: 'app' })
    .pipe(dest('dist'))
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;
exports.sprite = sprite;
exports.images = images;
exports.toWebp = toWebp;
exports.fonts = fonts;
exports.pages = pages;
exports.build = series(cleanDist, building);

exports.default = parallel(styles, scripts, pages, watching);