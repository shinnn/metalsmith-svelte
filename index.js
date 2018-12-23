'use strict';

const {dirname, extname, join, relative} = require('path');

const {compile} = require('svelte');
const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');
const sourceMapToComment = require('source-map-to-comment');
const toFastProperties = require('to-fast-properties');

module.exports = function metalsmithSvelte(...args) {
  const argLen = args.length;

  if (argLen > 1) {
    const error = new RangeError(`Expected 0 or 1 argument (<Object>), but got ${argLen} arguments.`);
    error.code = 'ERR_TOO_MANY_ARGS';

    throw error;
  }

  const [options = {}] = args;

  if (argLen === 1) {
    if (!isPlainObj(options)) {
      const error = new TypeError(`Expected an <Object> to set Svelte compiler options, but got ${
        inspectWithKind(options)
      }.`);
      error.code = 'ERR_INVALID_ARG_TYPE';

      throw error;
    }

    if (typeof options.sourceMap !== 'boolean' && options.sourceMap !== 'inline') {
      const error = new TypeError(`Expected \`sourceMap\` option to be true, false or 'inline', but got ${
        inspectWithKind(options.sourceMap)
      }.`);
      error.code = 'ERR_INVALID_OPT_VALUE';

      throw error;
    }
  }

  return function metalsmithBublePlugin(files, metalsmith) {
    for (const originalFilename of Object.keys(files)) {
      const ext = extname(originalFilename).toLowerCase();
      if (ext !== '.htm' && ext !== '.html' && ext !== '.svelte') {
        return;
      }

      const filename = originalFilename.replace(/\.(html?|svelte)$/i, '.js');

      const result = compile(files[originalFilename].contents.toString(), Object.assign({}, options, {
        filename: join(metalsmith.source(), originalFilename)
      }));

      if (options.sourceMap === true) {
        const sourcemapPath = `${filename}.map`;
        files[sourcemapPath] = {
          contents: Buffer.from(JSON.stringify(result.map))
        };

        result.code += `\n//# sourceMappingURL=${
          relative(dirname(filename), sourcemapPath).replace(/\\/g, '/')
        }\n`;
      } else if (options.sourceMap === 'inline') {
        result.code += `\n${sourceMapToComment(result.map)}\n`;
      }

      files[filename] = files[originalFilename];
      delete files[originalFilename];
      toFastProperties(files);

      files[filename].contents = Buffer.from(result.code);
    }
  };
};
