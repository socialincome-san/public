import type { Preview } from '@storybook/nextjs-vite';

import '../src/styles.css';

const preview: Preview = {
	parameters: {
		layout: 'centered',
		nextjs: {
			appDirectory: true,
		},
		docs: {
			codePanel: true,
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
					'Icons',
				],
			},
		},
	},
};

export default preview;
