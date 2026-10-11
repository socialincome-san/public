import { CountryFlag } from '@/components/country-flag';
import { CountryCode } from '@/generated/prisma/enums';
import { getCountryNameByCode } from '@/lib/types/country';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';

type Props = {
	country: CountryCode;
};

export const CountryBadge = ({ country }: Props) => {
	return (
		<Badge variant="country">
			<CountryFlag country={country} size="sm" />
			<span className="font-medium">{getCountryNameByCode(country)}</span>
		</Badge>
	);
};
