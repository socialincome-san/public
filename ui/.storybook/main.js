import { dirname, join } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
	return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

	addons: [
		getAbsolutePath('@storybook/addon-onboarding'),
		getAbsolutePath('@storybook/addon-essentials'),
		getAbsolutePath('@storybook/addon-interactions'),
	],

	framework: {
		name: getAbsolutePath('@storybook/react-vite'),
		options: {},
	},

	viteFinal: async (config) => {
		// Use PostCSS config from postcss.config.js
		config.css = {
			postcss: true,
		};
		return config;
	},

	docs: {},

	typescript: {
		reactDocgen: 'react-docgen-typescript',
	},
};
export default config;
