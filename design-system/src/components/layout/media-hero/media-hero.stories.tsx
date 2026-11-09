import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Badge } from '../../data-display/badge/badge';
import { Card } from '../../data-display/card/card';
import {
	MediaHero,
	MediaHeroCard,
	MediaHeroChips,
	MediaHeroIntro,
	MediaHeroPill,
	MediaHeroStat,
	MediaHeroStats,
} from './media-hero';

const image = { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Recipients in Sierra Leone' };

const DonationCard = () => (
	<div className="w-96">
		<Card>
			<p className="text-foreground p-6">Donation form</p>
		</Card>
	</div>
);

const CallToActionCard = () => (
	<MediaHeroCard
		title="Ready to start?"
		description="Choose a country, who you support and your budget. You see the full cost before you submit."
		action={<Button fullWidth>Start a program</Button>}
	/>
);

const meta = {
	title: 'Layout/MediaHero',
	component: MediaHero,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The full-bleed hero at the top of a page: an image or video with the title on top, and an aside such as the donation form next to it on large screens and below it on small screens.',
			},
		},
	},
} satisfies Meta<typeof MediaHero>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DetailPage: Story = {
	args: {
		image,
		aside: <DonationCard />,
		mobileAside: <DonationCard />,
		children: (
			<MediaHeroIntro
				title="Sierra Leone"
				eyebrow={
					<MediaHeroChips>
						<Badge variant="frosted">Country</Badge>
					</MediaHeroChips>
				}
			>
				<MediaHeroChips>
					<MediaHeroPill>162 Recipients</MediaHeroPill>
					<MediaHeroPill>3 Programs</MediaHeroPill>
				</MediaHeroChips>
			</MediaHeroIntro>
		),
	},
};

export const PillWithBreakdown: Story = {
	args: {
		image,
		aside: <DonationCard />,
		mobileAside: <DonationCard />,
		children: (
			<MediaHeroIntro title="Sierra Leone">
				<MediaHeroChips>
					<MediaHeroPill
						breakdown={{
							rows: [
								{ label: 'Active', value: 120 },
								{ label: 'Former', value: 30 },
								{ label: 'Suspended', value: 12 },
							],
							extraRows: [
								{ label: 'New (30 days)', value: 8 },
								{ label: 'Waitlisted', value: 5 },
							],
						}}
					>
						162 Recipients
					</MediaHeroPill>
				</MediaHeroChips>
			</MediaHeroIntro>
		),
	},
};

export const Campaign: Story = {
	args: {
		image,
		overlay: 'strong',
		top: <Badge variant="fundraising">12 donations this week</Badge>,
		aside: <DonationCard />,
		mobileAside: <DonationCard />,
		children: (
			<>
				<MediaHeroIntro title="Run for Social Income" kicker="by Jane Doe" shadow />
				<MediaHeroStats>
					<MediaHeroStat label="62% raised in CHF" value="6’200" target="10’000" progress={62} />
					<MediaHeroStat label="Days left" value="18" progress={40} />
				</MediaHeroStats>
			</>
		),
	},
};

export const Statement: Story = {
	args: {
		image,
		align: 'center',
		aside: <DonationCard />,
		mobileAside: <DonationCard />,
		children: (
			<MediaHeroIntro
				variant="light"
				glow
				title={
					<>
						Fighting poverty <strong>with 1% of your salary</strong>
					</>
				}
				description="Social Income pays an unconditional basic income via mobile phone."
			>
				<div>
					<Button variant="outline-inverse" size="lg">
						Donate now
					</Button>
				</div>
			</MediaHeroIntro>
		),
	},
};

export const WithFocalPoint: Story = {
	args: {
		image: {
			...image,
			objectPosition: '20% 30%',
		},
		aside: <DonationCard />,
		mobileAside: <DonationCard />,
		children: (
			<MediaHeroIntro
				title="Sierra Leone"
				eyebrow={
					<MediaHeroChips>
						<Badge variant="frosted">Country</Badge>
					</MediaHeroChips>
				}
			>
				<MediaHeroChips>
					<MediaHeroPill>162 Recipients</MediaHeroPill>
					<MediaHeroPill>3 Programs</MediaHeroPill>
				</MediaHeroChips>
			</MediaHeroIntro>
		),
	},
};

export const WithCallToActionCard: Story = {
	args: {
		image,
		children: (
			<MediaHeroIntro title="Start your own cash program." description="We run it end to end, from enrolment to payouts.">
				<MediaHeroChips>
					<MediaHeroPill>From one person</MediaHeroPill>
					<MediaHeroPill>At least six months</MediaHeroPill>
				</MediaHeroChips>
			</MediaHeroIntro>
		),
		aside: <CallToActionCard />,
		mobileAside: <CallToActionCard />,
	},
};
