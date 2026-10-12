import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Badge } from '../../data-display/badge/badge';
import { DurationBadge } from '../../data-display/duration-badge/duration-badge';
import { FactCard } from '../../data-display/fact-card/fact-card';
import { GithubIcon, LinkedinIcon } from '../../icons/social-icons/social-icons';
import { ProfileHeader } from './profile-header';

const meta = {
	title: 'Layout/Profile Header',
	component: ProfileHeader,
	tags: ['autodocs'],
	args: {
		name: 'Aminata Kamara',
		image: { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Aminata Kamara' },
		description: 'Aminata coordinates the programme in Freetown and makes sure every recipient gets their payment on time.',
	},
	parameters: {
		docs: {
			description: {
				component:
					'The header of a profile page: portrait, name, actions such as social links, fact cards in a grid that adapts to their number, and a short bio.',
			},
		},
	},
} satisfies Meta<typeof ProfileHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutImage: Story = {
	args: { image: null },
};

export const Complete: Story = {
	args: {
		imageBadge: <DurationBadge label="3 years" since="Since Mar 4, 2023" />,
		actions: (
			<>
				<Button asChild size="sm" variant="outline">
					<a href="https://www.linkedin.com">
						<LinkedinIcon />
						LinkedIn
					</a>
				</Button>
				<Button asChild size="sm" variant="outline">
					<a href="https://github.com">
						<GithubIcon />
						GitHub
					</a>
				</Button>
			</>
		),
		children: [
			<FactCard key="role" label="Role" value="Program Lead" />,
			<FactCard
				key="commitment"
				label="Time commitment"
				value="4-8 hrs / week"
				details={{ title: 'Volunteer commitment', facts: [{ label: 'Work style', value: 'Async' }] }}
			/>,
			<FactCard key="circles" label="Circles">
				<div className="flex flex-wrap gap-2">
					<Badge variant="primary" size="lg">
						Tech Circle
					</Badge>
					<Badge variant="primary-outline" size="lg">
						Partnership Circle
					</Badge>
				</div>
			</FactCard>,
		],
	},
};

export const TwoFacts: Story = {
	args: {
		children: [
			<FactCard key="role" label="Role" value="Program Lead" />,
			<FactCard key="commitment" label="Time commitment" value="4-8 hrs / week" />,
		],
	},
};
