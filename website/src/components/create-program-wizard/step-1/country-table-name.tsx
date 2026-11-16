'use client';

import { CountryFlag } from '@/components/country-flag';
import { getCountryNameByCode } from '@/lib/types/country';
import type { CountryEligibilityRow } from '@/modules/countries/country.types';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { useTranslations } from 'next-intl';

type Props = {
	country: CountryEligibilityRow['country'];
};

export const CountryTableName = ({ country }: Props) => {
	const t = useTranslations('create-program-wizard');

	return (
		<span className="flex items-center gap-3">
			<CountryFlag country={country.isoCode} />
			{/* The badge wraps below the name, never below the flag */}
			<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
				<span>{getCountryNameByCode(country.isoCode)}</span>
				{country.isActive && (
					<Badge variant="primary" size="sm">
						{t('step1.active_badge')}
					</Badge>
				)}
			</span>
		</span>
	);
};
