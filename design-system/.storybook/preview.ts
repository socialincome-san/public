import type { Preview } from '@storybook/nextjs-vite';
import { create } from 'storybook/theming';
import { fontBase } from './font';

import '../src/styles.css';

const preview: Preview = {
	parameters: {
		layout: 'centered',
		docs: {
			codePanel: true,
			theme: create({ base: 'light', fontBase }),
		},
		options: {
			storySort: {
				order: [
					'Design System',
					'Foundations',
					['Colors', 'Typography', 'Spacing & Layout', 'Radius', 'Shadows', 'Motion'],
					'Actions',
					'Forms',
					'Overlays',
					'Navigation',
					'Feedback',
					'Data Display',
					'Layout',
					'Brand',
					['Logo', ['Static', 'Animated']],
					'Icons',
				],
			},
		},
	},
};

export default preview;
