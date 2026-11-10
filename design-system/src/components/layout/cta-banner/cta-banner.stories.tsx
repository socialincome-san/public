import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { CtaBanner } from './cta-banner';

const meta = {
	title: 'Layout/CtaBanner',
	component: CtaBanner,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A dark, rounded banner that invites the reader to one action, such as starting a fundraiser. An optional background image fades into the dark fill behind the text.',
			},
		},
	},
	args: {
		title: 'Start your own fundraiser campaign',
		description:
			'A birthday, a marathon, a wedding — any occasion can fund a Social Income. Pick a program, set a goal, share your page.',
		action: <Button variant="secondary">Start your campaign</Button>,
	},
} satisfies Meta<typeof CtaBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
	args: {
		image: { src: '/assets/storybook/market-sierra-leone.jpg', alt: '' },
	},
};

export const WithoutImage: Story = {};

export const TitleOnly: Story = {
	args: {
		description: undefined,
	},
};
