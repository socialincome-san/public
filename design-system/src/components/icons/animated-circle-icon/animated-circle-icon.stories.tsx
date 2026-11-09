import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LinkPill } from '../../actions/link-pill/link-pill';
import { Badge } from '../../data-display/badge/badge';
import { AnimatedCircleIcon } from './animated-circle-icon';

const meta = {
	title: 'Icons/Animated Circle Icon',
	component: AnimatedCircleIcon,
	tags: ['autodocs'],
	args: { size: 48 },
	parameters: {
		docs: {
			description: {
				component:
					'A decorative ring with a member dot orbiting it, for pills, links, cards or heroes. Above 40px the stroke and dot get thinner. Renders still when the user prefers reduced motion. The dot is dark on light surfaces and light on dark ones: dark surfaces such as the `primary` Badge set `scheme-dark`.',
			},
		},
	},
} satisfies Meta<typeof AnimatedCircleIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Deep: Story = { args: { variant: 'deep' } };

export const CyanDeep: Story = { args: { variant: 'cyanDeep' } };

export const SeaGlass: Story = { args: { variant: 'seaGlass' } };

export const Hero: Story = { args: { size: 130, variant: 'cyanDeep' } };

export const InPill: Story = {
	render: () => <LinkPill label="Communication" href="/circles/communication" icon={<AnimatedCircleIcon size={22} />} />,
};

const variantNames = ['default', 'deep', 'cyanDeep', 'seaGlass'] as const;

export const OnLightAndDarkSurfaces: Story = {
	render: () => (
		<div className="grid gap-4">
			{['bg-background', 'bg-primary scheme-dark'].map((surface) => (
				<div key={surface} className={`${surface} flex flex-wrap items-center gap-6 rounded-3xl border p-6`}>
					{variantNames.map((variant) => (
						<AnimatedCircleIcon key={variant} size={48} variant={variant} />
					))}
					<Badge size="xl" variant={surface === 'bg-background' ? 'country' : 'primary'}>
						<AnimatedCircleIcon />
						Technology Circle
					</Badge>
				</div>
			))}
		</div>
	),
};
