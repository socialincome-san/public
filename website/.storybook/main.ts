import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
	stories: ['./*.mdx', '../src/components/**/*.stories.@(ts|tsx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
	framework: {
		name: '@storybook/nextjs-vite',
		options: {},
	},
	staticDirs: ['../public'],
};

export default config;
