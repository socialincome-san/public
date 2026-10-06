'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import { Badge } from '@socialincome/design-system/badge/badge';
import { Carousel, CarouselContent, CarouselItem } from '@socialincome/design-system/carousel/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useMemo } from 'react';

const AUTOPLAY_DELAY_MS = 4500;

type Props = {
	labels: string[];
};

const FundraisingPillBadge = ({ label }: { label: string }) => (
	<Badge variant="fundraising" size="lg">
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
			<Carousel opts={{ loop: true, align: 'start' }} plugins={shouldAutoplay ? [autoplayPlugin] : []} gap="none">
				<CarouselContent>
					{labels.map((label, index) => (
						<CarouselItem key={`${label}-${index}`}>
							<FundraisingPillBadge label={label} />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	);
};
