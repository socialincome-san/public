import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BooleanBadge } from '../badges/boolean-badge';
import { CampaignStatusBadge } from '../badges/campaign-status-badge';
import { ContributionStatusBadge } from '../badges/contribution-status-badge';
import { CountryBadge } from '../badges/country-badge';
import { PayoutStatusBadge } from '../badges/payout-status-badge';
import { RecipientStatusBadge } from '../badges/recipient-status-badge';
import { SurveyStatusBadge } from '../badges/survey-status-badge';
import { UserRoleBadge } from '../badges/user-role-badge';
import { SubscriptionStatusBadge } from './subscription-status-badge';

const Grid = ({ children }: { children: React.ReactNode }) => (
	<div className="flex flex-wrap items-center gap-2">{children}</div>
);

const meta = {
	title: 'Components/StatusBadges',
	component: SubscriptionStatusBadge,
	tags: ['autodocs'],
	args: {
		status: 'active',
		label: 'Active',
	},
} satisfies Meta<typeof SubscriptionStatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SubscriptionStatuses: Story = {
	render: () => (
		<Grid>
			<SubscriptionStatusBadge status="active" label="Active" />
			<SubscriptionStatusBadge status="ended" label="Ended" />
		</Grid>
	),
};

export const PayoutStatuses: Story = {
	render: () => (
		<Grid>
			<PayoutStatusBadge status="paid" />
			<PayoutStatusBadge status="confirmed" />
			<PayoutStatusBadge status="contested" />
			<PayoutStatusBadge status="failed" />
			<PayoutStatusBadge status={null} />
		</Grid>
	),
};

export const RecipientContributionSurveyStatuses: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<Grid>
				<RecipientStatusBadge status="future" />
				<RecipientStatusBadge status="active" />
				<RecipientStatusBadge status="suspended" />
				<RecipientStatusBadge status="completed" />
			</Grid>

			<Grid>
				<ContributionStatusBadge status="pending" />
				<ContributionStatusBadge status="succeeded" />
				<ContributionStatusBadge status="failed" />
			</Grid>

			<Grid>
				<SurveyStatusBadge status="new" />
				<SurveyStatusBadge status="sent" />
				<SurveyStatusBadge status="scheduled" />
				<SurveyStatusBadge status="in_progress" />
				<SurveyStatusBadge status="completed" />
				<SurveyStatusBadge status="missed" />
			</Grid>
		</div>
	),
};

export const CampaignRoleBooleanCountry: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<Grid>
				<CampaignStatusBadge status={true} />
				<CampaignStatusBadge status={false} />
			</Grid>

			<Grid>
				<UserRoleBadge role="admin" />
				<UserRoleBadge role="user" />
			</Grid>

			<Grid>
				<BooleanBadge value={true} />
				<BooleanBadge value={false} />
			</Grid>

			<Grid>
				<CountryBadge country="CH" />
				<CountryBadge country="KE" />
			</Grid>
		</div>
	),
};
