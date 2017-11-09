# metalsmith-svelte

[![NPM version](https://img.shields.io/npm/v/metalsmith-svelte.svg)](https://www.npmjs.com/package/metalsmith-svelte)
[![Build Status](https://travis-ci.org/shinnn/metalsmith-svelte.svg?branch=master)](https://travis-ci.org/shinnn/metalsmith-svelte)
[![Build status](https://ci.appveyor.com/api/projects/status/nevjeddyndcl5ubo/branch/master?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/metalsmith-svelte/branch/master)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/metalsmith-svelte.svg)](https://coveralls.io/r/shinnn/metalsmith-svelte)

[Svelte](https://svelte.technology/) plugin for [Metalsmith](http://www.metalsmith.io/)

## Installation

[Use npm](https://docs.npmjs.com/cli/install):

```
npm install metalsmith-svelte
```

## Usage

### [CLI](https://github.com/segmentio/metalsmith#cli)

Add the `metalsmith-svelte` field to your `metalsmith.json`.

```javascript
{
  "plugins": {
    "metalsmith-svelte": {
      "name": 'MyComponent',
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

All [Svelte compiler options](https://github.com/sveltejs/svelte#options) are available except for `filename` that will be automatically set.

In addition the following option is supported:

#### options.sourceMap

Value: `true`, `false` or `'inline'`  
Default: `false`

* `true` generates a separate source map file with `.map` extension, for exmaple `index.js.map` along with `index.js`.
* `'inline'` appends an inline source map to the transformed file.

## License

[ISC License](./LICENSE) © 2017 Shinnosuke Watanabe
