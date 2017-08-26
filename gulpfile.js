var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()
var browserSync = require('browser-sync').create()
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var standalonify = require('standalonify')

// server处理
gulp.task('serve', ['scripts'], function () {
  browserSync.init({
    server: "./",
    port: 6000
  })

  gulp.watch('source/style/*.scss', ['styles']);
  gulp.watch(['source/javascript/*.js'], ['eslint', 'scripts']);
  gulp.watch('source/image/*', ['images']);
  gulp.watch(['lib/js/*.js', 'index.html', 'example/**']).on('change', browserSync.reload);
})

// js处理
gulp.task('scripts', function () {
  return browserify({
    entries: './source/javascript/sjfDataBind.js',
    debug: true
  })
    .plugin(standalonify, { // 此处会被打包成UMD格式，下面的name就是全部变量的名称
      name: ['Sjf', 'SjfDataBind']
    })
    .bundle()
    .on('error', function (err) {
      console.log(err.message)
      this.emit('end')
    }) 
    .pipe(source(getJsLibName()))
    .pipe(buffer())
    .pipe(plugins.uglify())
    .pipe(gulp.dest('lib/js/'))
    .pipe(plugins.notify({ message: 'Scripts task completed' }))
})

function getJsLibName () {
  var libName = 'sjfScroll.min.js'
  return libName
}

// 样式表处理
gulp.task('styles', function () {
  return gulp.src('./source/style/*.scss')
    .pipe(plugins.sass({ style: 'expanded' }))
    .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('./build/css/'))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.minifyCss())
    .pipe(gulp.dest('./build/css/'))
    .pipe(plugins.notify({ message: 'Styles task completed' }))
});

// 图片处理
gulp.task('images', function () {
  return gulp.src('./source/image/*')
    //新建或者修改过的图片才会被压缩(optimizationLevel:3,所有都会被压缩)
    .pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('./lib/img/'))
    .pipe(plugins.notify({ message: 'Images task completed' }))
});

// clean tasks
gulp.task('clean', function (callback) {
  plugins.del(['./lib/js', './build/css'], callback)
});

gulp.task('default', ['serve'])
