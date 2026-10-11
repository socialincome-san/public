import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LinkPill } from '../../actions/link-pill/link-pill';
import { DetailPanel } from './detail-panel';

const meta = {
	title: 'Data Display/DetailPanel',
	component: DetailPanel,
	tags: ['autodocs'],
	args: {
		title: 'Recipients',
		value: '162',
		children: <LinkPill label="View demographics" onClick={() => undefined} />,
	},
	parameters: {
		docs: {
			description: {
				component: 'A card on a detail page: a title with a key figure, text or a side image.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-[40rem] max-w-full">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DetailPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KeyFigure: Story = {};

export const Text: Story = {
	args: {
		title: 'About',
		value: undefined,
		children: <p className="text-foreground text-base">A pilot program paying 700 SLE a month to 162 recipients.</p>,
	},
};

export const WithMedia: Story = {
	args: {
		title: 'Sierra Leone',
		value: undefined,
		children: <LinkPill label="Country analysis" href="#" />,
		media: <div className="bg-muted h-full w-full rounded-lg" />,
	},
};
