import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LinkPill } from '../../actions/link-pill/link-pill';
import { ExpandableCard } from './expandable-card';

const meta = {
	title: 'Data Display/ExpandableCard',
	component: ExpandableCard,
	tags: ['autodocs'],
	args: {
		title: 'Cash transfers reduce partner violence',
		description:
			'A randomized experiment found that cash, voucher, and food transfers targeted to women reduced physical and sexual violence by 25-35%, primarily by alleviating household financial stress.',
		meta: 'IFPRI / Johns Hopkins University, 2016',
		action: <LinkPill href="#" label="Read study" external />,
		closeLabel: 'Close',
	},
	parameters: {
		docs: {
			description: {
				component: 'A card whose title and text are clamped; clicking it opens a dialog with the full text.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-[24rem] max-w-full">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ExpandableCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
	args: {
		title: 'Cash transfers decrease violence in polygamous households across several regions of rural Mali',
		description:
			"An experimental study of Mali's cash transfer program found that physical violence decreased by 7 percentage points and controlling behaviors by 16 percentage points in polygamous households. The effects persisted after the program ended and were strongest where transfers were paid to women directly, suggesting that reduced financial stress and stronger bargaining power both played a role.",
	},
};

export const WithoutAction: Story = {
	args: {
		action: undefined,
		meta: undefined,
	},
};
