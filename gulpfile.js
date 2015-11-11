var gulp = require('gulp');

var files = ['index.js', 'test/*.js', 'gulpfile.js'];

gulp.task('test', function (done) {
    var mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false })
        .pipe(mocha()).on('error', done);
});

gulp.task('default', ['test']);

gulp.task('watch', function() {
    gulp.watch(files, ['test']);
});
