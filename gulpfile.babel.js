import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import buffer from 'vinyl-buffer'
import source from 'vinyl-source-stream'
import browserify from 'browserify'
import babelify from 'babelify'

const plugins = gulpLoadPlugins()

const transform = (env) => {
  let transformSource = browserify({
    entries: './src/javascript/sjfScroll.js',
    standalone: 'SjfScroll',
    transform: babelify,
    debug: env === 'dev' ? true : false
  })
    .bundle()
    .pipe(source('SjfScroll.js'))
    .pipe(buffer())

  let result = transformSource
  if (env === 'dev') {
    result = result.pipe(gulp.dest('build/'))
  } else {
    result = result
                .pipe(plugins.uglify())
                .pipe(plugins.rename('./sjfScroll.min.js'))
                .pipe(gulp.dest('dist/'))
  }

  return result
}

// server处理
gulp.task('dev', function () {
  gulp.watch(['src/javascript/*.js'], ['transform']);
})

// js处理
gulp.task('transform', function () {
  return transform('dev')
})

gulp.task('build', function () {
  return transform('prod')
})

gulp.task('default', ['build'])
