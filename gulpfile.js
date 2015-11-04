var gulp = require('gulp');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var header = require('gulp-header');
var complexity = require('gulp-complexity');
var ngAnnotate = require('gulp-ng-annotate');

var banner = ['/**',
    ' * Tasks',
    ' * (c) 2015 Gaëtan Covelli',
    ' * Last Updated: <%= new Date().toUTCString() %>',
    ' */',
    ''].join('\n');

gulp.task('minify', function() {
    return gulp.src([
    	'public/vendor/md5.min.js',
        'public/app.js'
    ])
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(header(banner))
        .pipe(gulp.dest('public'));
});

gulp.task('complexity', function() {
    return gulp.src([
        'public/app.js'
    ])
        .pipe(complexity());
});

gulp.task('styles', function() {
  gulp.src([
    'public/css/style.css'
  ])
    .pipe(concat('style.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('public/css'));
});