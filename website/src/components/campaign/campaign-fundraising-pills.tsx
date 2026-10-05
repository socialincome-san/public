'use client';

import { Badge } from '@/components/badge/badge';
import { Carousel, CarouselContent, CarouselItem } from '@/components/carousel';
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import Autoplay from 'embla-carousel-autoplay';
import { useMemo } from 'react';

const AUTOPLAY_DELAY_MS = 4500;

type Props = {
	labels: string[];
};

const FundraisingPillBadge = ({ label }: { label: string }) => (
	<Badge variant="fundraising" className="w-fit whitespace-nowrap">
		{label}
	</Badge>
);

export const CampaignFundraisingPills = ({ labels }: Props) => {
	const reducedMotion = usePrefersReducedMotion();
	const autoplayPlugin = useMemo(() => Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false }), []);
	const shouldAutoplay = labels.length > 1 && !reducedMotion;

	if (labels.length === 0) {
		return null;
	}

	if (labels.length === 1) {
		return <FundraisingPillBadge label={labels[0]} />;
	}

	return (
		<div aria-live="polite" className="min-h-[1.375rem] w-fit max-w-full">
			<Carousel
				opts={{ loop: true, align: 'start' }}
				plugins={shouldAutoplay ? [autoplayPlugin] : []}
				className="w-fit max-w-full"
			>
				<CarouselContent className="-ml-0">
					{labels.map((label, index) => (
						<CarouselItem key={`${label}-${index}`} className="basis-full pl-0">
							<FundraisingPillBadge label={label} />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	);
};
