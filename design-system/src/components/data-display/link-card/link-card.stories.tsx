import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardGrid, CardGridItem } from '../../layout/card-grid/card-grid';
import { LinkCard } from './link-card';

const meta = {
	title: 'Data Display/Link Card',
	component: LinkCard,
	tags: ['autodocs'],
	args: {
		title: 'Donate',
		description:
			'Give 1% of your income, monthly or once. 88% of every donation goes directly to people living in extreme poverty.',
		href: '#',
		imageSrc: '/assets/storybook/market-sierra-leone.jpg',
	},
	parameters: {
		docs: {
			description: {
				component:
					'A card that links to a page, with an optional image, a small label above the title and a description. Cards in a `CardGrid` stretch to the tallest card in their row.',
			},
		},
	},
} satisfies Meta<typeof LinkCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithEyebrow: Story = {
	args: { eyebrow: 'For companies', title: 'Start a cash program' },
};

export const Illustration: Story = {
	args: {
		title: 'Individuals',
		description: 'Donate, fundraise or volunteer.',
		imageSrc: '/assets/storybook/illustration-bike.png',
		imageFit: 'contain',
	},
};

export const WithoutImage: Story = {
	args: { imageSrc: undefined },
};

export const TitleOnly: Story = {
	args: { imageSrc: undefined, description: undefined, title: 'Invite us for a talk' },
};

export const External: Story = {
	args: { external: true, title: 'Volunteer', imageSrc: undefined },
};

export const InGrid: Story = {
	render: (args) => (
		<CardGrid emptyMessage="No cards">
			<CardGridItem>
				<LinkCard {...args} eyebrow="For individuals" />
			</CardGridItem>
			<CardGridItem>
				<LinkCard {...args} eyebrow="For companies" title="Donate as a company" description={undefined} />
			</CardGridItem>
			<CardGridItem>
				<LinkCard {...args} eyebrow="For NGOs" title="Become a local partner" imageSrc={undefined} />
			</CardGridItem>
		</CardGrid>
	),
};
