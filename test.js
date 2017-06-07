'use strict';

const {join} = require('path');

const Metalsmith = require('metalsmith');
const svelte = require('.');
const test = require('tape');

test('metalsmith-svelte', t => {
  t.plan(12);

  new Metalsmith('.')
  .use(svelte())
  .run({
    'source.html': {contents: Buffer.from('<div />')},
    'non-html.txt': {contents: Buffer.from('Hi')}
  }, (err, files) => {
    t.strictEqual(err, null, 'should be used as a metalsmith plugin.');

    t.strictEqual(
      String(files['source.js'].contents).split('\n')[0],
      'function create_main_fragment ( state, component ) {',
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
    format: 'es',
    generate: 'ssr',
    sourceMap: true
  }))
  .run({'source.html': {contents: new Buffer(0)}}, (err, files) => {
    t.strictEqual(err, null, 'should accept an empty file.');

    const contents = files['source.js'].contents.toString();

    t.strictEqual(
      contents.split('\n').splice(-3)[0],
      'export default GulpSvelteTest;',
      'should support Svelte compiler options.'
    );

    t.strictEqual(
      contents.split('\n').splice(-2)[0],
      '//# sourceMappingURL=source.js.map',
      'should append source map URL when `sourceMap` option is \'inline\'.'
    );

    t.deepEqual(
      JSON.parse(files['source.js.map'].contents),
      {
        version: 3,
        file: null,
        sources: [join(__dirname, 'src', 'source.html')],
        sourcesContent: [''],
        names: [],
        mappings: ';'.repeat(36)
      },
      'should generate valid source map.'
    );
  });

  new Metalsmith('.')
  .use(svelte({sourceMap: 'inline'}))
  .run({'☺️.html': {contents: Buffer.from('<div />')}}, (err, files) => {
    t.strictEqual(err, null, 'should support non-ASCII filename.');
    t.strictEqual(
      String(files['☺️.js'].contents).split('\n').splice(-2)[0],
      `//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy9zaGlubm4vZ2l0aHViL21ldGFsc21pdGgtc3ZlbHRlL3NyYy/imLrvuI8uaHRtbCJdLCJzb3VyY2VzQ29udGVudCI6WyI8ZGl2IC8+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI${'7Ozs'.repeat(59)}7OyJ9`,
      'should append Base64-encoded source map when `sourceMap` option is \'inline\'.'
    );
  });

  new Metalsmith('.')
  .source('custom_source_directory')
  .use(svelte({sourceMap: false}))
  .run({'FOO.HTML': {contents: Buffer.from('</>')}}, ({name, filename}) => {
    t.strictEqual(
      name,
      'ParseError',
      'should fail when svelte cannot transpile the code.'
    );

    t.strictEqual(
      filename,
      join(__dirname, 'custom_source_directory', 'FOO.HTML'),
      'should include filename to the error object.'
    );
  });

  t.throws(
    () => svelte({sourceMap: [1, 2, 3]}),
    /^TypeError.* `sourceMap` option must be true, false or 'inline', but got \[ 1, 2, 3 ]\./,
    'should throw a type error when it takes an invalid `sourceMap` option value.'
  );
});
