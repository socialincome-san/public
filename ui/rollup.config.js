import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

const packageJson = require('./package.json');

export default {
	input: 'src/so-ui.ts',
	output: [
		{
			file: packageJson.main,
			format: 'cjs',
			sourcemap: true,
		},
		{
			file: packageJson.module,
			format: 'esm',
			sourcemap: true,
			minimize: true,
			modules: true,
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve(),
		commonjs(),
		typescript({ tsconfig: './tsconfig.json' }),
		postcss({
			sourceMap: true,
			extract: true,
			config: {
				path: './postcss.config.js',
				ctx: null,
			},
		}),
		// terser(),
	],
};
