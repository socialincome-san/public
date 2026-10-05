import type { StorybookConfig } from '@storybook/nextjs-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
	stories: ['./design-system.mdx', '../src/**/*.stories.@(ts|tsx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-designs'],
	framework: {
		name: '@storybook/nextjs-vite',
		options: {},
	},
	staticDirs: ['../public'],
	// Vite handles CSS @import before PostCSS, which drops @theme and the token files.
	viteFinal: (config) =>
		mergeConfig(config, {
			plugins: [tailwindcss()],
		}),
};

export default config;
