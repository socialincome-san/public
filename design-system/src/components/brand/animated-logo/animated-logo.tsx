'use client';

import { type DotLottie, DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useEffect, useRef, useState } from 'react';
import { SocialIncomeLogo } from '../logo/logo';

// The logo animation is a 2500×400 composition that ends with the wordmark at x 100.5–2398.8, y 77–322.7. The canvas
// is scaled and shifted so the wordmark fills `width` and lines up like `SocialIncomeLogo`, while the slashes may
// swing outside it.
const compositionWidth = 2500;
const compositionHeight = 400;
const wordmarkWidth = 2298.3;
const wordmarkHeight = 245.7;
const canvasScale = compositionWidth / wordmarkWidth;

type AnimatedLogoProps = {
	/** URL of a Social Income logo animation (Lottie JSON), white or blue. */
	src: string;
	width?: number;
};

export const AnimatedLogo = ({ src, width = 222 }: AnimatedLogoProps) => {
	const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
	const [failed, setFailed] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!dotLottie || !element) {
			return;
		}

		const onLoadError = () => setFailed(true);
		dotLottie.addEventListener('loadError', onLoadError);

		const whenLoaded = (callback: () => void) => {
			if (dotLottie.isLoaded) {
				callback();
			} else {
				dotLottie.addEventListener('load', callback);
			}
		};

		const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const showFinalFrame = () => dotLottie.setFrame(dotLottie.totalFrames - 1);

		if (prefersReducedMotion()) {
			whenLoaded(showFinalFrame);

			return () => dotLottie.removeEventListener('loadError', onLoadError);
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting && entry.intersectionRatio >= 1) {
					observer.disconnect();
					whenLoaded(() => (prefersReducedMotion() ? showFinalFrame() : dotLottie.play()));
				}
			},
			{ threshold: 1 },
		);
		observer.observe(element);

		return () => {
			observer.disconnect();
			dotLottie.removeEventListener('loadError', onLoadError);
		};
	}, [dotLottie]);

	if (failed) {
		return <SocialIncomeLogo width={width} height={(width * 16) / 153} />;
	}

	return (
		<div ref={ref} aria-hidden style={{ width, height: (width * wordmarkHeight) / wordmarkWidth }}>
			<div
				style={{
					width: width * canvasScale,
					height: (width * canvasScale * compositionHeight) / compositionWidth,
					marginLeft: (-width * 100.5) / wordmarkWidth,
					marginTop: (-width * 77) / wordmarkWidth,
				}}
			>
				<DotLottieReact src={src} dotLottieRefCallback={setDotLottie} />
			</div>
		</div>
	);
};
