export const sdgs = {
	'1': {
		number: 1,
		title: 'No Poverty',
		color: '#E5243B',
	},
	'2': {
		number: 2,
		title: 'Zero Hunger',
		color: '#DDA63A',
	},
	'3': {
		number: 3,
		title: 'Good Health and Well-being',
		color: '#4C9F38',
	},
	'4': {
		number: 4,
		title: 'Quality Education',
		color: '#C5192D',
	},
	'5': {
		number: 5,
		title: 'Gender Equality',
		color: '#FF3A21',
	},
	'6': {
		number: 6,
		title: 'Clean Water and Sanitation',
		color: '#26BDE2',
	},
	'7': {
		number: 7,
		title: 'Affordable and Clean Energy',
		color: '#FCC30B',
	},
	'8': {
		number: 8,
		title: 'Decent Work and Economic Growth',
		color: '#A21942',
	},
	'9': {
		number: 9,
		title: 'Industry, Innovation and Infrastructure',
		color: '#FD6925',
	},
	'10': {
		number: 10,
		title: 'Reduced Inequalities',
		color: '#DD1367',
	},
	'11': {
		number: 11,
		title: 'Sustainable Cities and Communities',
		color: '#FD9D24',
	},
	'12': {
		number: 12,
		title: 'Responsible Consumption and Production',
		color: '#BF8B2E',
	},
	'13': {
		number: 13,
		title: 'Climate Action',
		color: '#3F7E44',
	},
	'14': {
		number: 14,
		title: 'Life Below Water',
		color: '#0A97D9',
	},
	'15': {
		number: 15,
		title: 'Life on Land',
		color: '#56C02B',
	},
	'16': {
		number: 16,
		title: 'Peace, Justice and Strong Institutions',
		color: '#00689D',
	},
	'17': {
		number: 17,
		title: 'Partnerships for the Goals',
		color: '#19486A',
	},
} as const;

type SdgKey = keyof typeof sdgs;

export type SdgValue = number | string;

const isSdgKey = (value: string): value is SdgKey => value in sdgs;

export const getSdg = (value: SdgValue) => {
	const key = String(value).trim();

	return isSdgKey(key) ? sdgs[key] : undefined;
};
