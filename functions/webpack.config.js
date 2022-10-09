const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

const globalRootPath = path.resolve(__dirname, '..');

module.exports = {
	mode: 'development',
	devtool: 'eval-source-map',
	target: 'node',
	entry: path.resolve(__dirname, 'src', 'index.ts'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		library: {
			type: 'commonjs',
		},
	},
	resolve: {
		modules: [path.resolve(__dirname, 'node_modules'), path.resolve(globalRootPath, 'node_modules')],
		extensions: ['.ts', '...'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
		],
	},
	plugins: [
		new Dotenv({
			path: path.resolve(path.join(__dirname, '.env')),
		}),
	],
	externals: [nodeExternals()],
	stats: {
		errorDetails: true,
	},
};
