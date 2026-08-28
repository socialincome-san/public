/** @jest-environment jsdom */

import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import { act, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { clearBadgeSlot, createBadgeSlotElement, mountBadgeContent } from './globe-badge';
import type { GlobeRendererHandle } from './globe-renderer';
import type { useBadgePlayback as UseBadgePlayback } from './use-badge-playback';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@/lib/types/country', () => ({
	isValidCountryCode: (code: string) => ['CH', 'DE', 'US', 'FR'].includes(code),
}));

jest.mock('@/lib/types/country-centroids', () => ({
	getCountryCentroid: (code: string) => {
		const centroids: Record<string, { lat: number; lng: number }> = {
			CH: { lat: 46.82, lng: 8.23 },
			DE: { lat: 51.17, lng: 10.45 },
			US: { lat: 37.09, lng: -95.71 },
			FR: { lat: 46.23, lng: 2.21 },
		};

		return centroids[code] ?? null;
	},
}));

const makeContribution = (overrides: Partial<GlobeContribution> = {}): GlobeContribution => ({
	key: 'cid-1',
	amount: 42,
	currency: 'CHF',
	contributedAt: '2026-08-10T14:32:00.000Z',
	countryCode: 'CH',
	countryName: 'Switzerland',
	...overrides,
});

type TestRenderer = jest.Mocked<GlobeRendererHandle> & {
	maxConcurrentBadges: number;
	setPointOfView: (next: { lat: number; lng: number }) => void;
};

const createRenderer = (
	pov: { lat: number; lng: number; altitude: number } = { lat: 46.82, lng: 8.23, altitude: 1.72 },
): TestRenderer => {
	const slots = Array.from({ length: 6 }, () => createBadgeSlotElement());
	let activeCount = 0;
	let pointOfView = pov;

	const renderer: TestRenderer = {
		maxConcurrentBadges: 0,
		setPointOfView: (next: { lat: number; lng: number }) => {
			pointOfView = { ...pointOfView, ...next };
		},
		resize: jest.fn(),
		setReducedMotion: jest.fn(),
		activateBadgeSlot: jest.fn((slotIndex, params) => {
			const slot = slots[slotIndex];
			if (!slot) {
				return;
			}
			clearBadgeSlot(slot);
			mountBadgeContent(slot, params.contribution, 'en-US', params.animate ?? true);
			activeCount++;
			renderer.maxConcurrentBadges = Math.max(renderer.maxConcurrentBadges, activeCount);
		}),
		deactivateBadgeSlot: jest.fn((slotIndex) => {
			const slot = slots[slotIndex];
			if (slot) {
				clearBadgeSlot(slot);
			}
			activeCount = Math.max(0, activeCount - 1);
		}),
		getPointOfView: jest.fn(() => pointOfView),
		dispose: jest.fn(),
	};

	return renderer;
};

let useBadgePlayback: typeof UseBadgePlayback;

beforeAll(async () => {
	({ useBadgePlayback } = await import('./use-badge-playback'));
});

type HookProps = {
	contributions: GlobeContribution[];
	renderer: GlobeRendererHandle | null;
	reducedMotion: boolean;
};

const TestComponent = ({ contributions, renderer, reducedMotion }: HookProps) => {
	const rendererRef = useRef(renderer);
	useBadgePlayback({ contributions, rendererRef, reducedMotion });

	return null;
};

const renderHook = (props: HookProps): { root: Root; container: HTMLDivElement } => {
	const container = document.createElement('div');
	document.body.append(container);
	const root = createRoot(container);
	act(() => {
		root.render(<TestComponent {...props} />);
	});

	return { root, container };
};

const flushBadgeSync = () => {
	act(() => {
		jest.advanceTimersByTime(100);
	});
};

describe('useBadgePlayback', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
		jest.clearAllMocks();
		document.body.replaceChildren();
	});

	it('does not throw when contributions list is empty', () => {
		const renderer = createRenderer();
		expect(() => renderHook({ contributions: [], renderer, reducedMotion: false })).not.toThrow();
	});

	it('skips contributions with unmapped country codes and logs a warning', () => {
		const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const renderer = createRenderer();

		renderHook({
			contributions: [makeContribution({ countryCode: 'XX' })],
			renderer,
			reducedMotion: false,
		});

		expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('skipped 1'));
	});

	it('activates a badge while its position is visible on the globe', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: false,
		});

		flushBadgeSync();

		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(1);

		act(() => root.unmount());
		container.remove();
	});

	it('keeps a badge active while its position stays visible', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: false,
		});

		flushBadgeSync();
		flushBadgeSync();
		flushBadgeSync();

		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(1);
		expect(renderer.deactivateBadgeSlot).not.toHaveBeenCalled();

		act(() => root.unmount());
		container.remove();
	});

	it('deactivates a badge when its position leaves the visible cone', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: false,
		});

		flushBadgeSync();
		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(1);

		renderer.setPointOfView({ lat: -45, lng: 120 });
		flushBadgeSync();

		expect(renderer.deactivateBadgeSlot).toHaveBeenCalledWith(0);

		act(() => root.unmount());
		container.remove();
	});

	it('reactivates a badge when its position becomes visible again', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: false,
		});

		flushBadgeSync();
		renderer.setPointOfView({ lat: -45, lng: 120 });
		flushBadgeSync();
		renderer.setPointOfView({ lat: 46.82, lng: 8.23 });
		flushBadgeSync();

		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(2);
		expect(renderer.deactivateBadgeSlot).toHaveBeenCalledTimes(1);

		act(() => root.unmount());
		container.remove();
	});

	it('does not exceed six active badge slots', () => {
		const renderer = createRenderer();
		const contributions = Array.from({ length: 20 }, (_, i) => makeContribution({ key: `cid-${i}`, countryCode: 'CH' }));

		const { root, container } = renderHook({ contributions, renderer, reducedMotion: false });

		flushBadgeSync();

		expect(renderer.maxConcurrentBadges).toBeLessThanOrEqual(6);

		act(() => root.unmount());
		container.remove();
	});

	it('does not activate duplicate slots for the same contribution key', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: false,
		});

		for (let i = 0; i < 5; i++) {
			flushBadgeSync();
		}

		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(1);

		act(() => root.unmount());
		container.remove();
	});

	it('pauses badge syncing when document is hidden', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: false,
		});

		flushBadgeSync();
		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(1);

		Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
		flushBadgeSync();

		expect(renderer.deactivateBadgeSlot).toHaveBeenCalledWith(0);

		act(() => root.unmount());
		container.remove();
	});

	it('shows visible badges without animation when reduced motion is enabled', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: true,
		});

		flushBadgeSync();

		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(1);
		expect(renderer.activateBadgeSlot).toHaveBeenCalledWith(0, expect.objectContaining({ animate: false }));

		flushBadgeSync();
		expect(renderer.activateBadgeSlot).toHaveBeenCalledTimes(1);

		act(() => root.unmount());
		container.remove();

		expect(renderer.deactivateBadgeSlot).toHaveBeenCalledWith(0);
	});

	it('clears all badge slots on cleanup', () => {
		const renderer = createRenderer();
		const { root, container } = renderHook({
			contributions: [makeContribution()],
			renderer,
			reducedMotion: false,
		});

		flushBadgeSync();

		act(() => root.unmount());
		container.remove();

		expect(renderer.deactivateBadgeSlot).toHaveBeenCalledWith(0);
	});
});
