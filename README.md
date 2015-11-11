# PostCSS Constants With Reload

[PostCSS] plugin to process imported constants from a file.

[PostCSS]: https://github.com/postcss/postcss

**constants.js**
```js
module.exports = {
  colors: {
    primary: '#8EE7D3',
  }
};
```

**input**
```css
@constants "./constants";
.foo {
  color: @constants.colors.primary;
}
```

**output**
```css
.foo {
  color: #8EE7D3;
}
```

#### Within static values

**constants.js**
```js
module.exports = {
  borders: {
    weight: '2px',
    style: 'solid',
  },
};
```

**input**
```css
@constants "./constants.js";
.foo {
  border: @constants.borders.weight @constants.borders.style black;
}
```

**output**
```css
.foo {
  border: 2px solid black;
}
```

#### @ Rules

**constants.js**
```js
module.exports = {
  queries: {
    maxWidth: '200px',
  },
}
```

**input**
```css
@constants: "./constants.js";

@media (max-width: @constants.queries.maxWidth) {
  color: blue;
}
```

**output**
```css
@media (max-width: 200px) {
  color: blue;
}
```

## Usage

```js
postcss([ require('postcss-constants-with-reload') ])
```

You can pass a default set of constants (that can be overriden), if you want to update default constants in webpack hot reload:


```js
postcss([
  constants({
    defaults: {
      colors: {
        primary: 'blue',
      },
    }
  })
])
```

you can pass an `alias` option, which will be used to resolve related constants file

```js
postcss([
  constants({
    alias: path.resolve( process.cwd(), 'css' )
  })
])
```

then you can write code like this

```css
@constants: "css/constants.js";
```

if 'css' was found in alias option, 'css/constants.js' will be parsed to complete path

**webpack user?**

you can pass an `webpack` option in option

```js
postcss: function( webpack ){
	return [
		constantsWithReload({
			webpack: webpack
		})
	];
}
```

it will add constants files as dependency. when you modify the constants file, it causes webpack recomplie all related resource and livereload in browser.

Call `postcss-constants` before any plugins that will compute values stored in constants. See [PostCSS] docs for examples for your environment.
