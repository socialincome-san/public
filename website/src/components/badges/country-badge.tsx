import { Badge } from '@/components/badge';
import { getCountryNameByIsoCode } from '@/lib/services/country/iso-countries';
import { CountryFlag } from '../country-flag';

type Props = {
	isoCode: string;
};

export function CountryBadge({ isoCode }: Props) {
	return (
		<Badge variant="country" className="inline-flex items-center gap-2">
			<CountryFlag isoCode={isoCode} size="sm" />
			<span className="font-medium">{getCountryNameByIsoCode(isoCode)}</span>
		</Badge>
	);
}
