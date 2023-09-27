/* global require, __dirname, module */
/* eslint @typescript-eslint/no-var-requires: 0 */

// node imports
const fs = require('fs')
const process = require('process')
const path = require('path')

// load all our webpack plugins
const CopyPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { DefinePlugin } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const GenerateFileWebpackPlugin = require('generate-file-webpack-plugin')

// check current env we're building for
const env = process.env.NODE_ENV ?? 'development'

// extra options in case we're in specific envs
let cssLoader = 'style-loader'
let extraPlugins = []
let extraBabelPlugins = []
if (env === 'development') {
	// add Fast Refresh if in dev mode
	extraPlugins.push(new ReactRefreshWebpackPlugin())
	extraBabelPlugins.push('react-refresh/babel')
}
if (env === 'production') {
	// extract CSS in prod mode
	cssLoader = MiniCssExtractPlugin.loader
	extraPlugins.push(
		new MiniCssExtractPlugin({ filename: 'assets/code/styles.css' }),
	)
} else {
	extraPlugins.push(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		new GenerateFileWebpackPlugin({
			file: 'assets/code/styles.css',
			content: '/* using style-loader, no CSS generated */',
		}),
	)
}

// setup DefinePlugin with the env itself and the env files
let defines = {
	'process.env.NODE_ENV': JSON.stringify(env),
	'process.env.DEBUG': JSON.stringify(process.env.DEBUG ?? '0'),
}
for (const envFile of [
	'.env',
	'.env.local',
	`.env.${env}`,
	`.env.${env}.local`,
]) {
	let data
	try {
		data = fs.readFileSync(envFile, 'utf8')
	} catch (e) {
		continue
	}
	data.split(/\r?\n/g)
		.map(x => x.split('#')[0])
		.filter(x => x)
		.map(x => x.split('=', 2))
		.forEach(
			([k, v]) =>
				(defines[`process.env.${k}`] = '(' + JSON.stringify(v) + ')'),
		)
}

const sourceRoot = path.normalize(__dirname + '/src')
const babelOptions = {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: {
					esmodules: true,
				},
			},
		],
		'@babel/preset-typescript',
		[
			'@babel/preset-react',
			{
				runtime: 'automatic',
				development: env === 'development',
			},
		],
	],
	sourceType: 'module',
	plugins: [...extraBabelPlugins],
}

// build our cursed webpack config
module.exports = [
	{
		mode: env === 'production' ? 'production' : 'development',
		devtool: 'source-map',
		optimization:
			env === 'production'
				? {
						minimize: true,
						minimizer: [
							new TerserPlugin(),
							new CssMinimizerPlugin(),
						],
				  }
				: undefined,
		resolve: {
			extensions: ['.js', '.ts', '.tsx'],
		},
		target: 'web',
		entry: {
			main: './src/index.ts',
		},
		output: {
			filename: 'assets/code/index.js',
			path: __dirname + '/dist',
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					include: [sourceRoot],
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: babelOptions,
					},
				},
				{
					test: /\.s?css$/,
					include: [sourceRoot],
					exclude: /node_modules/,
					use: [
						cssLoader,
						{
							loader: 'css-loader',
							options: {
								modules: true,
								url: {
									filter: path => !path.startsWith('/'),
								},
							},
						},
						'postcss-loader',
						'sass-loader',
					],
				},
			],
		},
		plugins: [
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				reportFilename: '../report/webpack-analyzer.html',
				openAnalyzer: false,
			}),
			new CopyPlugin({
				patterns: [{ from: 'public', to: '.' }],
			}),
			new DefinePlugin(defines),
			new ForkTsCheckerWebpackPlugin({
				typescript: {
					diagnosticOptions: {
						semantic: true,
						syntactic: true,
					},
					mode: 'write-references',
				},
			}),
			...extraPlugins,
		],
		devServer: {
			static: {
				directory: __dirname + '/public',
			},
			proxy: {
				'/api': 'http://localhost:3000',
				'/api/ws': {
					target: 'ws://localhost:3000',
					ws: true,
				},
			},
			port: 3001,
			hot: true,
			client: { overlay: false },
			historyApiFallback: {
				index: 'index.html',
			},
			setupMiddlewares: (middlewares, devServer) => {
				if (!devServer) {
					throw new Error('webpack-dev-server is not defined')
				}
				devServer.app.get('/assets/code/styles.css', (_req, res) => {
					res.setHeader('content-type', 'text/css')
					res.send('/* using style-loader, no CSS generated */')
				})
				return middlewares
			},
		},
	},
]
