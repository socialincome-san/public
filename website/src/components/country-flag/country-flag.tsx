'use client';

import type { CountryCode } from '@/generated/prisma/enums';
import { cn } from '@/lib/utils/cn';
import { WHITESPACE_REGEX } from '@/lib/utils/regex';
import Image from 'next/image';
import { useState } from 'react';

const slugifyCountry = (name: string): string => {
	return name.toLowerCase().replace(WHITESPACE_REGEX, '_');
};

type CountryFlagProps = {
	country: CountryCode;
	size?: 'sm' | 'lg';
	decorative?: boolean;
	className?: string;
};

const CountryFlagImage = ({
	country,
	size,
	decorative,
	className,
}: Required<Omit<CountryFlagProps, 'className'>> & {
	className?: string;
}) => {
	const [hasError, setHasError] = useState(false);

	const containerSize = size === 'sm' ? 'size-4 text-[10px]' : 'size-9 text-[12px]';

	const slug = slugifyCountry(country);

	if (hasError) {
		return (
			<span
				className={cn(
					'bg-muted text-muted-foreground inline-flex items-center justify-center rounded-full uppercase',
					containerSize,
					className,
				)}
				aria-hidden={decorative || undefined}
			>
				{country}
			</span>
		);
	}

	return (
		<span
			className={cn('inline-flex overflow-hidden rounded-full', containerSize, className)}
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

export const CountryFlag = ({ country, size = 'lg', decorative = false, className }: CountryFlagProps) => {
	return <CountryFlagImage key={country} country={country} size={size} decorative={decorative} className={className} />;
};
