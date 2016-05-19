import gulp from 'gulp';
import postIconfonts from './src';
import { join } from 'path';
import { readFileSync, writeFile } from 'fs';

gulp.task('icons', cb => {
  const font = new Uint8Array(readFileSync(join(__dirname, 'webapp/FontAwesome.otf'))).buffer;
  const css = readFileSync(join(__dirname, 'webapp/font-awesome.css'), 'utf-8');

  const svg = postIconfonts(css, font, {
    filterNames: [
      'fa-hand-o-right',
      'fa-thumbs-o-up',
    ],
  });

  writeFile(join(__dirname, 'dist/icons.svg'), svg, cb);
});
