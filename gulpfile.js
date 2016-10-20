var gulp = require('gulp');
var shell = require('gulp-shell');
var bs = require('browser-sync').create();

// Task for building blog when something changed:
// gulp.task('build', shell.task(['bundle exec jekyll build --watch']));
// Or if you don't use bundle:
gulp.task('build', shell.task(['jekyll build --watch  --drafts --future']));

// Task for serving blog with Browsersync
gulp.task('serve', function () {
    bs.init({
    	server: {baseDir: '_site/'},
    	reloadDebounce: 500
    });
    // Reloads page when some of the already built files changed:
    gulp.watch('_site/**/*.*').on('change', bs.reload);
});

gulp.task('default', ['build', 'serve']);
