export const OUTFLOW_REACH_PERCENT = 88;
export const OUTFLOW_NGO_AVERAGE_CHF = 70;
export const OUTFLOW_AUDIT_FIRM = 'Wespi & Partner AG';
export const OUTFLOW_NGO_AVERAGE_SOURCE_URL = 'https://zewo.ch/';

const OUTFLOW_SPEND_ROWS = [
	{
		id: 'direct-cash',
		chf: 88,
	},
	{
		id: 'administration',
		chf: 8,
	},
	{
		id: 'fundraising',
		chf: 4,
	},
] as const;

export type OutflowSpendRowId = (typeof OUTFLOW_SPEND_ROWS)[number]['id'];

export type OutflowsSectionRow = {
	id: OutflowSpendRowId;
	label: string;
	description: string;
	chf: number;
};

export const buildOutflowsSectionRows = (
	labels: Record<OutflowSpendRowId, { label: string; description: string }>,
): OutflowsSectionRow[] =>
	OUTFLOW_SPEND_ROWS.map((row) => ({
		id: row.id,
		chf: row.chf,
		label: labels[row.id].label,
		description: labels[row.id].description,
	}));
