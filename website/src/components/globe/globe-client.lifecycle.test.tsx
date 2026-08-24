/** @jest-environment jsdom */

import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import { getCountryGeoJson } from '@/lib/services/country/country-geojson.client';
import type { CountryGeoJson } from '@/lib/services/country/country-geojson.types';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { GlobeClient } from './globe-client';
import { createGlobeRenderer, type GlobeRendererHandle } from './globe-renderer';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@/lib/hooks/use-prefers-reduced-motion');
jest.mock('@/lib/services/country/country-geojson.client');
jest.mock('@/lib/utils/logger', () => ({
	logger: {
		error: jest.fn(),
		warn: jest.fn(),
	},
}));
jest.mock('./globe-client.module.css', () => ({ globe: 'globe' }));
jest.mock('./globe-renderer');
jest.mock('./use-badge-playback', () => ({
	useBadgePlayback: jest.fn(),
}));

const countryData: CountryGeoJson = {
	type: 'FeatureCollection',
	features: [],
};

class ResizeObserverMock implements ResizeObserver {
	static instances: ResizeObserverMock[] = [];

	readonly disconnect = jest.fn();
	readonly unobserve = jest.fn();

	constructor(private readonly callback: ResizeObserverCallback) {
		ResizeObserverMock.instances.push(this);
	}

	observe(target: Element) {
		this.callback(
			[
				{
					target,
					contentRect: new DOMRectReadOnly(0, 0, 400, 400),
					borderBoxSize: [],
					contentBoxSize: [],
					devicePixelContentBoxSize: [],
				},
			],
			this,
		);
	}
}

const flushAsync = async () => {
	await act(async () => {
		await Promise.resolve();
		await Promise.resolve();
	});
};

const renderGlobe = (root: Root) => {
	act(() => {
		root.render(
			<div data-globe-stage data-ready="false">
				<GlobeClient contributions={[]} />
			</div>,
		);
	});
};

describe('GlobeClient lifecycle', () => {
	let container: HTMLDivElement;
	let root: Root;
	let rendererHandle: GlobeRendererHandle;

	beforeEach(() => {
		global.ResizeObserver = ResizeObserverMock;
		ResizeObserverMock.instances = [];
		container = document.createElement('div');
		document.body.append(container);
		root = createRoot(container);
		rendererHandle = {
			resize: jest.fn(),
			setReducedMotion: jest.fn(),
			dispose: jest.fn(),
		};

		jest.mocked(usePrefersReducedMotion).mockReturnValue(false);
		jest.mocked(getCountryGeoJson).mockResolvedValue({ success: true, data: countryData });
		jest.mocked(createGlobeRenderer).mockResolvedValue(rendererHandle);
	});

	afterEach(() => {
		container.remove();
		jest.clearAllMocks();
	});

	it('reveals WebGL after readiness and releases renderer resources', async () => {
		renderGlobe(root);
		await flushAsync();

		const rendererOptions = jest.mocked(createGlobeRenderer).mock.calls[0]?.[0];
		expect(rendererOptions).toEqual(expect.objectContaining({ countries: countryData, size: 400, reducedMotion: false }));
		expect(getCountryGeoJson).toHaveBeenCalledWith(expect.any(AbortSignal));

		act(() => rendererOptions?.onReady());
		expect(container.querySelector<HTMLElement>('[data-globe-stage]')?.dataset.ready).toBe('true');

		act(() => root.unmount());

		expect(ResizeObserverMock.instances[0]?.disconnect).toHaveBeenCalledTimes(1);
		expect(rendererHandle.dispose).toHaveBeenCalledTimes(1);
	});

	it('keeps the fallback visible when WebGL initialization fails', async () => {
		jest.mocked(createGlobeRenderer).mockRejectedValue(new Error('WebGL unavailable'));

		renderGlobe(root);
		await flushAsync();

		expect(container.querySelector<HTMLElement>('[data-globe-stage]')?.dataset.ready).toBe('false');

		act(() => root.unmount());
	});

	it('initializes the sphere without countries when GeoJSON is unavailable', async () => {
		jest.mocked(getCountryGeoJson).mockResolvedValue({
			success: false,
			error: 'Country GeoJSON is not a valid FeatureCollection.',
		});

		renderGlobe(root);
		await flushAsync();

		expect(createGlobeRenderer).toHaveBeenCalledWith(expect.objectContaining({ countries: null }));
		expect(container.querySelector<HTMLElement>('[data-globe-stage]')?.dataset.ready).toBe('false');

		act(() => root.unmount());
	});

	it('disables auto-rotation when reduced motion is requested', async () => {
		jest.mocked(usePrefersReducedMotion).mockReturnValue(true);

		renderGlobe(root);
		await flushAsync();

		expect(createGlobeRenderer).toHaveBeenCalledWith(expect.objectContaining({ reducedMotion: true }));

		act(() => root.unmount());
	});
});
