import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ContributionCard, ContributionCardPerson } from './contribution-card';

const pages = [
	'Our Work',
	'Transparency',
	'About us',
	'Programs',
	'Local partners',
	'Get involved',
	'Journal',
	'Countries',
	'Open source',
	'Campaigns',
];
const roles = [['Product Owner'], ['Content'], ['Development'], ['Product Owner', 'Content']];

const makeItems = (count: number) =>
	Array.from({ length: count }, (_, index) => ({
		title: `${pages[index % pages.length]}${index >= pages.length ? ` ${Math.floor(index / pages.length) + 1}` : ''}`,
		href: '#',
		badges: roles[index % roles.length],
	}));

const summary = (count: number, imageSrc: string | null = '/assets/storybook/placeholder-portrait.svg') => (
	<>
		<ContributionCardPerson name="Aminata" fullName="Aminata Kamara" imageSrc={imageSrc} /> looks after{' '}
		<strong>{count} pages</strong> on this website.
	</>
);

const meta = {
	title: 'Data Display/ContributionCard',
	component: ContributionCard,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'One kind of contribution of a person: a sentence that sums it up and the list behind it, with a link and badges per row. Shows six rows (two on phones) and reveals six more per click. Several cards sit in a grid.',
			},
		},
	},
	args: {
		summary: summary(30),
		items: makeItems(30),
		showMoreLabel: 'Show {count} more',
		counterLabel: '{shown} of {total}',
	},
} satisfies Meta<typeof ContributionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewItems: Story = {
	args: {
		summary: summary(2),
		items: makeItems(2),
	},
};

// More than a phone shows at first, but not more than a wide screen does
export const LoadMoreOnPhonesOnly: Story = {
	args: {
		summary: summary(4),
		items: makeItems(4),
	},
};

export const LastStepIsSmaller: Story = {
	args: {
		summary: summary(8),
		items: makeItems(8),
	},
};

export const WithoutPortrait: Story = {
	args: {
		summary: summary(30, null),
	},
};

export const WithIcons: Story = {
	args: {
		items: makeItems(8).map((item) => ({
			...item,
			icon: <span className="bg-muted size-full" />,
		})),
	},
};

export const LongTitlesAndBadges: Story = {
	args: {
		items: makeItems(8).map((item) => ({
			...item,
			title: `${item.title}: how unconditional cash transfers reach people living in poverty`,
			badges: ['Product Owner', 'Content', 'Development'],
		})),
	},
};

export const SeveralCards: Story = {
	render: (args) => (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-3 sm:gap-4">
			<ContributionCard {...args} />
			<ContributionCard {...args} summary={summary(4)} items={makeItems(4)} />
		</div>
	),
};
