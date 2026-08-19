import type { CountryGeoJson } from '@/lib/services/country/country-geojson.types';
import type { GlobeInstance } from 'globe.gl';
import type { Material, Object3D } from 'three';
import {
	AUTO_ROTATE_SPEED,
	DAMPING_FACTOR,
	GLOBE_COLORS,
	GLOBE_SPHERE_OPACITY,
	HEXAGON_MARGIN,
	HEXAGON_RESOLUTION,
	INITIAL_GLOBE_VIEW,
} from './globe-config';

type GlobeRendererOptions = {
	element: HTMLElement;
	countries: CountryGeoJson | null;
	size: number;
	reducedMotion: boolean;
	signal: AbortSignal;
	onReady: () => void;
	onContextLost: () => void;
};

export type GlobeRendererHandle = {
	resize: (size: number) => void;
	setReducedMotion: (reducedMotion: boolean) => void;
	dispose: () => void;
};

type Disposable = {
	dispose: () => void;
};

export type GlobeControlsConfig = {
	autoRotate: boolean;
	autoRotateSpeed: number;
	dampingFactor: number;
	enableDamping: boolean;
	enablePan: boolean;
	enableRotate: boolean;
	enableZoom: boolean;
	maxDistance: number;
	maxPolarAngle: number;
	minDistance: number;
	minPolarAngle: number;
	getDistance: () => number;
	getPolarAngle: () => number;
	update: () => void;
};

export const configureGlobeControls = (controls: GlobeControlsConfig, reducedMotion: boolean) => {
	controls.enableDamping = true;
	controls.dampingFactor = DAMPING_FACTOR;
	controls.enablePan = false;
	controls.enableRotate = true;
	controls.enableZoom = false;
	controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
	controls.autoRotate = !reducedMotion;
	controls.update();

	const polarAngle = controls.getPolarAngle();
	const distance = controls.getDistance();
	controls.minPolarAngle = polarAngle;
	controls.maxPolarAngle = polarAngle;
	controls.minDistance = distance;
	controls.maxDistance = distance;
};

const hasDispose = (value: unknown): value is Disposable =>
	typeof value === 'object' && value !== null && 'dispose' in value && typeof value.dispose === 'function';

const disposeObject = (object: Object3D) => {
	if ('geometry' in object && hasDispose(object.geometry)) {
		object.geometry.dispose();
	}

	if (!('material' in object)) {
		return;
	}

	const materials: unknown[] = Array.isArray(object.material) ? object.material : [object.material];
	materials.forEach((material) => {
		if (hasDispose(material)) {
			material.dispose();
		}
	});
};

export const createGlobeRenderer = async ({
	element,
	countries,
	size,
	reducedMotion,
	signal,
	onReady,
	onContextLost,
}: GlobeRendererOptions): Promise<GlobeRendererHandle> => {
	const [{ default: Globe }, { MeshBasicMaterial }] = await Promise.all([import('globe.gl'), import('three')]);
	if (signal.aborted) {
		throw new DOMException('Globe initialization was cancelled.', 'AbortError');
	}

	const globeMaterial: Material = new MeshBasicMaterial({
		color: GLOBE_COLORS.sphere,
		opacity: GLOBE_SPHERE_OPACITY,
		transparent: true,
	});
	let disposed = false;
	let readyFrame: number | null = null;
	let shouldReduceMotion = reducedMotion;

	const globe: GlobeInstance = new Globe(element, {
		animateIn: false,
		waitForGlobeReady: true,
		rendererConfig: { alpha: true, antialias: true },
	});

	globe
		.width(size)
		.height(size)
		.backgroundColor('rgba(0, 0, 0, 0)')
		.globeImageUrl('')
		.bumpImageUrl('')
		.showAtmosphere(false)
		.showGraticules(false)
		.globeMaterial(globeMaterial)
		.lights([])
		.hexPolygonsData(countries?.features ?? [])
		.hexPolygonResolution(HEXAGON_RESOLUTION)
		.hexPolygonMargin(HEXAGON_MARGIN)
		.hexPolygonColor(() => GLOBE_COLORS.hexagon)
		.hexPolygonsTransitionDuration(0)
		.pointOfView(INITIAL_GLOBE_VIEW, 0)
		.onGlobeReady(() => {
			if (!countries || disposed) {
				return;
			}

			readyFrame = window.requestAnimationFrame(() => {
				if (!disposed) {
					onReady();
				}
			});
		});

	const controls = globe.controls();
	configureGlobeControls(controls, reducedMotion);

	const resumeAutoRotation = () => {
		if (!shouldReduceMotion) {
			controls.autoRotate = true;
		}
	};
	controls.addEventListener('end', resumeAutoRotation);

	const renderer = globe.renderer();
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	const handleContextLost = (event: Event) => {
		event.preventDefault();
		globe.pauseAnimation();
		onContextLost();
	};
	renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

	return {
		resize: (nextSize) => {
			globe.width(nextSize).height(nextSize);
		},
		setReducedMotion: (nextReducedMotion) => {
			shouldReduceMotion = nextReducedMotion;
			controls.autoRotate = !nextReducedMotion;
			if (nextReducedMotion) {
				globe.pointOfView(INITIAL_GLOBE_VIEW, 0);
			}
		},
		dispose: () => {
			disposed = true;
			if (readyFrame !== null) {
				window.cancelAnimationFrame(readyFrame);
			}
			renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
			controls.removeEventListener('end', resumeAutoRotation);
			controls.dispose();
			globe.pauseAnimation();
			globe.scene().traverse(disposeObject);
			globeMaterial.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			globe._destructor();
			element.replaceChildren();
		},
	};
};
