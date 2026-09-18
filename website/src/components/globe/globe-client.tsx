'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import { getCountryGeoJson } from '@/lib/services/country/country-geojson.client';
import { isAbortError } from '@/lib/services/country/country-geojson.utils';
import { cn } from '@/lib/utils/cn';
import { useEffect, useRef } from 'react';
import styles from './globe-client.module.css';
import { createGlobeRenderer, type GlobeRendererHandle } from './globe-renderer';
import { useBadgePlayback } from './use-badge-playback';

const getRendererSize = ({ width, height }: { width: number; height: number }) =>
	Math.max(1, Math.round(Math.min(width, height)));

type Props = {
	contributions: GlobeContribution[];
	locale: string;
};

export const GlobeClient = ({ contributions, locale }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const rendererRef = useRef<GlobeRendererHandle>(null);
	const reducedMotionRef = useRef(true);
	const reducedMotion = usePrefersReducedMotion();

	useEffect(() => {
		reducedMotionRef.current = reducedMotion;
		rendererRef.current?.setReducedMotion(reducedMotion);
	}, [reducedMotion]);

	useBadgePlayback({ contributions, rendererRef, reducedMotion });

	useEffect(() => {
		const container = containerRef.current;
		if (!container || typeof ResizeObserver === 'undefined') {
			return;
		}

		const abortController = new AbortController();
		let disposed = false;
		let initializationStarted = false;
		let latestSize = 1;

		const setReady = (ready: boolean) => {
			const stage = container.closest('[data-globe-stage]');
			if (stage instanceof HTMLElement) {
				stage.dataset.ready = String(ready);
			}
		};

		const initialize = async () => {
			if (initializationStarted) {
				return;
			}
			initializationStarted = true;

			try {
				const countriesResult = await getCountryGeoJson(abortController.signal);
				if (disposed || abortController.signal.aborted) {
					return;
				}

				if (!countriesResult.success) {
					console.warn(countriesResult.error, { component: 'GlobeClient' });

					return;
				}

				const renderer = await createGlobeRenderer({
					element: container,
					countries: countriesResult.data,
					size: latestSize,
					locale,
					reducedMotion: reducedMotionRef.current,
					signal: abortController.signal,
					onReady: () => setReady(true),
					onContextLost: () => setReady(false),
				});

				if (disposed) {
					renderer.dispose();

					return;
				}

				rendererRef.current = renderer;
				renderer.resize(latestSize);
			} catch (error) {
				if (!isAbortError(error)) {
					console.error(error, { component: 'GlobeClient' });
				}
				setReady(false);
			}
		};

		const resizeObserver = new ResizeObserver(([entry]) => {
			if (!entry || entry.contentRect.width <= 0 || entry.contentRect.height <= 0) {
				return;
			}

			latestSize = getRendererSize(entry.contentRect);
			if (rendererRef.current) {
				rendererRef.current.resize(latestSize);
			} else {
				void initialize();
			}
		});

		setReady(false);
		resizeObserver.observe(container);

		return () => {
			disposed = true;
			abortController.abort();
			resizeObserver.disconnect();
			rendererRef.current?.dispose();
			rendererRef.current = null;
			setReady(false);
		};
	}, [locale]);

	return (
		<div
			ref={containerRef}
			className={cn(
				styles.globe,
				'pointer-events-none absolute inset-0 size-full touch-pan-y opacity-0 transition-opacity duration-500 group-data-[ready=true]/globe:pointer-events-auto group-data-[ready=true]/globe:opacity-100 motion-reduce:transition-none',
			)}
		/>
	);
};
