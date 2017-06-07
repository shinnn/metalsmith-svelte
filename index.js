/*!
 * metalsmith-svelte | MIT (c) Shinnosuke Watanabe
 * https://github.com/babel/metalsmith-svelte
*/
'use strict';

const inspect = require('util').inspect;
const path = require('path');

const compile = require('svelte').compile;
const sourceMapToComment = require('source-map-to-comment');
const toFastProperties = require('to-fast-properties');

module.exports = function metalsmithSvelte(options) {
  options = Object.assign({sourceMap: false}, options);

  if (typeof options.sourceMap !== 'boolean' && options.sourceMap !== 'inline') {
    throw new TypeError(
      '`sourceMap` option must be true, false or \'inline\', but got ' +
      inspect(options.sourceMap) +
      '.'
    );
  }

  return function metalsmithBublePlugin(files, metalsmith) {
    for (const originalFilename of Object.keys(files)) {
      const ext = path.extname(originalFilename).toLowerCase();
      if (ext !== '.html') {
        return;
      }

      const filename = originalFilename.replace(/\.html$/i, '.js');

      const result = compile(files[originalFilename].contents.toString(), Object.assign({}, options, {
        filename: path.join(metalsmith.source(), originalFilename)
      }));

      if (options.sourceMap === true) {
        const sourcemapPath = `${filename}.map`;
        files[sourcemapPath] = {
          contents: new Buffer(JSON.stringify(result.map))
        };

        result.code += `\n//# sourceMappingURL=${
          path.relative(path.dirname(filename), sourcemapPath).replace(/\\/g, '/')
        }\n`;
      } else if (options.sourceMap === 'inline') {
        result.code += `\n${sourceMapToComment(result.map)}\n`;
      }

      files[filename] = files[originalFilename];
      delete files[originalFilename];
      toFastProperties(files);

      files[filename].contents = new Buffer(result.code);
    }
  };
};
