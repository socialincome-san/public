const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const globalRootPath = path.resolve(__dirname, '..');

module.exports = {
	mode: 'development',
	devtool: 'eval-cheap-source-map',
	entry: path.resolve(__dirname, 'src', 'index.tsx'),
	output: {
		path: path.resolve(__dirname, 'public', 'dist'),
		filename: 'app.js',
		publicPath: '/dist/',
	},
	resolve: {
		modules: [path.resolve(__dirname, 'node_modules'), path.resolve(globalRootPath, 'node_modules')],
		extensions: ['.tsx', '.jsx', '.ts', '...'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	devServer: {
		static: {
			directory: path.resolve(path.join(__dirname, 'public')),
		},
		compress: true,
		port: 3000,
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
		new Dotenv({
			path: path.resolve(path.join(__dirname, '.env')),
		}),
	],
	stats: {
		errorDetails: true,
	},
};
