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
	},
};

export default preview;
