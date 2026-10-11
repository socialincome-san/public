import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ContactIcon, LongHairIcon, PaperPlaneIcon, QuoteIcon, ShortHairIcon } from './custom-icons';

const meta = {
	title: 'Icons/Custom Icons',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const icons = [
	{ name: 'ContactIcon', Icon: ContactIcon },
	{ name: 'PaperPlaneIcon', Icon: PaperPlaneIcon },
	{ name: 'QuoteIcon', Icon: QuoteIcon },
	{ name: 'LongHairIcon', Icon: LongHairIcon },
	{ name: 'ShortHairIcon', Icon: ShortHairIcon },
];

export const All: Story = {
	render: () => (
		<div className="text-primary grid grid-cols-3 gap-6">
			{icons.map(({ name, Icon }) => (
				<div key={name} className="flex items-center gap-3">
					<Icon />
					<code className="font-mono text-xs">{name}</code>
				</div>
			))}
		</div>
	),
};
