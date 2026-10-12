/** @jest-environment jsdom */

import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { Breadcrumb, truncateBreadcrumbLabel } from './breadcrumb';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
window.matchMedia = (): MediaQueryList => ({
	matches: false,
	media: '',
	onchange: null,
	addListener: () => undefined,
	removeListener: () => undefined,
	addEventListener: () => undefined,
	removeEventListener: () => undefined,
	dispatchEvent: () => true,
});

describe('truncateBreadcrumbLabel', () => {
	test.each([
		['Privacy Policy', 20, 'Privacy Policy'],
		['Universal Basic Income', 20, 'Universal Basic…'],
		['Recipient Selection Process', 20, 'Recipient Selection…'],
		['Supercalifragilisticexpialidocious', 20, 'Supercalifragilistic…'],
		['Privacy Policy', 12, 'Privacy Policy'],
		['Universal Basic Income', 12, 'Universal Basic…'],
		['Recipient Selection Process', 12, 'Recipient Selection…'],
		['Supercalifragilisticexpialidocious', 12, 'Supercalifra…'],
	])('truncates %s at %d characters', (label, limit, expected) => {
		expect(truncateBreadcrumbLabel(label, limit)).toBe(expected);
	});

	test.each([
		['Short', 12],
		['Exactly twelve', 14],
		['Exactly twenty chars', 20],
	])('preserves labels at or below the limit', (label, limit) => {
		expect(truncateBreadcrumbLabel(label, limit)).toBe(label);
	});

	test('keeps complete words before the boundary', () => {
		expect(truncateBreadcrumbLabel('One two threeeeee', 12)).toBe('One two…');
		expect(truncateBreadcrumbLabel('One    two threeeeee', 12)).toBe('One two…');
		expect(truncateBreadcrumbLabel('Longword Another', 8)).toBe('Longword…');
		expect(truncateBreadcrumbLabel('One two three', 7)).toBe('One two…');
	});

	test('continues through the word that crosses the boundary', () => {
		expect(truncateBreadcrumbLabel('Privacy Policy', 12)).toBe('Privacy Policy');
		expect(truncateBreadcrumbLabel('Universal Basic Income', 12)).toBe('Universal Basic…');
		expect(truncateBreadcrumbLabel('Alpha Bravo', 10)).toBe('Alpha Bravo');
		expect(truncateBreadcrumbLabel('Supercalifragilistic Another', 12)).toBe('Supercalifra…');
		expect(truncateBreadcrumbLabel('Supercalifragilistic Another', 20)).toBe('Supercalifragilistic…');
	});

	test('trims labels before splitting words', () => {
		expect(truncateBreadcrumbLabel('  Universal Basic Income  ', 12)).toBe('Universal Basic…');
		expect(truncateBreadcrumbLabel('  Short  ', 12)).toBe('Short');
	});

	test('uses the character limit for a single long word', () => {
		expect(truncateBreadcrumbLabel('Supercalifragilisticexpialidocious', 20)).toBe('Supercalifragilistic…');
		expect(truncateBreadcrumbLabel('Supercalifragilisticexpialidocious', 12)).toBe('Supercalifra…');
	});
});

describe('Breadcrumb', () => {
	test('keeps a visible ellipsis when no full candidate fits', () => {
		const container = document.createElement('div');
		const root = createRoot(container);
		const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
		Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
			configurable: true,
			get(this: HTMLElement) {
				return this.textContent === '…' ? 1 : 100;
			},
		});

		act(() =>
			root.render(
				<Breadcrumb
					links={[
						{ href: '/', label: 'Home' },
						{ href: '/parent', label: 'A parent breadcrumb label' },
						{ href: '/current', label: 'Current page' },
					]}
				/>,
			),
		);

		const parentLink = container.querySelector<HTMLAnchorElement>('a[title="A parent breadcrumb label"]');
		const visibleLabel = parentLink?.querySelector('span[aria-hidden="true"]');

		expect(parentLink).not.toBeNull();
		expect(visibleLabel?.textContent).toBe('…');

		act(() => root.unmount());
		if (offsetWidth) {
			Object.defineProperty(HTMLElement.prototype, 'offsetWidth', offsetWidth);
		}
	});
});
