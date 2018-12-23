'use strict';

const {join} = require('path');

const Metalsmith = require('metalsmith');
const metalsmithSvelte = require('.');
const test = require('tape');

test('metalsmith-svelte', t => {
  t.plan(11);

  new Metalsmith('.')
  .use(metalsmithSvelte())
  .run({
    'source.html': {contents: Buffer.from('<div />')},
    'non-html.txt': {contents: Buffer.from('Hi')}
  }, (err, files) => {
    t.equal(err, null, 'should be used as a metalsmith plugin.');

    t.equal(
      String(files['source.js'].contents).split('\n')[2],
      'function create_main_fragment(component, state) {',
      'should compile a file with Svelte compiler.'
    );
    t.equal(
      String(files['non-html.txt'].contents),
      'Hi',
      'should not transform non-HTML files.'
    );
  });

  new Metalsmith('.')
  .use(metalsmithSvelte({
    name: 'GulpSvelteTest',
    format: 'es',
    generate: 'ssr',
    sourceMap: true
  }))
  .run({'source.htm': {contents: Buffer.alloc(0)}}, (err, files) => {
    t.equal(err, null, 'should accept an empty file.');

    const contents = files['source.js'].contents.toString();

    t.equal(
      contents.split('\n').splice(-3)[0],
      'export default GulpSvelteTest;',
      'should support Svelte compiler options.'
    );

    t.equal(
      contents.split('\n').splice(-2)[0],
      '//# sourceMappingURL=source.js.map',
      'should append source map URL when `sourceMap` option is \'inline\'.'
    );

    t.deepEqual(
      JSON.parse(files['source.js.map'].contents),
      {
        version: 3,
        file: null,
        sources: [join(__dirname, 'src', 'source.htm')],
        sourcesContent: [''],
        names: [],
        mappings: ';'.repeat(58)
      },
      'should generate valid source map.'
    );
  });

  new Metalsmith('.')
  .use(metalsmithSvelte({sourceMap: 'inline'}))
  .run({'☺️.svelte': {contents: Buffer.from('<div />')}}, (err, files) => {
    t.equal(err, null, 'should support .svelte file extension.');
    t.ok(
      String(files['☺️.js'].contents).split('\n').splice(-2)[0].startsWith('//# sourceMappingURL=data:application/json;base64,'),
      'should append Base64-encoded source map when `sourceMap` option is \'inline\'.'
    );
  });

  new Metalsmith('.')
  .source('custom_source_directory')
  .use(metalsmithSvelte({sourceMap: false}))
  .run({'FOO.HTML': {contents: Buffer.from('</>')}}, ({name, filename}) => {
    t.equal(
      name,
      'ParseError',
      'should fail when svelte cannot transpile the code.'
    );

    t.equal(
      filename,
      join(__dirname, 'custom_source_directory', 'FOO.HTML'),
      'should include filename to the error object.'
    );
  });
});

test('metalsmith-svelte', t => {
  t.throws(
    () => metalsmithSvelte(-0),
    /^TypeError.*Expected an <Object> to set Svelte compiler options, but got -0 \(number\)\./u,
    'should throw an error when it takes a non-Object argument.'
  );

  t.throws(
    () => metalsmithSvelte({sourceMap: [1]}),
    /^TypeError.*Expected `sourceMap` option to be true, false or 'inline', but got \[ 1 \] \(array\)\./u,
    'should throw an error when it takes an invalid `sourceMap` option value.'
  );

  t.throws(
    () => metalsmithSvelte({}, {}),
    /^RangeError.*Expected 0 or 1 argument \(<Object>\), but got 2 arguments\./u,
    'should throw an error when it takes too many arguments.'
  );

  t.end();
});
