import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { AnimatedSILogoIcon, SILogo, SocialIncomeLogo } from './logo';

const onLight: Decorator = (Story) => (
	<div className="text-primary">
		<Story />
	</div>
);

const onDark: Decorator = (Story) => (
	<div className="bg-primary text-primary-foreground rounded-3xl p-10">
		<Story />
	</div>
);

const describe = (story: string) => ({ docs: { description: { story } } });

const meta = {
	title: 'Brand/Logo/Static',
	component: SocialIncomeLogo,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'The Social Income logos as SVG. They take the text color, so the same component is blue on light backgrounds and white on dark ones. The animated wordmark in the footer is under Brand › Logo › Animated. Storybook’s own sidebar uses SVG copies of the wordmark from `public/assets/storybook`.',
			},
		},
	},
} satisfies Meta<typeof SocialIncomeLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Wordmark: Story = {
	decorators: [onLight],
	parameters: describe('Site header and mobile menu.'),
};

export const WordmarkWhite: Story = {
	name: 'Wordmark (white)',
	decorators: [onDark],
	parameters: describe('On dark backgrounds, e.g. the site footer while its animation is unavailable.'),
};

export const Mark: Story = {
	render: () => <SILogo />,
	decorators: [onLight],
	parameters: describe('The short mark where the wordmark does not fit, e.g. the portal navbar.'),
};

export const MarkWhite: Story = {
	name: 'Mark (white)',
	render: () => <SILogo />,
	decorators: [onDark],
};

export const LoadingMark: Story = {
	render: () => <AnimatedSILogoIcon />,
	decorators: [onLight],
	parameters: describe('The mark with falling slashes, shown while an app is loading.'),
};
