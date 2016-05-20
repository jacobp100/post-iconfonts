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

const font = new Uint8Array(readFileSync('font-awesome.otf')).buffer; // NOTE: Uint8Array
const css = readFileSync('font-awesome.css', 'utf-8');

const svgString = postIconfonts(css, font);
```

Then add icons with,

```html
<svg width="12" height="12"><use xlink:href="/icons.svg#fa-check" /></svg>
```

# API

```js
postIconfonts(cssString, fontBuffer, options);
```

`cssString` must be a string. `fontBuffer` must be a Uint8Array (see first example).

The options takes the following:

* `size` (number, default 12) The height to make each glyph (shouldn't really affect anything)
* `filterNames` (array, optional) Export only these CSS class names from the icon font
* `transformNames` (function, optional) Function must take a name and return a new name (can be used to remove `fa-prefixes` from icons)
