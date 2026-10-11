import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Badge } from '../../data-display/badge/badge';
import { Card } from '../../data-display/card/card';
import { MediaHero, MediaHeroChips, MediaHeroIntro, MediaHeroPill, MediaHeroStat, MediaHeroStats } from './media-hero';

const image = { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Recipients in Sierra Leone' };

const DonationCard = () => (
	<div className="w-96">
		<Card>
			<p className="text-foreground p-6">Donation form</p>
		</Card>
	</div>
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
