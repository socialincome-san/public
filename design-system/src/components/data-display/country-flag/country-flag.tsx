'use client';

import Image from 'next/image';
import { type ReactNode, useState } from 'react';
import { cn } from '../../../cn';

const slugifyCountry = (name: string): string => {
	return name.toLowerCase().replace(/\s+/g, '_');
};

type CountryFlagProps = {
	country: string;
	size?: 'sm' | 'lg' | 'inline';
	decorative?: boolean;
	// Shown instead of the country code when there is no flag for the country.
	fallback?: ReactNode;
};

const containerSizeClasses = {
	sm: 'size-4 text-2xs',
	lg: 'size-9 text-xs',
	inline: 'size-[1em] text-[length:inherit]',
};

const CountryFlagImage = ({
	country,
	size,
	decorative,
	fallback,
}: Required<Omit<CountryFlagProps, 'fallback'>> & Pick<CountryFlagProps, 'fallback'>) => {
	const [hasError, setHasError] = useState(false);

	const containerSize = containerSizeClasses[size];

	const slug = slugifyCountry(country);

	if (hasError && fallback) {
		return fallback;
	}

	if (hasError) {
		return (
			<span
				className={cn(
					'bg-muted text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-full uppercase',
					containerSize,
				)}
				aria-hidden={decorative || undefined}
			>
				{country}
			</span>
		);
	}

	return (
		<span
			className={cn('inline-flex shrink-0 overflow-hidden rounded-full', containerSize)}
			aria-hidden={decorative || undefined}
		>
			<Image
				src={`/assets/flags/${slug}.svg`}
				alt={decorative ? '' : country}
				width={36}
				height={36}
				className="block size-full rounded-full object-cover"
				onError={() => setHasError(true)}
			/>
		</span>
	);
};

export const CountryFlag = ({ country, size = 'lg', decorative = false, fallback }: CountryFlagProps) => {
	return <CountryFlagImage key={country} country={country} size={size} decorative={decorative} fallback={fallback} />;
};
