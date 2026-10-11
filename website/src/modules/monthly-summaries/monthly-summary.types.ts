type MonthlySummaryRecipientCounts = {
	active: number;
	former: number;
	suspended: number;
	future: number;
};

type MonthlySummaryPayoutCounts = {
	total: number;
	confirmed: number;
	contested: number;
	failed: number;
};

export type MonthlySummaryStats = {
	recipients: MonthlySummaryRecipientCounts;
	candidates: number;
	payouts: MonthlySummaryPayoutCounts;
};

export type MonthlySummary = {
	period: { from: Date; to: Date };
	moneyIn: { amountChf: number; count: number };
	moneyOut: { amountChf: number; count: number };
	new: { contributors: number; campaigns: number; programs: number; recipients: number };
	stats: {
		overall: MonthlySummaryStats;
		countries: Record<string, MonthlySummaryStats>;
		localPartners: {
			name: string;
			countryIsoCodes: string[];
			programs: number;
			stats: MonthlySummaryStats;
		}[];
	};
};

type MonthlySummaryCountryTemplateData = {
	name: string;
	recipientsActive: number;
	recipientsFormer: number;
	recipientsSuspended: number;
	recipientsFuture: number;
	candidates: number;
	payoutsTotal: number;
	payoutsConfirmed: number;
	payoutsContested: number;
	payoutsFailed: number;
};

type MonthlySummaryLocalPartnerTemplateData = {
	name: string;
	country: string;
	recipientsActive: number;
	recipientsFormer: number;
	recipientsSuspended: number;
	recipientsFuture: number;
	programs: number;
};

export type MonthlySummaryTemplateData = {
	month: string;
	moneyInAmount: string;
	moneyInCount: number;
	moneyOutAmount: string;
	moneyOutCount: number;
	contributors: number;
	campaigns: number;
	programs: number;
	recipients: number;
	overallRecipientsActive: number;
	overallRecipientsFormer: number;
	overallRecipientsSuspended: number;
	overallRecipientsFuture: number;
	overallCandidates: number;
	overallPayoutsTotal: number;
	overallPayoutsConfirmed: number;
	overallPayoutsContested: number;
	overallPayoutsFailed: number;
	countries: MonthlySummaryCountryTemplateData[];
	localPartners: MonthlySummaryLocalPartnerTemplateData[];
};

export type MonthlySummaryEmail = {
	subject: string;
	text: string;
	template: {
		id: string;
		data: MonthlySummaryTemplateData;
	};
};
