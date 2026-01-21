'use client';

import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { useState } from 'react';

function slugifyCountry(name: string): string {
	return name.toLowerCase().replace(/\s+/g, '_');
}

type CountryFlagProps = {
	country: string;
	size?: 'sm' | 'lg';
};

export function CountryFlag({ country, size = 'lg' }: CountryFlagProps) {
	const [hasError, setHasError] = useState(false);

	const containerSize = size === 'sm' ? 'size-4 text-[10px]' : 'size-9 text-[12px]';

	const slug = slugifyCountry(country);

	if (hasError) {
		return (
			<div
				className={cn(
					'bg-muted text-muted-foreground flex items-center justify-center rounded-full uppercase',
					containerSize,
				)}
			>
				{country}
			</div>
		);
	}

	return (
		<div className={cn('overflow-hidden rounded-full', containerSize)}>
			<Image
				src={`/assets/flags/${slug}.svg`}
				alt={country}
				width={36}
				height={36}
				className="size-full rounded-full object-cover"
				onError={() => setHasError(true)}
			/>
		</div>
	);
}
