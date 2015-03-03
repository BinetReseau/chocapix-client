'use strict';

var gulp = require('gulp');
var fs = require('fs');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('scripts', function () {
  return gulp.src('app/**/*.js')
//    .pipe($.jshint())
//    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.size());
});

gulp.task('partials', function () {
  return gulp.src('app/**/*.html')
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      loose: true
    }))
    .pipe($.ngHtml2js({
      moduleName: 'barsApp'
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size());
});

gulp.task('html', ['wiredep', 'scripts', 'partials'], function () {
  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets;

  fs.writeFile('dist/version.json', JSON.stringify({build_date: new Date()}));

  return gulp.src('app/*.html')
    .pipe($.inject(gulp.src('.tmp/**/*.js'), {
      read: false,
      starttag: '<!-- inject:partials -->',
      addRootSlash: false,
      addPrefix: '../'
    }))

    .pipe(assets = $.useref.assets())
    .pipe($.rev())

    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())

    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())

    .pipe(assets.restore())

    .pipe($.useref())
    .pipe($.revReplace())

    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())

    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src('app/assets/img/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/assets/img'))
    .pipe($.size());
});

gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

gulp.task('misc', function () {
  return gulp.src('app/*.{ico,png}')
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('clean', function (done) {
  $.del(['.tmp', 'dist'], done);
});

gulp.task('build', ['html', 'images', 'fonts', 'misc']);
