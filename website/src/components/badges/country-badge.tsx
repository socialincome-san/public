import { Badge } from '@/components/badge';
import { CountryFlag } from '../country-flag';

type Props = {
	country: string;
};

export function CountryBadge({ country }: Props) {
	return (
		<Badge variant="country" className="inline-flex items-center gap-2">
			<CountryFlag country={country} size="sm" />
			<span className="font-medium">{country}</span>
		</Badge>
	);
}
