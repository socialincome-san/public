import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { CookieBanner } from './cookie-banner';

const meta = {
	title: 'Feedback/CookieBanner',
	component: CookieBanner,
	tags: ['autodocs'],
	args: {
		title: 'We value your privacy',
		description: 'We use cookies for anonymous usage statistics that help us improve the website.',
		acceptLabel: 'Accept',
		declineLabel: 'Decline',
		onAccept: fn(),
		onDecline: fn(),
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Non-blocking consent banner pinned to the bottom of the viewport. The caller decides when to show it and stores the choice.',
			},
			story: { inline: false, iframeHeight: 320 },
		},
	},
} satisfies Meta<typeof CookieBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLink: Story = {
	args: {
		description: (
			<>
				We use cookies for anonymous usage statistics that help us improve the website. Read more in our{' '}
				<a href="#privacy">privacy policy</a>.
			</>
		),
	},
};
