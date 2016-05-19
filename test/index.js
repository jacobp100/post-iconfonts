import test from 'ava';
import svgIcon, { getGlyphsForCss } from '../src';
import { join } from 'path';
import { readFileSync } from 'fs';

test('get glyphs for font awesome', t => {
  const glyphs = getGlyphsForCss(`
    @font-face {
      font-family: 'FontAwesome';
      src: url('../fonts/fontawesome-webfont.eot?v=4.6.3');
      src: url('../fonts/fontawesome-webfont.eot?#iefix&v=4.6.3');
      font-weight: normal;
      font-style: normal;
    }
    .fa {
      display: inline-block;
      font: normal normal normal 14px/1 FontAwesome;
      font-size: inherit;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .fa-glass:before {
      content: "\\f000";
    }
    .fa-music:before {
      content: "\\f001";
    }
    .fa-search:before {
      content: "\\f002";
    }
  `);

  t.deepEqual({
    '\uf000': ['fa-glass'],
    '\uf001': ['fa-music'],
    '\uf002': ['fa-search'],
  }, glyphs);
});

test('filter glyph names', t => {
  const glyphs = getGlyphsForCss(`
    .test-keep:before {
      content: "\\f000";
    }
    .test-remove:before {
      content: "\\f001";
    }
  `, {
    filterNames: ['test-keep'],
  });

  t.deepEqual({
    '\uf000': ['test-keep'],
  }, glyphs);
});

test('transform glyph names', t => {
  const glyphs = getGlyphsForCss(`
    .test-rename:before {
      content: "\\f000";
    }
  `, {
    transformNames: () => 'test-renamed',
  });

  t.deepEqual({
    '\uf000': ['test-renamed'],
  }, glyphs);
});

test('filter and transform glyph names', t => {
  const glyphs = getGlyphsForCss(`
    .test-rename:before {
      content: "\\f000";
    }
    .test-remove:before {
      content: "\\f001";
    }
  `, {
    filterNames: ['test-rename'],
    transformNames: () => 'test-renamed',
  });

  t.deepEqual({
    '\uf000': ['test-renamed'],
  }, glyphs);
});

test('glyph aliases', t => {
  const glyphs = getGlyphsForCss(`
    .test-name:before, .test-alias:before {
      content: "\\f000";
    }
  `);

  t.deepEqual({
    '\uf000': ['test-name', 'test-alias'],
  }, glyphs);
});

test('end-to-end svg generation', t => {
  const fontBuffer = new Uint8Array(
    readFileSync(join(__dirname, '../webapp/FontAwesome.otf'))
  ).buffer;

  const svg = svgIcon(`
    .fa-glass:before {
      content: "\\f000";
    }
    .fa-music:before {
      content: "\\f001";
    }
    .fa-search:before {
      content: "\\f002";
    }
  `, fontBuffer);

  t.not(svg.indexOf('<path id="fa-glass" '), -1);
  t.not(svg.indexOf('<path id="fa-music" '), -1);
  t.not(svg.indexOf('<path id="fa-search" '), -1);
});

test('svg gerenation dulplicate names', t => {
  const fontBuffer = new Uint8Array(
    readFileSync(join(__dirname, '../webapp/FontAwesome.otf'))
  ).buffer;

  const svg = svgIcon(`
    .fa-glass:before, .fa-glass-alias:before {
      content: "\\f000";
    }
  `, fontBuffer);

  t.not(svg.indexOf('<path id="fa-glass" '), -1);
  t.not(svg.indexOf('<use id="fa-glass-alias" xlink:href="#fa-glass"/>'), -1);
});
