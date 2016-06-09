'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGlyphsForCss = undefined;

var _fp = require('lodash/fp');

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssSelectorParser = require('postcss-selector-parser');

var _postcssSelectorParser2 = _interopRequireDefault(_postcssSelectorParser);

var _opentype = require('opentype.js');

var _opentype2 = _interopRequireDefault(_opentype);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var cssStringValue = /^\s*("[^"]+"|'[^']+')\s*$/;
var cssEscapeValue = /^\\([0-9a-f]+)$/i;

var getGlyphForRule = function getGlyphForRule(rule) {
  var glyph = null;

  rule.walkDecls(function (decl) {
    var match = decl.value.match(cssStringValue);

    if (decl.prop !== 'content' || !match) return;

    var value = match[1].slice(1, -1);
    var escapeValue = value.match(cssEscapeValue);

    if (escapeValue) {
      glyph = String.fromCharCode(parseInt(escapeValue[1], 16));
    } else if (value.codePointAt(1) === undefined) {
      // Don't allow multiple letters (that would be multiple icons)
      glyph = value;
    }
  });

  return glyph;
};

var getNameForSelector = function getNameForSelector(selector) {
  var name = null;

  var getLastClassWithPseudoBeforeAfter = function getLastClassWithPseudoBeforeAfter(node) {
    var lastNode = (0, _fp.last)(node.nodes);
    var classes = (0, _fp.filter)({ type: 'class' }, lastNode.nodes);
    var pseudos = (0, _fp.flow)((0, _fp.filter)({ type: 'pseudo' }), (0, _fp.filter)((0, _fp.overSome)([(0, _fp.endsWith)(':before'), (0, _fp.endsWith)(':after')])))(lastNode.nodes);

    if (classes.length === 1 && !(0, _fp.isEmpty)(pseudos)) {
      name = (0, _fp.first)(classes).value;
    }
  };

  (0, _postcssSelectorParser2.default)(getLastClassWithPseudoBeforeAfter).process(selector);

  return name;
};

var getGlyphsForCss = exports.getGlyphsForCss = function getGlyphsForCss(cssString) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$filterNames = _ref.filterNames;
  var filterNames = _ref$filterNames === undefined ? null : _ref$filterNames;
  var _ref$transformNames = _ref.transformNames;
  var transformNames = _ref$transformNames === undefined ? _fp.identity : _ref$transformNames;

  var root = _postcss2.default.parse(cssString);
  var glyphsToSelectors = {};

  root.walkRules(function (rule) {
    var glyph = getGlyphForRule(rule);
    var names = (0, _fp.flow)((0, _fp.map)(getNameForSelector), _fp.compact)(rule.selectors);

    if (glyph && !(0, _fp.isEmpty)(names)) {
      glyphsToSelectors = (0, _fp.update)(glyph, (0, _fp.union)(names), glyphsToSelectors);
    }
  });

  var removeFilteredNames = filterNames ? (0, _fp.intersection)(filterNames) : _fp.identity;

  return (0, _fp.flow)((0, _fp.mapValues)(removeFilteredNames), (0, _fp.mapValues)((0, _fp.map)(transformNames)), (0, _fp.omitBy)(_fp.isEmpty))(glyphsToSelectors);
};

exports.default = function (cssString, fontBuffer) {
  var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var _ref2$size = _ref2.size;
  var size = _ref2$size === undefined ? 12 : _ref2$size;
  var _ref2$width = _ref2.width;
  var width = _ref2$width === undefined ? size : _ref2$width;
  var _ref2$filterNames = _ref2.filterNames;
  var filterNames = _ref2$filterNames === undefined ? null : _ref2$filterNames;
  var _ref2$transformNames = _ref2.transformNames;
  var transformNames = _ref2$transformNames === undefined ? _fp.identity : _ref2$transformNames;
  var _ref2$precision = _ref2.precision;
  var precision = _ref2$precision === undefined ? 6 : _ref2$precision;
  var _ref2$warnOnOversized = _ref2.warnOnOversized;
  var
  // TODO: On next major version bump, make this always true
  warnOnOversized = _ref2$warnOnOversized === undefined ? false : _ref2$warnOnOversized;

  var fontUint8Buffer = !(fontBuffer instanceof ArrayBuffer) ? new Uint8Array(fontBuffer).buffer : fontBuffer;

  var font = _opentype2.default.parse(fontUint8Buffer);
  var glyphsToSelectors = getGlyphsForCss(cssString, { filterNames: filterNames, transformNames: transformNames });

  var unitsPerEm = font.unitsPerEm;

  var ascender = size * font.ascender / unitsPerEm;
  var boundingAdvanceWidth = unitsPerEm * width / size;

  var oversizedGlyphs = [];

  var generateSvgForGlyphNameAndIds = function generateSvgForGlyphNameAndIds(glyphName, _ref3) {
    var _ref4 = _toArray(_ref3);

    var firstId = _ref4[0];

    var otherIds = _ref4.slice(1);

    var glyph = font.charToGlyph(glyphName);
    var advanceWidth = glyph.advanceWidth;


    if (advanceWidth > boundingAdvanceWidth) oversizedGlyphs.push.apply(oversizedGlyphs, _toConsumableArray(glyphsToSelectors[glyphName]));

    var x = size * (boundingAdvanceWidth - advanceWidth) / (2 * unitsPerEm);
    var d = glyph.getPath(x, ascender, size).toPathData(precision);
    var mainPath = '<path id="' + firstId + '" d="' + d + '"/>';
    var refPaths = (0, _fp.map)(function (id) {
      return '<use id="' + id + '" xlink:href="#' + firstId + '"/>';
    }, otherIds);
    return (0, _fp.join)('', [mainPath].concat(_toConsumableArray(refPaths)));
  };

  var svgBody = (0, _fp.flow)(_fp.toPairs, (0, _fp.map)((0, _fp.spread)(generateSvgForGlyphNameAndIds)), (0, _fp.join)(''))(glyphsToSelectors);

  var svg = '<svg width="0" height="0" viewBox="0 0 ' + width + ' ' + size + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>' + svgBody + '</defs></svg>';

  return warnOnOversized ? { svg: svg, oversizedGlyphs: oversizedGlyphs } : svg;
};