export type InflowSegmentKey = 'individuals' | 'foundations' | 'corporate';

export type InflowSegmentAmounts = Record<InflowSegmentKey, number>;

export type InflowSegment = {
	key: InflowSegmentKey;
	amount: number;
	percent: number;
	color: string;
};

const INFLOW_SEGMENT_COLORS: Record<InflowSegmentKey, string> = {
	individuals: '#083344',
	foundations: '#0e7490',
	corporate: '#94a3b8',
};

const SEGMENT_ORDER: InflowSegmentKey[] = ['individuals', 'foundations', 'corporate'];

export const parseChfAmount = (raw: string | undefined): number => {
	if (raw === undefined || raw.trim() === '') {
		return 0;
	}

	const parsed = Number(raw);

	return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

/** Individuals share of inflows: donation total minus CMS foundation and corporate amounts. */
export const resolveIndividualsInflowsChf = (
	totalInflowsChf: number,
	foundationsChf: number,
	corporateChf: number,
): number => Math.max(0, totalInflowsChf - foundationsChf - corporateChf);

/** Largest-remainder allocation so integer percents always sum to 100 (or all 0). */
export const allocatePercents = (amounts: readonly number[]): number[] => {
	const total = amounts.reduce((sum, amount) => sum + amount, 0);
	if (total <= 0) {
		return amounts.map(() => 0);
	}

	const exact = amounts.map((amount) => (amount / total) * 100);
	const floored = exact.map((percent) => Math.floor(percent));
	const remainder = 100 - floored.reduce((sum, percent) => sum + percent, 0);

	const byFractionDesc = exact
		.map((percent, index) => ({ index, fraction: percent - (floored[index] ?? 0) }))
		.sort((left, right) => right.fraction - left.fraction || left.index - right.index);

	const result = [...floored];
	for (let step = 0; step < remainder; step += 1) {
		const index = byFractionDesc[step]?.index;
		if (index === undefined) {
			break;
		}
		result[index] = (result[index] ?? 0) + 1;
	}

	return result;
};

export const buildInflowSegments = (amounts: InflowSegmentAmounts): InflowSegment[] => {
	const percents = allocatePercents(SEGMENT_ORDER.map((key) => amounts[key]));

	return SEGMENT_ORDER.map((key, index) => ({
		key,
		amount: amounts[key],
		percent: percents[index] ?? 0,
		color: INFLOW_SEGMENT_COLORS[key],
	}));
};
