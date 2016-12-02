'use strict';

const Metalsmith = require('metalsmith');
const svelte = require('.');
const test = require('tape');

test('metalsmith-svelte', t => {
  t.plan(11);

  new Metalsmith('.')
  .use(svelte())
  .run({
    'source.html': {contents: Buffer.from('<div />')},
    'non-html.txt': {contents: Buffer.from('Hi')}
  }, (err, files) => {
    t.strictEqual(err, null, 'should be used as a metalsmith plugin.');

    t.strictEqual(
      String(files['source.js'].contents).split('\n')[0],
      'function renderMainFragment ( root, component, target ) {',
      'should compile a file with Svelte compiler.'
    );
    t.strictEqual(
      String(files['non-html.txt'].contents),
      'Hi',
      'should not transform non-HTML files.'
    );
  });

  new Metalsmith('.')
  .use(svelte({
    name: 'GulpSvelteTest',
    format: 'cjs',
    sourceMap: true
  }))
  .run({'source.html': {contents: new Buffer(0)}}, (err, files) => {
    t.strictEqual(err, null, 'should accept an empty file.');

    t.strictEqual(
      String(files['source.js'].contents).split('\n').splice(-3)[0],
      'module.exports = GulpSvelteTest;',
      'should support Svelte compiler options'
    );

    t.strictEqual(
      String(files['source.js'].contents).split('\n').splice(-2)[0],
      '//# sourceMappingURL=source.js.map',
      'should append source map URL when `sourceMap` option is \'inline\'.'
    );

    t.deepEqual(
      JSON.parse(files['source.js.map'].contents),
      {
        version: 3,
        file: null,
        sources: [],
        sourcesContent: [],
        names: [],
        mappings: `;;,${';'.repeat(111)},;;`
      },
      'should support Svelte compiler options'
    );
  });

  new Metalsmith('.')
  .use(svelte({sourceMap: 'inline'}))
  .run({'☺️.html': {contents: Buffer.from('<div />')}}, (err, files) => {
    t.strictEqual(err, null, 'should support non-ASCII filename.');
    t.strictEqual(
      String(files['☺️.js'].contents).split('\n').splice(-2)[0],
      '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbXSwic291cmNlc0NvbnRlbnQiOltdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiLDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7LDs7In0=',
      'should append Base64-encoded source map when `sourceMap` option is \'inline\'.'
    );
  });

  new Metalsmith('.')
  .use(svelte({sourceMap: false}))
  .run({'FOO.HTML': {contents: Buffer.from('</>')}}, err => {
    t.strictEqual(
      err.name,
      'ParseError',
      'should fail when svelte cannot transpile the code.'
    );
  });

  t.throws(
    () => svelte({sourceMap: [1, 2, 3]}),
    /^TypeError.* `sourceMap` option must be true, false or 'inline', but got \[ 1, 2, 3 ]\./,
    'should throw a type error when it takes an invalid `sourceMap` option value.'
  );
});
