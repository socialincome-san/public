'use client';

import { getCountryNameByIsoCode } from '@/lib/services/country/iso-countries';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { useState } from 'react';

type CountryFlagProps = {
	isoCode: string;
	size?: 'sm' | 'lg';
};

export function CountryFlag({ isoCode, size = 'lg' }: CountryFlagProps) {
	const [hasError, setHasError] = useState(false);

	const containerSize = size === 'sm' ? 'size-4 text-[10px]' : 'size-9 text-[12px]';

	if (hasError) {
		return (
			<div
				className={cn(
					'bg-muted text-muted-foreground flex items-center justify-center rounded-full uppercase',
					containerSize,
				)}
			>
				{isoCode}
			</div>
		);
	}

	return (
		<div className={cn('overflow-hidden rounded-full', containerSize)}>
			<Image
				src={`/assets/flags/${isoCode}.svg`}
				alt={`Flag of ${getCountryNameByIsoCode(isoCode)}`}
				width={36}
				height={36}
				className="size-full rounded-full object-cover"
				onError={() => setHasError(true)}
			/>
		</div>
	);
}
