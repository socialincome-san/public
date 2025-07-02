'use client';

import { CountryCode } from '@socialincome/shared/src/types/country';
import { Button, Card, CardContent, Typography } from '@socialincome/ui';
import { getFlagImageURL } from '@socialincome/ui/src/lib/utils';
import { Children, PropsWithChildren, useState } from 'react';

type CountryCardProps = {
	country: CountryCode;
	translations: {
		country: string;
		total: string;
	};
};

export function CountryCard({ country, translations }: CountryCardProps) {
	return (
		<li>
			<Card>
				<CardContent className="flex min-w-0 gap-x-4 py-8">
					<img className="size-12 flex-none rounded-full" src={getFlagImageURL(country)} alt="" />
					<div className="min-w-0 flex-auto">
						<Typography weight="medium" size="lg">
							{translations.country}
						</Typography>
						<Typography size="md">{translations.total}</Typography>
					</div>
				</CardContent>
			</Card>
		</li>
	);
}

export function CountryCardList({ children, buttonText }: PropsWithChildren<{ buttonText: string }>) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="flex flex-col">
			<ul className="grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-12 md:gap-y-6">
				{!expanded ? Children.toArray(children).slice(0, 6) : children}
			</ul>
			{!expanded && (
				<Button onClick={() => setExpanded(true)} className="mt-4 self-center">
					{buttonText}
				</Button>
			)}
		</div>
	);
}
