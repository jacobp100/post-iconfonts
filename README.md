# post-iconfonts

Converts an icon font to an SVG image

### [Online Version](http://jacobp100.github.io/post-iconfonts/)

```
npm install --save-dev post-iconfonts
```

# TL;DR

Generate a SVG image with,

```js
import postIconfonts from 'post-iconfonts';

const font = readFileSync('font-awesome.otf');
const css = readFileSync('font-awesome.css', 'utf-8');

const svgString = postIconfonts(css, font, { precision: 5 });
```

Then add icons with,

```html
<svg width="12" height="12"><use xlink:href="/icons.svg#fa-check" /></svg>
```

# API

```js
postIconfonts(cssString, fontBuffer, options);
```

`cssString` must be a string. `fontBuffer` can be an ArrayBuffer or a standard node.js Buffer.

The options is an object that takes the following:

* `size` (number, default 12) The height to make each glyph (shouldn't really affect anything)
* `width` (number, default=size) The width of each glyph—effectively defines the aspect ratio
* `filterNames` (array, optional) Export only these CSS class names from the icon font
* `transformNames` (function, optional) Function must take a name and return a new name (can be used to remove `fa-prefixes` from icons)
* `precision` (number, default 6) The number of decimal places for path data commands—decrease to lower the file size and quality
* `warnOnOversized` (boolean, default false) when true, the return value will be `{ svg, oversizedGlyphs }`, where `svg` is a string, and `oversizedGlyphs` is an array of glyphs that did not fit in the size/width boundary
