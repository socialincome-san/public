import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
	AppStoreIcon,
	FacebookIcon,
	GithubIcon,
	GooglePlayIcon,
	InstagramIcon,
	LinkedinIcon,
	TiktokIcon,
	XIcon,
	YoutubeIcon,
} from './social-icons';

const meta = {
	title: 'Icons/Social Icons',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const icons = [
	{ name: 'FacebookIcon', Icon: FacebookIcon },
	{ name: 'InstagramIcon', Icon: InstagramIcon },
	{ name: 'LinkedinIcon', Icon: LinkedinIcon },
	{ name: 'TiktokIcon', Icon: TiktokIcon },
	{ name: 'XIcon', Icon: XIcon },
	{ name: 'YoutubeIcon', Icon: YoutubeIcon },
	{ name: 'GithubIcon', Icon: GithubIcon },
	{ name: 'AppStoreIcon', Icon: AppStoreIcon },
	{ name: 'GooglePlayIcon', Icon: GooglePlayIcon },
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
