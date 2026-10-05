import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
	stories: ['./design-system.mdx', '../src/**/*.stories.@(ts|tsx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-designs'],
	framework: {
		name: '@storybook/nextjs-vite',
		options: {},
	},
	staticDirs: ['../public', { from: '../../website/public/assets/flags', to: '/assets/flags' }],
};

export default config;
