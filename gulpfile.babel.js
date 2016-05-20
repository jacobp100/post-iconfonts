import gulp from 'gulp';
import babel from 'gulp-babel';
import cssnano from 'gulp-cssnano';
import webpack from 'webpack';
import { join } from 'path';
import { readFileSync, writeFile } from 'fs';
import postIconfonts from './src';
import webpackConfig from './webpack.config.js';

gulp.task('app-icons', cb => {
  const fontBuffer = readFileSync(join(__dirname, 'app/icon-fonts/FontAwesome.otf'));
  const font = new Uint8Array(fontBuffer).buffer;
  const css = readFileSync(join(__dirname, 'app/icon-fonts/font-awesome.css'), 'utf-8');

  const svg = postIconfonts(css, font, {
    filterNames: [
      'fa-hand-o-right',
      'fa-thumbs-o-up',
    ],
  });

  writeFile(join(__dirname, 'dist/icons.svg'), svg, cb);
});

gulp.task('app-css', () => (
  gulp.src('app/styles.css')
    .pipe(cssnano())
    .pipe(gulp.dest('dist'))
));

gulp.task('app-js', cb => {
  webpack(webpackConfig, cb);
});

gulp.task('build-app', ['app-js', 'app-css', 'app-icons']);

gulp.task('build-package', () => (
  gulp.src('./src/index.js')
    .pipe(babel())
    .pipe(gulp.dest('.'))
));

gulp.task('default', ['build-package', 'build-app']);
