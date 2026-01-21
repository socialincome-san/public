import { Badge } from '@/components/badge';
import { getCountryNameByIsoCode } from '@/lib/services/country/iso-countries';
import { CountryFlag } from '../country-flag';

type Props = {
	country: string;
};

export function CountryBadge({ country }: Props) {
	return (
		<Badge variant="country" className="inline-flex items-center gap-2">
			<CountryFlag country={country} size="sm" />
			<span className="font-medium">{getCountryNameByIsoCode(country)}</span>
		</Badge>
	);
}
