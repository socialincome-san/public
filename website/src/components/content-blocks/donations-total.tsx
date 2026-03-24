'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { FloatingImage } from '@/components/floating-image';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { useInView, useMotionValue, useSpring } from 'motion/react';
import NextLink from 'next/link';
import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';

type Props = {
	blok: DonationsTotal;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	totalChf: number;
};

export const DonationsTotalBlock = ({ blok, lang, region, totalChf }: Props) => {
	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
	const displayValue = useCountUp(totalChf, isInView);

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
	const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) {
			return;
		}

		const handlePointerMove = (event: PointerEvent) => {
			const rect = el.getBoundingClientRect();
			const normalizedX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
			const normalizedY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

			mouseX.set(Math.max(-1, Math.min(1, normalizedX)));
			mouseY.set(Math.max(-1, Math.min(1, normalizedY)));
		};

		window.addEventListener('pointermove', handlePointerMove);

		return () => window.removeEventListener('pointermove', handlePointerMove);
	}, [mouseX, mouseY]);

	const images = blok.images?.slice(0, 4) ?? [];
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;

	return (
		<BlockWrapper ref={sectionRef} {...storyblokEditable(blok as SbBlokData)}>
			{images.map((image, index) => (
				<FloatingImage key={image.id} image={image} index={index} smoothMouseX={smoothMouseX} smoothMouseY={smoothMouseY} />
			))}

			<div className="relative z-10 flex flex-col items-center justify-center py-16 text-center md:py-24 lg:py-32">
				{blok.heading && (
					<h2 className="text-primary mb-6 text-2xl leading-tight whitespace-pre-wrap md:text-3xl lg:text-5xl [&_strong]:font-bold">
						<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.heading}</Markdown>
					</h2>
				)}

				<div className="text-primary mb-8 flex items-baseline justify-center gap-3">
					<span className="text-xl md:text-2xl">CHF</span>
					<span className="text-6xl font-light tracking-tight md:text-8xl lg:text-[10rem]">
						{formatNumberLocale(displayValue, 'de-CH')}
					</span>
				</div>

				{button && buttonHref && (
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				)}
			</div>
		</BlockWrapper>
	);
};
