import { CountryFlag } from '@/components/country-flag';
import { CountryCode } from '@/generated/prisma/enums';
import { getCountryNameByCode } from '@/lib/types/country';
import { Badge } from '@socialincome/design-system/badge/badge';

type Props = {
	country: CountryCode;
};

export const CountryBadge = ({ country }: Props) => {
	return (
		<Badge variant="country" className="inline-flex items-center gap-2">
			<CountryFlag country={country} size="sm" />
			<span className="font-medium">{getCountryNameByCode(country)}</span>
		</Badge>
	);
};
