'use client';

import { Button, Typography } from '@socialincome/ui';
import { Children, PropsWithChildren, useState } from 'react';

/**
 * We use the files from GitHub instead of the package so that donations from new countries are automatically supported.
 */
const getFlagImageURL = (country: string) => {
	return `https://raw.githubusercontent.com/lipis/flag-icons/a87d8b256743c9b0df05f20de2c76a7975119045/flags/4x3/${country.toLowerCase()}.svg`;
};

type CountryCardProps = {
	country: string;
	translations: {
		country: string;
		total: string;
	};
};

/* eslint-disable @next/next/no-img-element */
export function CountryCard({ country, translations }: CountryCardProps) {
	return (
		<li className="flex items-center justify-between rounded-lg border-2 p-5">
			<div className="flex min-w-0 gap-x-4">
				<img className="h-12 w-12 flex-none" src={getFlagImageURL(country)} alt="" />
				<div className="min-w-0 flex-auto">
					<Typography weight="medium" size="lg">
						{translations.country}
					</Typography>
					<Typography size="md">{translations.total}</Typography>
				</div>
			</div>
		</li>
	);
}

export function CountryCardList({ children, buttonText }: PropsWithChildren<{ buttonText: string }>) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="flex flex-col space-y-2">
			<ul className="grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-12 md:gap-y-6">
				{!expanded ? Children.toArray(children).slice(0, 6) : children}
			</ul>
			{!expanded && (
				<Button wide color="ghost" onClick={() => setExpanded(true)} className="self-center">
					{buttonText}
				</Button>
			)}
		</div>
	);
}
