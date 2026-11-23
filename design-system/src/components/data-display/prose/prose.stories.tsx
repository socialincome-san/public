import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Prose } from './prose';

const meta = {
	title: 'Data Display/Prose',
	component: Prose,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="max-w-2xl">
				<Story />
			</div>
		),
	],
	args: {
		children: (
			<>
				<p>
					We are raising money for <strong>Social Income</strong> because a basic income lets people decide{' '}
					<em>for themselves</em> what they need most.
				</p>
				<ul>
					<li>Paid directly to mobile phones</li>
					<li>No conditions attached</li>
				</ul>
				<p>
					Read more on <a href="https://socialincome.org">our website</a>.
				</p>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				component: 'Typography for formatted running text, such as paragraphs, lists and links written by people.',
			},
		},
	},
} satisfies Meta<typeof Prose>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
	args: { size: 'lg' },
};
