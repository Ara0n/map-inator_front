/* global module */
module.exports = {
	'./*.cjs': ['prettier -w', 'eslint'],
	'./*.yml': ['prettier -w'],
	'./package.json': ['prettier -w'],
	'src/**/*.tsx?': [
		'prettier -w',
		'eslint',
		() => 'tsc -p tsconfig.json --noEmit',
	],
}
