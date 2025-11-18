import { Badge } from '@/components/badge';
import { FlagSierraLeone } from '@/components/badges/flags/flag-sierra-leone';
import { ReactNode } from 'react';

export function CountryBadge({ country }: { country: String | null }) {
	let flag: ReactNode;
	switch (country) {
		case 'Sierra Leone':
			flag = <FlagSierraLeone />;
			break;
		default:
			flag = null;
			break;
	}

	return (
		<Badge variant="country">
			{flag && <span className="mr-1">{flag}</span>}
			{country}
		</Badge>
	);
}
