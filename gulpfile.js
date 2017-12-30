var gulp           = require('gulp'),
    gutil          = require('gulp-util'),
    sass           = require('gulp-sass'),
    cache          = require('gulp-cache'),
    concat         = require('gulp-concat'),
    uglify         = require('gulp-uglify'),
    rename         = require('gulp-rename'),
    notify         = require('gulp-notify'),
    imagemin       = require('gulp-imagemin'),
    cleanCSS       = require('gulp-clean-css'),
    autoprefixer   = require('gulp-autoprefixer'),
    del            = require('del'),
    browserSync    = require('browser-sync');

var rootPath = 'app';

var src = {
    js: rootPath + '/js',
    css: rootPath + '/css',
    lib: rootPath + '/libs',
    sass: rootPath + '/sass/**/*.{sass,scss}'
}

// Скрипты проекта
gulp.task('common-js', function() {
    return gulp.src([
        src.js + 'common.js',
        ])
    .pipe(concat('common.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(src.js));
});

gulp.task('js', ['common-js'], function() {
    return gulp.src([
        src.lib + '/jquery-3.2.1.min.js',
        src.lib + '/remodal.min.js',
        src.js + '/common.min.js', // Всегда в конце
    ])
    .pipe(concat('app.min.js'))
    .pipe(uglify()) // Минимизировать весь js (на выбор)
    .pipe(gulp.dest(src.js))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: rootPath
        },
        notify: true,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    });
});

gulp.task('sass', function() {
    return gulp.src(src.sass)
    .pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
    .pipe(rename({suffix: '.min', prefix : ''}))
    .pipe(autoprefixer(['last 15 versions']))
    .pipe(cleanCSS()) // Опционально, закомментировать при отладке
    .pipe(gulp.dest(src.css))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
    gulp.watch(src.sass, ['sass']);
    gulp.watch([src.lib + '/**/*.js', src.js + '/common.js'], ['js']);
    gulp.watch(rootPath + '/*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
    return gulp.src(rootPath + '/img/**/*')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/img')); 
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

    var buildFiles = gulp.src([
        rootPath + '/*.html',
        rootPath + '/.htaccess',
        ]).pipe(gulp.dest('dist'));

    var buildCss = gulp.src([
        rootPath + '/css/style.min.css',
        ]).pipe(gulp.dest('dist/css'));

    var buildJs = gulp.src([
        rootPath + '/js/app.min.js',
        ]).pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src([
        rootPath + '/fonts/**/*',
        ]).pipe(gulp.dest('dist/fonts'));

});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
