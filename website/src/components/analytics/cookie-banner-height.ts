import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let height = 0;
let observer: ResizeObserver | null = null;

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

/** Ref callback for the cookie banner, so overlays in the same corner can stay above it. */
export const observeCookieBanner = (element: HTMLElement | null) => {
	if (!element) {
		return;
	}

	observer ??= new ResizeObserver((entries) => {
		for (const entry of entries) {
			height = entry.target.getBoundingClientRect().height;
		}
		notify();
	});
	const bannerObserver = observer;
	bannerObserver.observe(element);

	return () => {
		bannerObserver.unobserve(element);
		height = 0;
		notify();
	};
};

/** Height of the cookie banner in px, or 0 while it is not shown. */
export const useCookieBannerHeight = () =>
	useSyncExternalStore(
		subscribe,
		() => height,
		() => 0,
	);
