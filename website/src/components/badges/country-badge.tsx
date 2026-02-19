import { Badge } from '@/components/badge';
import { CountryCode } from '@/generated/prisma/enums';
import { getCountryNameByCode } from '@/lib/types/country';
import { CountryFlag } from '../country-flag';

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
