import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	staticDirs: ['../public'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-styling',
		'@storybook/addon-interactions',
		'@storybook/addon-mdx-gfm',
	],
	typescript: {
		check: false,
	},
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	features: {
		storyStoreV7: true,
	},
	async viteFinal(config) {
		const storybookPathPrefix = process.env.STORYBOOK_PATH_PREFIX;
		let configOverwrite: typeof config = {};

		// Required for subfolder deployments on GitHub pages.
		if (storybookPathPrefix) {
			console.log(`STORYBOOK_PATH_PREFIX set to ${storybookPathPrefix}`);
			configOverwrite = {
				...configOverwrite,
				base: storybookPathPrefix,
			};
		}
		return mergeConfig(config, configOverwrite);
	},
	docs: {
		autodocs: true,
	},
};

module.exports = config;
