import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Banner } from './banner';

const text = (
	<>
		<p className="mb-4">
			Social Income pays <a href="#">unconditional basic incomes</a> to people living in poverty in Sierra Leone.
		</p>
		<p>
			Every month, recipients receive their income directly on their mobile phones. They decide for themselves what they
			spend it on: food, school fees, a small business or medical care.
		</p>
	</>
);

const meta = {
	title: 'Data Display/Banner',
	component: Banner,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="max-w-xl">
				<Story />
			</div>
		),
	],
	args: {
		children: text,
	},
	parameters: {
		docs: {
			description: {
				component:
					'A highlighted block of text inside an article. Collapsible banners show only their first line until the reader clicks them; links in that line stay clickable.',
			},
		},
	},
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Outline: Story = {};

export const Primary: Story = {
	args: { variant: 'primary' },
};

export const Tint: Story = {
	args: { variant: 'tint' },
};

export const Gradient: Story = {
	args: { variant: 'gradient' },
};

export const Highlight: Story = {
	args: { variant: 'highlight' },
};

export const Small: Story = {
	args: { size: 'sm' },
};

export const Collapsible: Story = {
	args: { variant: 'gradient', collapsible: { expandLabel: 'Show more', collapseLabel: 'Show less' } },
};

export const CollapsedByDefault: Story = {
	args: {
		variant: 'gradient',
		collapsible: { expandLabel: 'Show more', collapseLabel: 'Show less', defaultCollapsed: true },
	},
};
