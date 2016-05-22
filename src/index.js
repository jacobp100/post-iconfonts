import {
  first, last, map, flow, filter, overSome, endsWith, isEmpty, compact, update, union, join, spread,
  toPairs, identity, intersection, mapValues, omitBy,
} from 'lodash/fp';
import postcss from 'postcss';
import parser from 'postcss-selector-parser';
import opentype from 'opentype.js';

const cssStringValue = /^\s*("[^"]+"|'[^']+')\s*$/;
const cssEscapeValue = /^\\([0-9a-f]+)$/i;

const getGlyphForRule = rule => {
  let glyph = null;

  rule.walkDecls(decl => {
    const match = decl.value.match(cssStringValue);

    if (decl.prop !== 'content' || !match) return;

    const value = match[1].slice(1, -1);
    const escapeValue = value.match(cssEscapeValue);

    if (escapeValue) {
      glyph = String.fromCharCode(parseInt(escapeValue[1], 16));
    } else if (value.codePointAt(1) === undefined) {
      // Don't allow multiple letters (that would be multiple icons)
      glyph = value;
    }
  });

  return glyph;
};

const getNameForSelector = selector => {
  let name = null;

  const getLastClassWithPseudoBeforeAfter = node => {
    const lastNode = last(node.nodes);
    const classes = filter({ type: 'class' }, lastNode.nodes);
    const pseudos = flow(
      filter({ type: 'pseudo' }),
      filter(overSome([
        endsWith(':before'),
        endsWith(':after'),
      ]))
    )(lastNode.nodes);

    if (classes.length === 1 && !isEmpty(pseudos)) {
      name = first(classes).value;
    }
  };

  parser(getLastClassWithPseudoBeforeAfter).process(selector);

  return name;
};

export const getGlyphsForCss = (cssString, {
  filterNames = null,
  transformNames = identity,
} = {}) => {
  const root = postcss.parse(cssString);
  let glyphsToSelectors = {};

  root.walkRules(rule => {
    const glyph = getGlyphForRule(rule);
    const names = flow(
      map(getNameForSelector),
      compact
    )(rule.selectors);

    if (glyph && !isEmpty(names)) {
      glyphsToSelectors = update(glyph, union(names), glyphsToSelectors);
    }
  });

  const removeFilteredNames = filterNames
    ? intersection(filterNames)
    : identity;

  return flow(
    mapValues(removeFilteredNames),
    mapValues(map(transformNames)),
    omitBy(isEmpty)
  )(glyphsToSelectors);
};

export default (cssString, fontBuffer, {
  size = 12,
  filterNames = null,
  transformNames = identity,
} = {}) => {
  const fontUint8Buffer = !(fontBuffer instanceof ArrayBuffer)
    ? new Uint8Array(fontBuffer).buffer
    : fontBuffer;

  const font = opentype.parse(fontUint8Buffer);
  const glyphsToSelectors = getGlyphsForCss(cssString, { filterNames, transformNames });

  const ascender = font.ascender / font.unitsPerEm * size;

  const generateSvgForGlyphNameAndIds = (glyphName, [firstId, ...otherIds]) => {
    const glyph = font.charToGlyph(glyphName);
    const d = glyph.getPath(0, ascender, size).toPathData(6);
    const mainPath = `<path id="${firstId}" d="${d}"/>`;
    const refPaths = map(id => `<use id="${id}" xlink:href="#${firstId}"/>`, otherIds);
    return join('', [mainPath, ...refPaths]);
  };

  const svgBody = flow(
    toPairs,
    map(spread(generateSvgForGlyphNameAndIds)),
    join('')
  )(glyphsToSelectors);

  const svg = `<svg width="0" height="0" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>${svgBody}</defs></svg>`;

  return svg;
};
