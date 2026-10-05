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

export type MonthlySummaryEmail = {
	subject: string;
	text: string;
};
