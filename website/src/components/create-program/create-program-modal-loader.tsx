'use client';

import { ReactNode } from 'react';
import { CreateProgramModalView } from './create-program-modal-view';
import { CountryCondition, CountryTableRow } from './types';

type CreateProgramModalLoaderProps = {
	trigger: ReactNode;
};

export function CreateProgramModalLoader({ trigger }: CreateProgramModalLoaderProps) {
	const rows: CountryTableRow[] = [
		{
			id: 'somalia',
			country: { name: 'Somalia' },
			cash: {
				condition: CountryCondition.MET,
				details: {
					text: 'Market functionality is sufficient.',
					source: { text: 'Source: WFP' },
				},
			},
			mobileMoney: {
				condition: CountryCondition.MET,
				details: {
					text: 'Mobile money infrastructure is considered sufficient.',
					source: {
						text: 'Source: SI Research',
						href: 'https://example.com',
					},
				},
			},
			mobileNetwork: {
				condition: CountryCondition.MET,
				details: {
					text: 'Coverage is sufficient across the country.',
					source: { text: 'Source: ITU' },
				},
			},
			sanctions: {
				condition: CountryCondition.MET,
				details: {
					text: 'Country is not on UN, US or EU sanctioned lists.',
				},
			},
		},

		{
			id: 'kenya',
			country: { name: 'Kenya' },
			cash: {
				condition: CountryCondition.MET,
				details: {
					text: 'Cash markets are functioning well nationwide.',
					source: { text: 'Source: WFP' },
				},
			},
			mobileMoney: {
				condition: CountryCondition.MET,
				details: {
					text: 'Strong mobile money penetration (e.g. M-Pesa).',
					source: {
						text: 'Source: GSMA',
						href: 'https://www.gsma.com',
					},
				},
			},
			mobileNetwork: {
				condition: CountryCondition.MET,
				details: {
					text: 'Well-established agent and mobile network coverage.',
					source: { text: 'Source: ITU' },
				},
			},
			sanctions: {
				condition: CountryCondition.MET,
				details: {
					text: 'No international sanctions apply.',
				},
			},
		},

		{
			id: 'egypt',
			country: { name: 'Egypt' },
			cash: {
				condition: CountryCondition.NOT_MET,
				details: {
					text: 'Cash delivery is restricted in several regions.',
					source: { text: 'Source: WFP' },
				},
			},
			mobileMoney: {
				condition: CountryCondition.NOT_MET,
				details: {
					text: 'Mobile money adoption remains limited.',
					source: { text: 'Source: World Bank' },
				},
			},
			mobileNetwork: {
				condition: CountryCondition.NOT_MET,
				details: {
					text: 'Network coverage gaps exist in rural areas.',
					source: { text: 'Source: ITU' },
				},
			},
			sanctions: {
				condition: CountryCondition.RESTRICTIONS_APPLY,
				details: {
					text: 'Certain international sanctions and restrictions apply.',
					source: {
						text: 'Source: EU Sanctions Map',
						href: 'https://www.sanctionsmap.eu',
					},
				},
			},
		},
	];

	return <CreateProgramModalView trigger={trigger} rows={rows} />;
}
