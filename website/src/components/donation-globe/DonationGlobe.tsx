'use client';

import { updateComets, type Comet } from '@/components/donation-globe/create-comet';
import styles from '@/components/donation-globe/donation-globe.module.css';
import type {
	DonationFlow,
	GlobeHtmlElement,
	GlobeInstance,
	GlobePoint,
	PlaybackTimelineUpdate,
} from '@/components/donation-globe/types';
import { useDonationPlayback } from '@/components/donation-globe/use-donation-playback';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import Globe from 'globe.gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type DonationGlobeProps = {
	flows: DonationFlow[];
	periodStartIso: string;
	periodEndIso: string;
	lang: WebsiteLanguage;
	onTimelineUpdate: (update: PlaybackTimelineUpdate) => void;
};

type GeoJsonFeatureCollection = {
	features: unknown[];
};

const GLOBE_WATER_COLOR = '#DFEBF2';
const CAMERA_POV = { lat: 15, lng: 5, altitude: 2.2 };

const uniqueReceiverPoints = (flows: DonationFlow[]): GlobePoint[] => {
	const byCode = new Map<string, GlobePoint>();

	for (const flow of flows) {
		if (!byCode.has(flow.toCountryCode)) {
			byCode.set(flow.toCountryCode, {
				lat: flow.toLat,
				lng: flow.toLng,
				name: flow.toCountryName,
			});
		}
	}

	return [...byCode.values()];
};

export const DonationGlobe = ({ flows, periodStartIso, periodEndIso, lang, onTimelineUpdate }: DonationGlobeProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const globeRef = useRef<GlobeInstance | null>(null);
	const cometsRef = useRef<Comet[]>([]);
	const cometFrameRef = useRef<number | null>(null);
	const [globeReady, setGlobeReady] = useState(false);
	const receiverPoints = useMemo(() => uniqueReceiverPoints(flows), [flows]);
	const playbackEnabled = flows.length > 0;

	const onCometCreated = useCallback((comet: Comet) => {
		cometsRef.current.push(comet);
	}, []);

	useDonationPlayback({
		flows,
		periodStartIso,
		periodEndIso,
		globe: globeReady ? globeRef.current : null,
		enabled: playbackEnabled,
		lang,
		onCometCreated,
		onTimelineUpdate,
	});

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const createGlobe = Globe as unknown as () => (element: HTMLElement) => GlobeInstance;
		const globe = createGlobe()(container);
		globeRef.current = globe;

		globe.backgroundColor('rgba(0,0,0,0)').showAtmosphere(false);

		const globeMaterial = new THREE.MeshBasicMaterial({
			color: GLOBE_WATER_COLOR,
			transparent: true,
			opacity: 0.95,
		});
		globe.globeMaterial(globeMaterial);

		const lightAdjustTimeoutId = setTimeout(() => {
			const scene = globe.scene();
			for (const child of scene.children) {
				if (child instanceof THREE.AmbientLight) {
					child.color = new THREE.Color('#ffffff');
					child.intensity = 1;
				}
				if (child instanceof THREE.DirectionalLight) {
					child.intensity = 0;
				}
			}
		}, 100);

		globe
			.htmlElement((d: GlobeHtmlElement) => {
				const el = document.createElement('div');
				el.innerHTML = `
          <div class="${styles.badgeAnchor}">
            <div class="${styles.badgeAnimWrapper}">
              <div class="${styles.donationBadge}">${d.text}</div>
            </div>
          </div>
        `;

				return el;
			})
			.htmlAltitude(0.01);

		globe
			.pointsData([])
			.pointColor(() => '#083344')
			.pointAltitude(0.01)
			.pointRadius(0.4);

		globe
			.ringsData([])
			.ringColor(() => '#083344')
			.ringMaxRadius(6)
			.ringPropagationSpeed(1.2)
			.ringRepeatPeriod(1200);

		globe.pointOfView(CAMERA_POV);

		const controls = globe.controls();
		controls.autoRotate = false;
		controls.enableZoom = true;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const updateSize = () => {
			globe.width(container.clientWidth).height(container.clientHeight);
		};

		const resizeObserver = new ResizeObserver(updateSize);
		resizeObserver.observe(container);
		updateSize();

		const loadGeoJson = async () => {
			try {
				const response = await fetch('/geo/countries.geojson');
				if (!response.ok) {
					throw new Error(`GeoJSON fetch failed: ${response.status}`);
				}

				const countries = (await response.json()) as GeoJsonFeatureCollection;
				globe
					.hexPolygonsData(countries.features)
					.hexPolygonResolution(3)
					.hexPolygonMargin(0.65)
					.hexPolygonColor(() => '#64748B');
			} catch (error) {
				console.error('Failed to load GeoJSON for donation globe:', error);
			}
		};

		void loadGeoJson();

		const animateComets = () => {
			cometsRef.current = updateComets(cometsRef.current, performance.now());
			cometFrameRef.current = requestAnimationFrame(animateComets);
		};

		cometFrameRef.current = requestAnimationFrame(animateComets);
		setGlobeReady(true);

		return () => {
			setGlobeReady(false);
			clearTimeout(lightAdjustTimeoutId);
			resizeObserver.disconnect();

			if (cometFrameRef.current !== null) {
				cancelAnimationFrame(cometFrameRef.current);
				cometFrameRef.current = null;
			}

			for (const comet of cometsRef.current) {
				comet.dispose();
			}
			cometsRef.current = [];

			globe.htmlElementsData([]);
			globe._destructor?.();
			globeRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!globeReady || !globeRef.current) {
			return;
		}

		globeRef.current.pointsData(receiverPoints).ringsData(receiverPoints);
	}, [receiverPoints, globeReady]);

	return <div ref={containerRef} className={styles.globeContainer} aria-hidden />;
};
