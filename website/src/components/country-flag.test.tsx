/** @jest-environment jsdom */

import { CountryFlag } from '@/components/country-flag';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ alt, onError }: { alt: string; onError?: () => void }) => (
		<button type="button" data-testid="flag-image" data-alt={alt} onClick={onError} />
	),
}));

describe('CountryFlag', () => {
	test('resets the image error fallback when the country changes', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() => root.render(<CountryFlag country="CH" />));
		act(() => container.querySelector<HTMLButtonElement>('[data-testid="flag-image"]')?.click());
		expect(container.textContent).toBe('CH');

		act(() => root.render(<CountryFlag country="DE" />));
		expect(container.querySelector('[data-testid="flag-image"]')).not.toBeNull();
		expect(container.textContent).not.toBe('CH');

		act(() => root.unmount());
	});

	test('hides decorative flags from assistive technology', () => {
		const container = document.createElement('div');
		const root = createRoot(container);

		act(() => root.render(<CountryFlag country="CH" decorative />));

		expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
		expect(container.querySelector('[data-testid="flag-image"]')?.getAttribute('data-alt')).toBe('');

		act(() => root.unmount());
	});
});
