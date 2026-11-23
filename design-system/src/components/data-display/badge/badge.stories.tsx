import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
	ArrowRight,
	ArrowUpRight,
	Check,
	ChevronDown,
	ChevronRight,
	ChevronsDownUp,
	ChevronsUpDown,
	ChevronUp,
	ExternalLink,
	Hourglass,
	Maximize2,
	Minimize2,
	Play,
} from 'lucide-react';
import { type ComponentProps, type ReactNode } from 'react';
import { AnimatedCircleIcon } from '../../icons/animated-circle-icon/animated-circle-icon';
import { PeopleIcon } from '../../icons/custom-icons/custom-icons';
import { CountryFlag } from '../country-flag/country-flag';
import { Badge } from './badge';

type BadgeSize = NonNullable<ComponentProps<typeof Badge>['size']>;

// Outside the gradient-outline variants the caller sizes Lucide icons; 1em follows the badge text
const lucideIconClass = 'size-[1em] shrink-0';

// AnimatedCircleIcon takes px; 22 is its size in an xl badge on the website
const circleIconSizes: Record<BadgeSize, number> = { sm: 12, default: 14, lg: 16, xl: 22 };

// Every kind of icon badges use: design system icons, a round flag, and Lucide icons for status, links and toggles
const icons = {
	none: () => null,
	PeopleIcon: () => <PeopleIcon />,
	CountryFlag: () => <CountryFlag country="ch" size="inline" decorative />,
	AnimatedCircleIcon: (size) => <AnimatedCircleIcon size={circleIconSizes[size]} />,
	Check: () => <Check className={lucideIconClass} aria-hidden />,
	Hourglass: () => <Hourglass className={lucideIconClass} aria-hidden />,
	Play: () => <Play className={`${lucideIconClass} fill-current`} aria-hidden />,
	ChevronRight: () => <ChevronRight className={lucideIconClass} aria-hidden />,
	ArrowRight: () => <ArrowRight className={lucideIconClass} aria-hidden />,
	ArrowUpRight: () => <ArrowUpRight className={lucideIconClass} aria-hidden />,
	ExternalLink: () => <ExternalLink className={lucideIconClass} aria-hidden />,
	ChevronDown: () => <ChevronDown className={lucideIconClass} aria-hidden />,
	ChevronUp: () => <ChevronUp className={lucideIconClass} aria-hidden />,
	ChevronsUpDown: () => <ChevronsUpDown className={lucideIconClass} aria-hidden />,
	ChevronsDownUp: () => <ChevronsDownUp className={lucideIconClass} aria-hidden />,
	Maximize2: () => <Maximize2 className={lucideIconClass} aria-hidden />,
	Minimize2: () => <Minimize2 className={lucideIconClass} aria-hidden />,
} satisfies Record<string, (size: BadgeSize) => ReactNode>;

type IconName = keyof typeof icons;

const iconLabels: Record<IconName, string> = {
	none: 'none',
	PeopleIcon: 'PeopleIcon (design system)',
	CountryFlag: 'CountryFlag, e.g. Switzerland (design system)',
	AnimatedCircleIcon: 'AnimatedCircleIcon (design system)',
	Check: 'Check (Lucide, status)',
	Hourglass: 'Hourglass (Lucide, status)',
	Play: 'Play (Lucide, video)',
	ChevronRight: 'ChevronRight (Lucide, link)',
	ArrowRight: 'ArrowRight (Lucide, link)',
	ArrowUpRight: 'ArrowUpRight (Lucide, link to another page or site)',
	ExternalLink: 'ExternalLink (Lucide, opens in a new tab)',
	ChevronDown: 'ChevronDown (Lucide, expand)',
	ChevronUp: 'ChevronUp (Lucide, collapse)',
	ChevronsUpDown: 'ChevronsUpDown (Lucide, expand)',
	ChevronsDownUp: 'ChevronsDownUp (Lucide, collapse)',
	Maximize2: 'Maximize2 (Lucide, enlarge)',
	Minimize2: 'Minimize2 (Lucide, shrink)',
};

const iconNames: IconName[] = [
	'none',
	'PeopleIcon',
	'CountryFlag',
	'AnimatedCircleIcon',
	'Check',
	'Hourglass',
	'Play',
	'ChevronRight',
	'ArrowRight',
	'ArrowUpRight',
	'ExternalLink',
	'ChevronDown',
	'ChevronUp',
	'ChevronsUpDown',
	'ChevronsDownUp',
	'Maximize2',
	'Minimize2',
];

// AnimatedCircleIcon is a leading icon: at xl it nests into the rounded left edge
const trailingIconNames: IconName[] = iconNames.filter((name) => name !== 'AnimatedCircleIcon');

// A trailing link icon promises a link, so the story wraps the badge in one and the badge shows its hover state
const linkIcons: IconName[] = ['ChevronRight', 'ArrowRight', 'ArrowUpRight', 'ExternalLink'];

const linkClass =
	'focus-visible:ring-ring inline-flex rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

// `leadingIcon` and `trailingIcon` exist only in Storybook, to try icons from the controls; in code icons are children
type BadgeStoryArgs = ComponentProps<typeof Badge> & { leadingIcon: IconName; trailingIcon: IconName };

const meta = {
	title: 'Data Display/Badge',
	component: Badge,
	tags: ['autodocs'],

	args: {
		children: 'Badge',
		leadingIcon: 'none',
		trailingIcon: 'none',
	},

	render: ({ leadingIcon, trailingIcon, children, ...args }) => {
		const size = args.size ?? 'default';
		const badge = (
			<Badge {...args}>
				{icons[leadingIcon](size)}
				{children}
				{icons[trailingIcon](size)}
			</Badge>
		);

		return linkIcons.includes(trailingIcon) ? (
			<a href="#" className={linkClass}>
				{badge}
			</a>
		) : (
			badge
		);
	},

	parameters: {
		docs: {
			description: {
				component:
					'A badge displays short status or contextual information. The animated `gradient-outline` is an accent: use at most one per view. Its surface is muted; `gradient-outline-background` has a white surface for muted or tinted backgrounds. Icons are children, before or after the text: design system icons, a `CountryFlag`, or Lucide icons. A badge is not interactive itself; inside a link it fades slightly on hover.',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=23-995&p=f&t=zjQYKr57x1DPvxtF-0',
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'secondary',
				'outline',
				'outline-solid',
				'destructive',
				'verified',
				'country',
				'fundraising',
				'video',
				'frosted',
				'ghost',
				'primary',
				'primary-outline',
				'gradient-outline',
				'gradient-outline-background',
			],
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg', 'xl'],
		},
		children: {
			control: 'text',
		},
		leadingIcon: {
			control: { type: 'select', labels: iconLabels },
			options: iconNames,
			description: 'Storybook only: an icon passed as a child before the text, e.g. `<PeopleIcon />`.',
		},
		trailingIcon: {
			control: { type: 'select', labels: iconLabels },
			options: trailingIconNames,
			description:
				'Storybook only: an icon passed as a child after the text, e.g. a Lucide `<ArrowRight />`. With a link icon the story wraps the badge in a link, so hovering shows the hover state.',
		},
	},
} satisfies Meta<BadgeStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge>Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="outline">Outline</Badge>
			<Badge variant="outline-solid">Outline Solid</Badge>
			<Badge variant="destructive">Destructive</Badge>
			<Badge variant="verified">Verified</Badge>
			<Badge variant="country">Country</Badge>
			<Badge variant="fundraising">Fundraising</Badge>
			<Badge variant="primary">Primary</Badge>
			<Badge variant="primary-outline">Primary Outline</Badge>
			<Badge variant="gradient-outline">Gradient Outline</Badge>
			<Badge variant="gradient-outline-background">Gradient Outline Background</Badge>
		</div>
	),
};

export const OnMedia: Story = {
	render: () => (
		<div className="bg-muted-foreground flex flex-wrap items-center gap-3 rounded-3xl p-8">
			<Badge variant="video">Video</Badge>
			<Badge variant="frosted">Frosted</Badge>
		</div>
	),
};

export const OnDarkSurface: Story = {
	render: () => (
		<div className="bg-foreground flex flex-wrap items-center gap-3 rounded-3xl p-8 scheme-dark">
			<Badge variant="ghost" size="lg">
				<CountryFlag country="ch" size="inline" decorative />
				Switzerland
			</Badge>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge size="sm">Small</Badge>
			<Badge>Default</Badge>
			<Badge size="lg">Large</Badge>
			<Badge size="xl">Extra large</Badge>
		</div>
	),
};

export const GradientOutline: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge variant="gradient-outline">8</Badge>
			<Badge variant="gradient-outline">8 Recipients</Badge>
		</div>
	),
};

export const GradientOutlineWithIcon: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge variant="gradient-outline">
				<PeopleIcon />8
			</Badge>
			<Badge variant="gradient-outline">
				<PeopleIcon />8 Recipients
			</Badge>
		</div>
	),
};

export const IconOptions: Story = {
	render: () => (
		<div className="grid grid-cols-[auto_auto_auto] items-center gap-x-6 gap-y-3">
			{iconNames
				.filter((name) => name !== 'none')
				.map((name) => (
					<div key={name} className="col-span-3 grid grid-cols-subgrid items-center">
						<code className="font-mono text-xs">{name}</code>
						<div>
							<Badge variant="gradient-outline" size="xl">
								{icons[name]('xl')}
								Leading
							</Badge>
						</div>
						<div>
							{trailingIconNames.includes(name) && (
								<Badge variant="gradient-outline" size="xl">
									Trailing
									{icons[name]('xl')}
								</Badge>
							)}
						</div>
					</div>
				))}
		</div>
	),
};

export const IconsOnBothSides: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge variant="gradient-outline" size="lg">
				{icons.PeopleIcon()}8 Recipients
				{icons.ChevronRight()}
			</Badge>
			<Badge variant="gradient-outline" size="lg">
				{icons.CountryFlag()}
				Switzerland
				{icons.ArrowUpRight()}
			</Badge>
			<Badge variant="gradient-outline" size="lg">
				{icons.AnimatedCircleIcon('lg')}
				Technology Circle
				{icons.ChevronDown()}
			</Badge>
			<Badge variant="country" size="lg">
				{icons.CountryFlag()}
				Switzerland
				{icons.ChevronRight()}
			</Badge>
			<Badge variant="primary" size="lg">
				{icons.Check()}
				Paid
				{icons.ArrowRight()}
			</Badge>
		</div>
	),
};

export const InLink: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<a href="#" className={linkClass}>
				<Badge variant="gradient-outline" size="lg">
					{icons.PeopleIcon()}8 Recipients
					{icons.ChevronRight()}
				</Badge>
			</a>
			<a href="#" className={linkClass}>
				<Badge size="lg">
					Read more
					{icons.ArrowRight()}
				</Badge>
			</a>
		</div>
	),
};

export const GradientOutlineSizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge variant="gradient-outline" size="sm">
				<PeopleIcon />8 Recipients
			</Badge>
			<Badge variant="gradient-outline">
				<PeopleIcon />8 Recipients
			</Badge>
			<Badge variant="gradient-outline" size="lg">
				<PeopleIcon />8 Recipients
			</Badge>
			<Badge variant="gradient-outline" size="xl">
				<PeopleIcon />8 Recipients
			</Badge>
		</div>
	),
};

export const GradientOutlineSingleDigit: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge variant="gradient-outline" size="sm">
				1
			</Badge>
			<Badge variant="gradient-outline">1</Badge>
			<Badge variant="gradient-outline" size="lg">
				1
			</Badge>
			<Badge variant="gradient-outline" size="xl">
				1
			</Badge>
		</div>
	),
};

export const GradientOutlineCounts: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge variant="gradient-outline" size="lg">
				<PeopleIcon />1 Recipient
			</Badge>
			<Badge variant="gradient-outline" size="lg">
				<PeopleIcon />8 Recipients
			</Badge>
			<Badge variant="gradient-outline" size="lg">
				<PeopleIcon />
				1,280 Recipients
			</Badge>
		</div>
	),
};

export const GradientOutlineOnSurfaces: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<div className="bg-card rounded-xl p-6">
				<Badge variant="gradient-outline" size="lg">
					<PeopleIcon />8 Recipients
				</Badge>
			</div>
			<div className="bg-muted rounded-xl p-6">
				<Badge variant="gradient-outline" size="lg">
					<PeopleIcon />8 Recipients
				</Badge>
			</div>
			<div className="bg-backstage rounded-xl p-6">
				<Badge variant="gradient-outline" size="lg">
					<PeopleIcon />8 Recipients
				</Badge>
			</div>
		</div>
	),
};

export const GradientOutlineBackground: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<div className="bg-muted flex items-center gap-3 rounded-xl p-6">
				<Badge variant="gradient-outline-background" size="sm">
					1
				</Badge>
				<Badge variant="gradient-outline-background">
					<PeopleIcon />8 Recipients
				</Badge>
				<Badge variant="gradient-outline-background" size="lg">
					<PeopleIcon />8 Recipients
				</Badge>
				<Badge variant="gradient-outline-background" size="xl">
					<PeopleIcon />8 Recipients
				</Badge>
			</div>
			<div className="bg-backstage flex items-center rounded-xl p-6">
				<Badge variant="gradient-outline-background" size="lg">
					<PeopleIcon />8 Recipients
				</Badge>
			</div>
			<div className="bg-card flex items-center rounded-xl p-6">
				<Badge variant="gradient-outline-background" size="lg">
					<PeopleIcon />8 Recipients
				</Badge>
			</div>
		</div>
	),
};
