import { useSyncExternalStore } from 'react';

const visibleForms = new Set<Element>();
const listeners = new Set<() => void>();
let observer: IntersectionObserver | null = null;

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

const getObserver = () => {
	observer ??= new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				visibleForms.add(entry.target);
			} else {
				visibleForms.delete(entry.target);
			}
		}
		notify();
	});

	return observer;
};

/** Ref callback for every donation form, so the donation bar can step aside while one is on screen. */
export const observeDonationForm = (element: HTMLElement | null) => {
	if (!element) {
		return;
	}

	const formObserver = getObserver();
	formObserver.observe(element);

	return () => {
		formObserver.unobserve(element);
		visibleForms.delete(element);
		notify();
	};
};

export const useDonationFormInView = () =>
	useSyncExternalStore(
		subscribe,
		() => visibleForms.size > 0,
		() => false,
	);
