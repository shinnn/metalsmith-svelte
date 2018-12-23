# metalsmith-svelte

[![npm version](https://img.shields.io/npm/v/metalsmith-svelte.svg)](https://www.npmjs.com/package/metalsmith-svelte)
[![Build Status](https://travis-ci.com/shinnn/metalsmith-svelte.svg?branch=master)](https://travis-ci.com/shinnn/metalsmith-svelte)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/metalsmith-svelte.svg)](https://coveralls.io/github/shinnn/metalsmith-svelte)

[Svelte](https://svelte.technology/) plugin for [Metalsmith](https://github.com/segmentio/metalsmith)

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/).

```
npm install --save-dev metalsmith-svelte
```

## Usage

### [CLI](https://github.com/segmentio/metalsmith#cli)

Add the `metalsmith-svelte` field to your `metalsmith.json`.

```json
{
  "plugins": {
    "metalsmith-svelte": {
      "name": "MyComponent",
      "sourceMap": "inline"
    }
  }
}
```

### [API](https://github.com/segmentio/metalsmith#api)

```javascript
const Metalsmith = require('metalsmith');
const svelte = require('metalsmith-svelte');

new Metalsmith('./source')
.use(svelte({
  sourceMap: true
}))
.build((err, files) => {
  if (err) {
    throw err;
  }

  console.log('Completed.');
});
```

### Options

[Svelte compiler options](https://github.com/sveltejs/svelte#compiler-options) are available except for:

* `filename` option is not supported and will be automatically set.
* `onerror` option is not supported as there is no value to use it.

In addition the following option is supported:

#### options.sourceMap

Value: `true`, `false` or `'inline'`  
Default: `false`

* `true` generates a separate source map file with `.map` extension, for exmaple `index.js.map` along with `index.js`.
* `'inline'` appends an inline source map to the transformed file.

## License

[ISC License](./LICENSE) © 2017 - 2018 Shinnosuke Watanabe
