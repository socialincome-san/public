import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { DurationBadge } from '../../data-display/duration-badge/duration-badge';
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
					'The header of a profile page: name, short bio, key facts, tags such as circles and actions such as social links next to a large portrait.',
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
		imageBadge: <DurationBadge label="3 years +" since="Since Mar 4, 2023" />,
		facts: [
			{ label: 'Role', value: 'Program Lead' },
			{ label: 'Volunteering since', value: 'Mar 4, 2023' },
			{ label: 'Time commitment', value: '4-8 hrs / week' },
		],
		tags: { label: 'Circles', items: ['Technology', 'Partnerships', 'Community'] },
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
	},
};
