import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ContactIcon, LongHairIcon, PaperPlaneIcon, PeopleIcon, QuoteIcon, ShortHairIcon } from './custom-icons';

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
	{ name: 'PeopleIcon', Icon: () => <PeopleIcon size={20} /> },
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

export const PeopleIconInText: Story = {
	render: () => (
		<div className="text-foreground flex flex-col gap-4">
			<p className="flex items-baseline gap-[0.3em] text-xs">
				<PeopleIcon />8 Recipients
			</p>
			<p className="flex items-baseline gap-[0.3em] text-base">
				<PeopleIcon />8 Recipients
			</p>
			<p className="flex items-baseline gap-[0.3em] text-3xl">
				<PeopleIcon />8 Recipients
			</p>
		</div>
	),
};

export const PeopleIconSizes: Story = {
	render: () => (
		<div className="text-primary flex items-end gap-6">
			<PeopleIcon size={16} />
			<PeopleIcon size={32} />
			<PeopleIcon size={64} />
		</div>
	),
};

export const PeopleIconOnSurfaces: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<div className="bg-card text-foreground rounded-xl p-6">
				<PeopleIcon size={48} />
			</div>
			<div className="bg-muted text-foreground rounded-xl p-6">
				<PeopleIcon size={48} />
			</div>
			<div className="bg-primary text-primary-foreground rounded-xl p-6">
				<PeopleIcon size={48} />
			</div>
		</div>
	),
};
