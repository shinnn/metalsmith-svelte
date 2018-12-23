'use strict';

const {dirname, extname, join, relative} = require('path');
const {inspect} = require('util');

const {compile} = require('svelte');
const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');
const toFastProperties = require('to-fast-properties');

const SOURCE_MAP_COMMENT_PREFIX = '//# sourceMappingURL=';

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

		const errors = [];
		const {filename, sourceMap, onerror} = options;


		if (sourceMap !== undefined && typeof sourceMap !== 'boolean' && sourceMap !== 'inline') {
			errors.push(`Expected \`sourceMap\` option to be true, false or 'inline', but got ${
				inspectWithKind(sourceMap)
			}.`);
		}

		if (onerror !== undefined) {
			errors.push(`metalsmith-svelte doesn't support \`onerror\` option, but ${
				inspect(onerror)
			} was provided.`);
		}

		const errorLen = errors.length;

		if (errorLen === 1) {
			const error = new TypeError(errors[0]);
			error.code = 'ERR_INVALID_OPT_VALUE';

			throw error;
		}

		if (errorLen !== 0) {
			const error = new TypeError(`Found ${errorLen} errors in metalsmith-svelte options:
${errors.map((line, i) => `${i + 1}. ${line}`).join('\n')}`);
			error.code = 'ERR_INVALID_OPT_VALUE';

			throw error;
		}
	}

	return function metalsmithBublePlugin(files, metalsmith) {
		for (const originalFilename of Object.keys(files)) {
			const ext = extname(originalFilename).slice(1).toLowerCase();
			if (ext !== 'htm' && ext !== 'html' && ext !== 'svelte') {
				return;
			}

			const filename = originalFilename.replace(/\.(html?|svelte)$/ui, '.js');
			const {js} = compile(files[originalFilename].contents.toString(), {
				...options,
				filename: join(metalsmith.source(), originalFilename)
			});

			if (options.sourceMap === true) {
				const sourcemapPath = `${filename}.map`;
				files[sourcemapPath] = {
					contents: Buffer.from(JSON.stringify(js.map))
				};

				js.code += `
${SOURCE_MAP_COMMENT_PREFIX}${relative(dirname(filename), sourcemapPath).replace(/\\/ug, '/')}
`;
			} else if (options.sourceMap === 'inline') {
				js.code += `
${SOURCE_MAP_COMMENT_PREFIX}data:application/json;base64,${Buffer.from(JSON.stringify(js.map))}
`;
			}

			files[filename] = files[originalFilename];
			delete files[originalFilename];
			toFastProperties(files);

			files[filename].contents = Buffer.from(js.code);
		}
	};
};
