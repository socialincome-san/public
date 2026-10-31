import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { fontBase } from './font';
import './manager.css';

const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

addons.setConfig({
	theme: create({
		base: dark ? 'dark' : 'light',
		brandTitle: 'Social Income Design System',
		brandUrl: 'https://socialincome.org',
		brandImage: dark ? '/assets/storybook/social-income-logo-white.svg' : '/assets/storybook/social-income-logo.svg',
		brandTarget: '_blank',
		fontBase,
	}),
});
