import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { BreakdownList, BreakdownRow } from '../../data-display/breakdown-list/breakdown-list';
import { Progress } from '../../feedback/progress/progress';
import { SplitSection, SplitSectionCard } from './split-section';

const meta = {
	title: 'Layout/SplitSection',
	component: SplitSection,
	tags: ['autodocs'],
	args: {
		eyebrow: 'Where the money goes',
		headline: (
			<>
				Of every CHF 100, <strong>CHF 93 go directly to recipients</strong>.
			</>
		),
		intro: <p className="text-muted-foreground text-sm">Zewo certified since 2023.</p>,
		children: (
			<SplitSectionCard title="Breakdown">
				<BreakdownList ariaLabel="Breakdown of a CHF 100 donation">
					<BreakdownRow label="Recipients" value="CHF 93" description="Paid out via mobile money.">
						<Progress value={93} />
					</BreakdownRow>
					<BreakdownRow label="Delivery" value="CHF 4" description="Transaction fees and local partners.">
						<Progress value={4} />
					</BreakdownRow>
					<BreakdownRow label="Fundraising" value="CHF 3" description="Payment fees and campaigns.">
						<Progress value={3} />
					</BreakdownRow>
				</BreakdownList>
				<Button fullWidth>Donate now</Button>
			</SplitSectionCard>
		),
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'A transparency section: a statement on the left and a card with the figures behind it on the right.',
			},
		},
	},
} satisfies Meta<typeof SplitSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMarkers: Story = {
	args: {
		eyebrow: 'Where the money comes from',
		children: (
			<SplitSectionCard title="Inflows" align="center">
				<BreakdownList>
					<BreakdownRow label="Individuals" value="68%" description="Monthly contributions" markerColor="#0d9488" />
					<BreakdownRow label="Institutions" value="32%" description="Foundations and companies" markerColor="#f59e0b" />
				</BreakdownList>
			</SplitSectionCard>
		),
	},
};
